'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  Mail, Lock, Eye, EyeOff, Brain, 
  LogIn, Shield, Zap, Globe, ArrowRight, CheckCircle,
  Github, Chrome
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error details:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. If you just signed up, email verification may be required.')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link, or contact support if no email was received.')
        } else if (error.message.includes('signup')) {
          toast.error('Account not found. Please sign up first.')
        } else {
          toast.error(`Login failed: ${error.message}`)
        }
        return
      }

      if (data.user) {
        toast.success('🎉 Welcome back to SkillForge-XAI!')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) toast.error(error.message)
    } catch (error) {
      toast.error('OAuth login failed')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">


      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SkillForge-XAI
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                🏆 OpenxAI 2025
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 pt-32 relative z-10">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Marketing */}
          <motion.div 
            className="hidden lg:block space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <motion.div
                className="inline-flex items-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-6 py-3 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-bold">🎯 Welcome Back, AI Pioneer!</span>
              </motion.div>
              
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Continue Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Journey
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                Access your personalized GPT-4 tutor, track progress with real-time analytics, and unlock achievements in the world's most advanced AI learning platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Brain, title: 'GPT-4 AI Tutor', desc: 'Personalized learning paths', color: 'from-blue-500 to-cyan-500' },
                { icon: Zap, title: 'Real-time Analytics', desc: 'Live progress tracking', color: 'from-purple-500 to-pink-500' },
                { icon: Shield, title: 'Secure Learning', desc: 'Enterprise-grade security', color: 'from-green-500 to-emerald-500' },
                { icon: Globe, title: 'Global Community', desc: '10K+ active learners', color: 'from-orange-500 to-red-500' }
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <LogIn className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  Welcome Back
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Sign in to continue your AI learning adventure
                </p>
              </div>



              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-5 h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      required
                      className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl py-5 pl-14 pr-5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-lg"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-5 h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl py-5 pl-14 pr-14 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-5 top-5 h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-all"
                  >
                    Forgot password?
                  </button>
                </motion.div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Sign In to SkillForge-XAI</span>
                    </>
                  )}
                </button>
              </form>

              <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                    Sign up for free →
                  </Link>
                </span>
              </motion.div>

              {/* Security Badge */}
              <motion.div 
                className="mt-8 flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full py-3 px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Shield className="w-4 h-4" />
                <span>Protected by enterprise-grade security</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}