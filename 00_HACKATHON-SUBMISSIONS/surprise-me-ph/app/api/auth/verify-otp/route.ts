import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { mobile, otp } = await request.json()
  if (!mobile || !otp) return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  if (otp === '123456') return NextResponse.json({ ok: true })
  return NextResponse.json({ ok: false, error: 'Invalid code' }, { status: 400 })
}


