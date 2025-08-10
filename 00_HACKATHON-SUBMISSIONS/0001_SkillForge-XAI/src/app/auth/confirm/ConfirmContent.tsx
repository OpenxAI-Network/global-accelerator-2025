'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (!token_hash || type !== 'email') {
          setStatus('error');
          setMessage('Invalid confirmation link');
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'email'
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else if (data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully!');
          setTimeout(() => router.push('/dashboard'), 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Confirming your email...
            </h1>
            <p className="text-gray-400">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Email Confirmed! 🎉
            </h1>
            <p className="text-gray-400 mb-6">
              {message} You'll be redirected to your dashboard shortly.
            </p>
            <Link
              href="/dashboard"
              className="btn-primary"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Confirmation Failed
            </h1>
            <p className="text-gray-400 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/signup"
                className="block btn-primary"
              >
                Try Signing Up Again
              </Link>
              <Link
                href="/auth/login"
                className="block btn-secondary"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}