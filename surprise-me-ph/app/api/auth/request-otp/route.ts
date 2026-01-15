import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { fullName, mobile } = await request.json()
  if (!fullName || !mobile) return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  // Mock OTP: always 123456 for demo
  return NextResponse.json({ ok: true, otpHint: '123456' })
}


