import { jwtVerify } from 'jose';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('Warning: JWT_SECRET is not set. Using a default, insecure key.');
    return new TextEncoder().encode('default-insecure-jwt-secret-key-for-hackathon');
  }
  return new TextEncoder().encode(secret);
};

export async function updateUserProfile(token: string | undefined, body: any) {
  if (!token) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }

  try {
    console.log('updateUserProfile: Token:', token);
    const secretKey = getJwtSecretKey();
    console.log('updateUserProfile: Secret (first 5 chars):', new TextDecoder().decode(secretKey).substring(0, 5));
    const { payload } = await jwtVerify(token, secretKey);
    const userId = payload.userId as string;

    if (!userId) {
      return { status: 401, body: { error: 'Invalid token payload' } };
    }

    const response = await fetch(`${AUTH_SERVICE_URL}/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { status: response.status, body: { error: errorData.error || 'Failed to update profile' } };
    }

    const updatedUser = await response.json();
    return { status: 200, body: updatedUser };

  } catch (error) {
    if (error instanceof Error && error.name === 'JWTExpired') {
        return { status: 401, body: { error: 'Invalid token' } };
    }
    console.error('API_PROFILE_UPDATE_ERROR:', error);
    return { status: 500, body: { error: 'An internal server error occurred' } };
  }
}
