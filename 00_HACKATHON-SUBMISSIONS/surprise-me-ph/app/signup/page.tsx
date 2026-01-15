'use client'

import { useState } from 'react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otp, setOtp] = useState('')
  const [serverMsg, setServerMsg] = useState('')

  const isValidPH = (num: string) => {
    const parsed = parsePhoneNumberFromString(num, 'PH')
    return parsed?.isValid() && parsed.country === 'PH'
  }

  const submit = async () => {
    if (!fullName.trim()) return setServerMsg('Please enter full name.')
    if (!isValidPH(mobile)) return setServerMsg('Enter a valid PH mobile (e.g., +63 917 123 4567).')
    setServerMsg('')
    const res = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, mobile, email }) })
    const data = await res.json()
    if (data.ok) setStep('otp')
    else setServerMsg(data.error || 'Failed to request OTP')
  }

  const verify = async () => {
    const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile, otp }) })
    const data = await res.json()
    if (data.ok) setServerMsg('Account verified! You can now place orders.')
    else setServerMsg(data.error || 'Invalid OTP')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Create your account</h1>
      {step === 'form' ? (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <input className="w-full border rounded-lg p-3" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
          <input className="w-full border rounded-lg p-3" placeholder="Mobile number (PH)" value={mobile} onChange={e=>setMobile(e.target.value)} />
          <input className="w-full border rounded-lg p-3" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
          {serverMsg && <p className="text-sm text-red-600">{serverMsg}</p>}
          <button className="btn-primary" onClick={submit}>Send verification code</button>
          <p className="text-xs text-gray-500">We’ll text your PH number for order updates and reminders.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <p className="text-sm text-gray-600">We sent a 6-digit code to {mobile}. Enter it below:</p>
          <input className="w-full border rounded-lg p-3 tracking-widest text-center" placeholder="••••••" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} />
          {serverMsg && <p className="text-sm text-red-600">{serverMsg}</p>}
          <button className="btn-primary" onClick={verify}>Verify</button>
          <button className="px-4 py-2 rounded-lg border" onClick={()=>setStep('form')}>Edit number</button>
        </div>
      )}
    </div>
  )
}


