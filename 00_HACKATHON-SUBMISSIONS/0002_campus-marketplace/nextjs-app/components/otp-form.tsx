"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface OtpFormProps {
  email: string;
  flow: 'SIGNUP' | 'FORGOT_PASSWORD';
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>;
  onResend: () => Promise<void>;
  onCancel: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({ email, onVerify, onResend, onCancel }: OtpFormProps) {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (!/^[0-9]$/.test(value) && value !== '') return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^[0-9]{6}$/.test(pasteData)) {
      setOtp(pasteData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await onVerify(otpCode);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'An unknown error occurred.');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN_SECONDS);
    await onResend();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="card">
        <div className="text-center mb-8">
          <h2 className="text-h3 font-bold text-text-primary">Verify Your Email</h2>
          <p className="text-text-secondary mt-2">
            Enter the 6-digit code sent to <strong className="text-text-primary">{email}</strong>.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="input-field w-12 h-14 text-center text-2xl font-bold rounded-lg focus:border-primary-accent focus:shadow-[0_0_10px_-5px_var(--color-primary-accent)]"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <button onClick={handleResend} className="font-semibold text-primary-accent hover:underline disabled:text-text-secondary disabled:cursor-not-allowed transition-colors" disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
          </button>
          <span className="text-text-secondary mx-2">|</span>
          <button onClick={onCancel} className="font-semibold text-primary-accent hover:underline">Cancel</button>
        </div>
      </div>
    </motion.div>
  );
}