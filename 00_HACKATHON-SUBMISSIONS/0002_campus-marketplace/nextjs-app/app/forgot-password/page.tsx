"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';

type ForgotPasswordState = 'ENTER_EMAIL' | 'VERIFY_OTP' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const [authState, setAuthState] = useState<ForgotPasswordState>('ENTER_EMAIL');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { forgotPasswordInit, forgotPasswordVerify } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await forgotPasswordInit(email);
    setLoading(false);
    if (result.success) {
      setAuthState('VERIFY_OTP');
    } else {
      setError(result.message || 'Failed to send reset instructions.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = (e.target as any).otp.value;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await forgotPasswordVerify(email, otp, newPassword);
    setLoading(false);

    if (result.success) {
      setAuthState('SUCCESS');
    } else {
      setError(result.message || 'Failed to reset password.');
    }
  };

  const renderState = () => {
    switch (authState) {
      case 'VERIFY_OTP':
        return (
          <div className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-h3 font-bold">Verify & Reset</h2>
              <p className="text-text-secondary mt-2">Enter the code sent to <strong className="text-text-primary">{email}</strong> and set a new password.</p>
            </div>
            <form onSubmit={handleResetSubmit} className="space-y-6 card">
              <div>
                <label htmlFor="otp" className="sr-only">Verification Code</label>
                <input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6} className="input-field text-center tracking-[0.5em]" placeholder="_ _ _ _ _ _" required />
              </div>
              <div>
                <label htmlFor="newPassword" className="sr-only">New Password</label>
                <input id="newPassword" name="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="New Password" required />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="Confirm New Password" required />
              </div>
              {error && <p className="text-error text-sm text-center">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="text-center card">
            <h2 className="text-h3 font-bold mb-4">Password Reset!</h2>
            <p className="text-text-secondary mb-6">Your password has been successfully updated.</p>
            <Link href="/" className="btn-primary w-full">Return to Login</Link>
          </div>
        );
      case 'ENTER_EMAIL':
      default:
        return (
          <div className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-h3 font-bold">Forgot Your Password?</h2>
              <p className="text-text-secondary mt-2">Enter your email and we'll send you a reset code.</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-6 card">
              <div>
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="your.email@university.edu" required />
              </div>
              {error && <p className="text-error text-sm text-center">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <motion.div 
        key={authState}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {renderState()}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-text-secondary hover:text-primary-accent transition-colors">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}