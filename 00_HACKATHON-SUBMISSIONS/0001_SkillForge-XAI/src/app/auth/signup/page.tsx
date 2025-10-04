'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  Mail, Lock, User, Eye, EyeOff, Brain, Sparkles, 
  Rocket, Shield, Zap, Globe, ArrowRight, CheckCircle,
  Github, Chrome, Star, Trophy
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength += 25
    if (/[A-Z]/.test(pass)) strength += 25
    if (/[0-9]/.test(pass)) strength += 25
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25
    return strength
  }

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password))
  }, [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        console.log('✅ Signup successful:', data)
        
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          toast.success('🎉 Account created and verified! You can now sign in.')
        } else {
          toast.success('🎉 Account created! Please check your email to verify, then sign in.')
          console.log('📧 Email confirmation may be required for:', data.user.email)
          
          // Show helpful message for development
          setTimeout(() => {
            toast('💡 No email received? Email verification may be disabled in development mode.', {
              duration: 6000
            })
          }, 3000)
        }
        
        setTimeout(() => router.push('/auth/login'), 2000)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || `Failed to sign up with ${provider}`)
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
              <div className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full">
                🚀 Join OpenxAI 2025
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
                className="inline-flex items-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full px-6 py-3 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-5 h-5 mr-3 text-purple-500" />
                <span className="text-purple-600 dark:text-purple-400 font-bold">🏆 Join the AI Revolution!</span>
              </motion.div>
              
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Start Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  AI Journey
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                Join thousands of learners mastering skills with GPT-4 AI tutoring, voice learning, and personalized education paths.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Brain, title: 'GPT-4 AI Tutoring', desc: 'Personalized learning with advanced AI', color: 'from-purple-500 to-pink-500' },
                { icon: Zap, title: 'Voice Learning', desc: 'Natural conversations with AI tutor', color: 'from-blue-500 to-cyan-500' },
                { icon: Trophy, title: 'Achievement System', desc: 'Gamified learning with rewards', color: 'from-yellow-500 to-orange-500' },
                { icon: Globe, title: 'Global Community', desc: 'Learn with students worldwide', color: 'from-green-500 to-emerald-500' }
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    className="flex items-center space-x-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Stats */}
            <motion.div 
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Join the Revolution</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active Learners</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">500+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">AI Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">97%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Signup Form */}
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Rocket className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  Create Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Start your AI learning adventure today
                </p>
              </div>



              <form onSubmit={handleSignUp} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-5 h-6 w-6 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl py-5 pl-14 pr-5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-5 h-6 w-6 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="email"
                      required
                      className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl py-5 pl-14 pr-5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-5 h-6 w-6 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl py-5 pl-14 pr-14 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg"
                      placeholder="Create a strong password"
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
                  
                  {password && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              passwordStrength < 50 ? 'bg-red-500' : 
                              passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                          {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      <span>Create My Account</span>
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
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-bold hover:from-pink-600 hover:to-blue-600 transition-all duration-300">
                    Sign in →
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
                <span>Your data is protected with enterprise security</span>
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