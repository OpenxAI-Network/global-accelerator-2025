import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { jwtVerify } from 'jose'; // Add this import

// Helper function to get user from token (copied and adapted)
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.error('getUserFromToken: No token found in Authorization header.');
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('getUserFromToken: JWT_SECRET environment variable is not set.');
      return null;
    }
    console.log('getUserFromToken: Token:', token);
    console.log('getUserFromToken: Secret (first 5 chars):', secret.substring(0, 5));
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.userId as number;
  } catch (error) {
    console.error('getUserFromToken: Token verification failed:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  throw new Error('TESTING SERVER LOGS'); // Intentional error for debugging
  console.log('Avatar upload POST handler hit!'); // Add this
  try {
    const userId = await getUserFromToken(req); // Authenticate user
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get('avatar') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename, potentially using userId
    const filename = `${userId}-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const path = join(process.cwd(), 'public', 'avatars', filename);

    await writeFile(path, buffer);

    const url = `/avatars/${filename}`;

    return NextResponse.json({ url }, { status: 200 });

  } catch (error) {
    console.error('AVATAR_UPLOAD_ERROR:', error);
    return NextResponse.json({ error: error.message ?? 'An internal server error occurred' }, { status: 500 });
  }
}