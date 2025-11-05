"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from "lucide-react";
import { useAuth } from "./auth-context";
import { z } from "zod";
import { OtpForm } from "./otp-form";

// --- Zod Schemas (no change) ---
const signupSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  school: z.string().min(1, "School is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

// --- Component State Types (no change) ---
type AuthState = 'LOGIN' | 'SIGNUP' | 'OTP_VERIFICATION';
type SignupData = z.infer<typeof signupSchema>;
let signupData: Partial<SignupData> = {};

export function AuthPage() {
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { login, signupInit, signupVerify, resendOtp } = useAuth();

  // --- Logic (mostly unchanged, just adapted for new state) ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFormErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const isLogin = authState === 'LOGIN';
    const schema = isLogin ? loginSchema : signupSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string> = {};
      if (result.error && result.error.errors) {
        result.error.errors.forEach(err => {
          if (err.path[0]) errors[err.path[0]] = err.message;
        });
      } else {
        // Fallback for unexpected error structure
        console.error("Unexpected Zod error structure:", result.error);
        errors.general = "An unexpected validation error occurred.";
      }
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const loginResult = await login(result.data.email, result.data.password);
        if (!loginResult.success) {
          setError(loginResult.message || "Invalid email or password.");
        }
      } else {
        // For signup, we store the validated data and move to OTP
        signupData = result.data;
        const initResult = await signupInit(result.data.email);
        if (initResult.success) {
          setAuthState('OTP_VERIFICATION');
        } else {
          setError(initResult.message || "Failed to start signup process.");
        }
      }
    } catch (err) { setError("An unexpected error occurred."); }
    finally { setLoading(false); }
  };

  const handleOtpVerify = async (otp: string) => {
    const { name, email, password, school } = signupData as SignupData;
    if (!name || !email || !password || !school) {
      setError("Something went wrong. Please try signing up again.");
      setAuthState('SIGNUP');
      return { success: false, message: "Missing signup data." };
    }
    const result = await signupVerify(email, otp, name, password, school);
    return { success: result.success, message: result.message };
  };

  // --- Render Logic (Re-skinned) ---

  if (authState === 'OTP_VERIFICATION' && signupData.email) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <OtpForm 
          email={signupData.email}
          flow="SIGNUP"
          onVerify={handleOtpVerify}
          onResend={() => resendOtp(signupData.email!, 'SIGNUP')}
          onCancel={() => setAuthState('SIGNUP')}
        />
      </div>
    );
  }

  const isLogin = authState === 'LOGIN';
  const schools = ["Adamson University", "Ateneo de Manila University", "De La Salle University", "Mapúa University", "Polytechnic University of the Philippines", "University of the Philippines Diliman", "University of Santo Tomas", "Other"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <motion.div 
        key={authState} // Animate when switching between login/signup
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-h2 font-bold text-text-primary">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-text-secondary mt-2">
            {isLogin ? 'Sign in to access the marketplace' : 'Join a secure, student-only marketplace'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input id="name" name="name" type="text" placeholder="Full Name" className="input-field" />
                {formErrors.name && <p className="text-error text-xs mt-1">{formErrors.name}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
              <input id="email" name="email" type="email" placeholder="Email Address" className="input-field" />
              {formErrors.email && <p className="text-error text-xs mt-1">{formErrors.email}</p>}
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="school" className="sr-only">School/University</label>
                <select id="school" name="school" className="input-field">
                  <option value="">Select your school</option>
                  {schools.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {formErrors.school && <p className="text-error text-xs mt-1">{formErrors.school}</p>}
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" className="input-field" />
              {formErrors.password && <p className="text-error text-xs mt-1">{formErrors.password}</p>}
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" className="input-field" />
                {formErrors.confirmPassword && <p className="text-error text-xs mt-1">{formErrors.confirmPassword}</p>}
              </div>
            )}

            {error && <p className="text-error text-sm text-center">{error}</p>}

            <button type="submit" className="w-full btn-primary" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-text-secondary">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => {
                  setAuthState(isLogin ? 'SIGNUP' : 'LOGIN');
                  setError('');
                  setFormErrors({});
                  // Clear form data on mode switch
                  signupData = {}; 
                }} 
                className="font-semibold text-primary-accent hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            {isLogin && (
              <p className="mt-2">
                <Link href="/forgot-password">
                  <span className="font-semibold text-primary-accent hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </Link>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
