import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProfileCustomization } from '../profile-customization';
import { useAuth } from '../auth-context';

// Mock the useAuth hook
jest.mock('../auth-context', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('ProfileCustomization', () => {
  const mockOnBack = jest.fn();
  const mockUpdateProfile = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        school: 'Ateneo de Manila University', // Use a value from the list
        bio: 'This is a test bio.',
        phone: '09123456789',
      },
      updateProfile: mockUpdateProfile,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile information correctly', () => {
    render(<ProfileCustomization onBack={mockOnBack} />);

    expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email Address')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('School/University')).toHaveValue('Ateneo de Manila University');
    expect(screen.getByLabelText('Bio')).toHaveValue('This is a test bio.');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('09123456789');
  });

  it('enables form fields when edit button is clicked', async () => {
    render(<ProfileCustomization onBack={mockOnBack} />);

    expect(screen.getByLabelText('Full Name')).toBeDisabled();

    await act(async () => {
        fireEvent.click(screen.getByText('Edit Profile'));
    });

    expect(screen.getByLabelText('Full Name')).toBeEnabled();
  });

  it('calls updateProfile with the correct data on save', async () => {
    render(<ProfileCustomization onBack={mockOnBack} />);

    await act(async () => {
        fireEvent.click(screen.getByText('Edit Profile'));
    });

    const nameInput = screen.getByLabelText('Full Name');
    await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'New Name' } });
    });

    await act(async () => {
        fireEvent.click(screen.getByText('Save Changes'));
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Name',
      })
    );
  });

  it('shows validation errors for invalid data', async () => {
    render(<ProfileCustomization onBack={mockOnBack} />);

    await act(async () => {
        fireEvent.click(screen.getByText('Edit Profile'));
    });

    const nameInput = screen.getByLabelText('Full Name');
    await act(async () => {
        fireEvent.change(nameInput, { target: { value: ' ' } });
    });

    const emailInput = screen.getByLabelText('Email Address');
    await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    });
    
    const phoneInput = screen.getByLabelText('Phone Number');
    await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '123' } });
    });

    await act(async () => {
        fireEvent.click(screen.getByText('Save Changes'));
    });

    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(await screen.findByText('Email is invalid.')).toBeInTheDocument();
    expect(await screen.findByText('Please enter a valid Philippine phone number (e.g., +63 9XX XXX XXXX or 09XX XXX XXXX).')).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});