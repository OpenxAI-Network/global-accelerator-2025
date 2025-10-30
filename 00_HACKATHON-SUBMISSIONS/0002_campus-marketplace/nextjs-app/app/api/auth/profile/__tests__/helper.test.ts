import { updateUserProfile } from '../helper';
import { jwtVerify } from 'jose';

// Mock the dependencies
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

global.fetch = jest.fn();

const mockJwtVerify = jwtVerify as jest.Mock;

describe('updateUserProfile helper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the profile successfully', async () => {
    mockJwtVerify.mockResolvedValue({ payload: { userId: '1' } });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'New Name' }),
    });

    const { status, body } = await updateUserProfile('fake-token', { name: 'New Name' });

    expect(status).toBe(200);
    expect(body).toEqual({ id: '1', name: 'New Name' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/profile/1',
      expect.any(Object)
    );
  });

  it('should return 401 for unauthorized requests', async () => {
    const { status, body } = await updateUserProfile(undefined, { name: 'New Name' });

    expect(status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 500 for invalid tokens', async () => {
    mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

    const { status, body } = await updateUserProfile('fake-token', { name: 'New Name' });

    expect(status).toBe(500);
    expect(body.error).toBe('An internal server error occurred');
  });

  it('should handle errors from the auth service', async () => {
    mockJwtVerify.mockResolvedValue({ payload: { userId: '1' } });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' }),
    });

    const { status, body } = await updateUserProfile('fake-token', { name: 'New Name' });

    expect(status).toBe(500);
    expect(body.error).toBe('Internal Server Error');
  });
});
