import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthPage } from '../auth-page';
import { AuthProvider } from '../auth-context';

// Mock the useAuth hook
jest.mock('../auth-context', () => ({
  ...jest.requireActual('../auth-context'),
  useAuth: () => ({
    login: jest.fn().mockResolvedValue(true),
    signup: jest.fn().mockResolvedValue(true),
  }),
}));

describe('AuthPage', () => {
  describe('Signup Form Validation', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        );
      });
      // Switch to signup form
      await act(async () => {
        fireEvent.click(screen.getByText('Sign up'));
      });
    });

    it('should show required error for name', async () => {
      const nameInput = screen.getByLabelText('Full Name');
      await act(async () => {
        fireEvent.blur(nameInput);
      });
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
    });

    it('should show invalid email error', async () => {
      const emailInput = screen.getByLabelText('Email Address');
      await act(async () => {
        await userEvent.type(emailInput, 'invalid-email');
        fireEvent.blur(emailInput);
      });
      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should show password too short error', async () => {
      const passwordInput = screen.getByLabelText('Password');
      await act(async () => {
        await userEvent.type(passwordInput, '123');
        fireEvent.blur(passwordInput);
      });
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should show passwords do not match error', async () => {
      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, 'password123');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      await userEvent.type(confirmPasswordInput, 'password456');
      await act(async () => {
        fireEvent.click(screen.getByText('Create Account'));
      });
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Login Form Validation', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        );
      });
    });

    it('should show invalid email error', async () => {
      const emailInput = screen.getByLabelText('Email Address');
      await act(async () => {
        await userEvent.type(emailInput, 'invalid-email');
        fireEvent.blur(emailInput);
      });
      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should show required error for password', async () => {
      const passwordInput = screen.getByLabelText('Password');
      await act(async () => {
        fireEvent.blur(passwordInput);
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Sign In'));
      });
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });
  });
});