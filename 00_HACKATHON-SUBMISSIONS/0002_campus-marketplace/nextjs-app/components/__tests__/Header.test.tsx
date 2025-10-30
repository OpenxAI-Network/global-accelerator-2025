import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { useAuth } from '../auth-context';

// Mock the useAuth hook
jest.mock('../auth-context', () => ({
  useAuth: jest.fn(),
}));

// Mock the ThemeToggle component as it's not relevant to this test
jest.mock('../theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle-mock" />,
}));

describe('Header', () => {
  it('renders the header with the site title', () => {
    // Provide a mock user object for the useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'Test User', school: 'Test University' },
      logout: jest.fn(),
    });

    render(
      <Header
        onListNewItem={jest.fn()}
        onShowProfile={jest.fn()}
      />
    );

    // Check if the main title is rendered
    const titleElement = screen.getByText(/Campus Marketplace/i);
    expect(titleElement).toBeInTheDocument();

    // Check if the user's school is rendered
    const schoolElement = screen.getByText(/Test University/i);
    expect(schoolElement).toBeInTheDocument();
  });
});
