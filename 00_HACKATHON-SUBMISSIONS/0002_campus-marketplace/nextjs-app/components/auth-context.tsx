"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ... (User interface remains the same)
interface User {
  id: number;
  name: string;
  email: string;
  school: string;
  verified: boolean;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
}


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; }>;
  signupInit: (email: string) => Promise<{ success: boolean; message?: string; }>;
  signupVerify: (email: string, otp: string, name: string, password: string, school: string) => Promise<{ success: boolean; message?: string; }>;
  forgotPasswordInit: (email: string) => Promise<{ success: boolean; message?: string; }>;
  forgotPasswordVerify: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string; }>;
  resendOtp: (email: string, flow: 'SIGNUP' | 'FORGOT_PASSWORD') => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  loading: boolean;
  networkError: string | null;
  clearNetworkError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const clearNetworkError = () => setNetworkError(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      // ... (rest of fetchUser is the same)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        setNetworkError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem('accessToken', token);
        setUser(user);
        return { success: true };
      }
      // Try to parse error message, but handle cases where body is not JSON
      try {
        const errorData = await response.json();
        return { success: false, message: errorData.error || 'Invalid credentials' };
      } catch (e) {
        return { success: false, message: response.statusText || 'An unknown error occurred' };
      }
    } catch (error) {
      setNetworkError("Unable to connect to the server. Please check your connection.");
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const signupInit = async (email: string): Promise<{ success: boolean; message?: string; }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/signup-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok || response.status === 202) {
        return { success: true };
      }
      try {
        const errorData = await response.json();
        return { success: false, message: errorData.error || 'Failed to send OTP.' };
      } catch (e) {
        return { success: false, message: response.statusText || 'An unknown error occurred' };
      }
    } catch (error) {
      setNetworkError("Unable to connect to the server. Please check your connection.");
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const signupVerify = async (email: string, otp: string, name: string, password: string, school: string): Promise<{ success: boolean; message?: string; }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/signup-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, name, password, school }),
      });
      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem('accessToken', token);
        setUser(user);
        return { success: true };
      }
      try {
        const errorData = await response.json();
        return { success: false, message: errorData.error || 'OTP verification failed.' };
      } catch (e) {
        return { success: false, message: response.statusText || 'An unknown error occurred' };
      }
    } catch (error) {
      setNetworkError("Unable to connect to the server. Please check your connection.");
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };
  
  const resendOtp = async (email: string, flow: 'SIGNUP' | 'FORGOT_PASSWORD') => {
    try {
      await fetch(`${API_BASE_URL}/auth/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, flow }),
      });
    } catch (error) {
      console.error('Resend OTP failed:', error);
    }
  };

  const forgotPasswordInit = async (email: string): Promise<{ success: boolean; message?: string; }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/forgot-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // The backend gives a generic success message to prevent account enumeration
      return { success: response.ok || response.status === 202 };
    } catch (error) {
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const forgotPasswordVerify = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message?: string; }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/forgot-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (response.ok) {
        return { success: true };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.error || 'Failed to reset password.' };
    } catch (error) {
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; message?: string; }> => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user) return { success: false, message: "Not authenticated." };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prevUser => ({ ...prevUser!, ...updatedUser }));
        return { success: true };
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to update profile.";
        setNetworkError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      setNetworkError("Unable to connect to the server. Please check your connection.");
      return { success: false, message: "Unable to connect to the server." };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, login, signupInit, signupVerify, forgotPasswordInit, forgotPasswordVerify, resendOtp, logout, updateProfile, loading, networkError, clearNetworkError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
