import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from './helper';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const body = await req.json();
  const { status, body: responseBody } = await updateUserProfile(token, body);
  return NextResponse.json(responseBody, { status });
}
