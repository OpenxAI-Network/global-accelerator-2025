import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../auth-context';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn();

// A test component that consumes the AuthContext
const TestComponent = () => {
  const { user, signup, logout } = useAuth();

  const handleSignup = () => {
    signup('Test User', 'test@example.com', 'password123', 'Test University');
  };

  const handleLogout = () => {
    logout();
  }

  return (
    <div>
      {user ? (
        <div>
          <p data-testid="user-name">{user.name}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleSignup}>Signup</button>
      )}
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    // Clear mocks before each test
    localStorageMock.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  it('allows a user to sign up and updates the context', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', school: 'Test University' };
    const mockToken = 'mock-jwt-token';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // Initially, the signup button should be there
    const signupButton = screen.getByText('Signup');
    expect(signupButton).toBeInTheDocument();

    // Trigger the signup
    await act(async () => {
      await userEvent.click(signupButton);
    });

    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        school: 'Test University',
      }),
    });

    // Check that the token was stored
    expect(localStorage.getItem('accessToken')).toBe(mockToken);

    // Check that the user's name is now displayed
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });

    // The signup button should be gone
    expect(screen.queryByText('Signup')).not.toBeInTheDocument();
  });

  it('handles network error during user fetch and retries', async () => {
    const mockToken = 'mock-jwt-token';
    localStorageMock.setItem('accessToken', mockToken);

    // Mock fetch to simulate a network error
    (global.fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // Wait for the retries to complete
    await waitFor(() => {
      // Expect fetch to have been called 3 times
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/me', {
      headers: {
        'Authorization': `Bearer ${mockToken}`,
      },
    });

    // The user should be null
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();

    // The token should still be in localStorage
    expect(localStorage.getItem('accessToken')).toBe(mockToken);
  });

  it('handles 401 error during user fetch and logs out', async () => {
    const mockToken = 'invalid-token';
    localStorageMock.setItem('accessToken', mockToken);

    // Mock fetch to simulate a 401 error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // Wait for the fetch to complete
    await waitFor(() => {
      // Expect fetch to have been called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // The user should be null
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();

    // The token should be removed from localStorage
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
