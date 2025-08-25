'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, User, Menu, X, Search, Bell, Settings, 
  BarChart3, BookOpen, TrendingUp, Trophy, Mic, LogOut
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  variant?: 'landing' | 'dashboard'
  showSearch?: boolean
  onSearchToggle?: () => void
}

export function Header({ variant = 'landing', showSearch = false, onSearchToggle }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    checkUser()
    setCurrentPath(window.location.pathname)
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get user data from users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        const userInfo = {
          id: user.id,
          email: user.email,
          full_name: userData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          ...userData,
          ...user.user_metadata
        }
        setUser(userInfo)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const dashboardNavItems = [
    { href: '/dashboard', label: 'Overview', icon: BarChart3 },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/insights', label: 'AI Insights', icon: Brain },
    { href: '/voice', label: 'AI Coach', icon: Mic },
  ]

  const landingNavItems = [
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About' },
    { href: '#pricing', label: 'Pricing' },
  ]

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SkillForge-XAI
                </span>
                {variant === 'dashboard' && user && (
                  <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                    Welcome back, {user.full_name}!
                  </p>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {variant === 'landing' ? (
                landingNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                dashboardNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Settings - Dashboard only */}
              {variant === 'dashboard' && (
                <Link
                  href="/settings"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}

              {/* Notifications - Desktop only for authenticated users */}
              {user && (
                <Link
                  href="/notifications"
                  className="hidden md:block relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
                </Link>
              )}

              <ThemeToggle />

              {/* Auth Buttons / Profile */}
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  {variant === 'landing' ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                        title="Go to Dashboard"
                      >
                        <BarChart3 className="w-5 h-5" />
                      </Link>
                      <Link
                        href="/profile"
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow text-sm sm:text-base"
                      >
                        {(() => {
                          if (user?.full_name && user.full_name !== 'User') {
                            return user.full_name.charAt(0).toUpperCase()
                          }
                          if (user?.email) {
                            return user.email.charAt(0).toUpperCase()
                          }
                          return 'U'
                        })()}
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/profile"
                      className="hidden md:flex w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow text-sm sm:text-base"
                    >
                      {(() => {
                        if (user?.full_name && user.full_name !== 'User') {
                          return user.full_name.charAt(0).toUpperCase()
                        }
                        if (user?.email) {
                          return user.email.charAt(0).toUpperCase()
                        }
                        return 'U'
                      })()}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar - Dashboard only */}
          {variant === 'dashboard' && showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
            >
              <div className="relative max-w-md mx-auto md:max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses, achievements, or ask AI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-3 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  autoFocus
                />
                <button
                  onClick={onSearchToggle}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">SkillForge-XAI</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {variant === 'dashboard' ? 'Learning Dashboard' : 'AI Learning Platform'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info - Dashboard only */}
              {variant === 'dashboard' && user && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg leading-none">
                      {(() => {
                        if (user?.full_name && user.full_name !== 'User') {
                          return user.full_name.charAt(0).toUpperCase()
                        }
                        if (user?.email) {
                          return user.email.charAt(0).toUpperCase()
                        }
                        return 'U'
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{user.full_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="p-6 space-y-2">
                {variant === 'landing' ? (
                  <>
                    {landingNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                    {user ? (
                      <>
                        <Link
                          href="/notifications"
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Bell className="w-5 h-5" />
                          <span>Notifications</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut()
                            setMobileMenuOpen(false)
                            window.location.href = '/'
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Get Started
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {dashboardNavItems.map((item) => {
                      const Icon = item.icon
                      const isActive = currentPath === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}

                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    {user && (
                      <>
                        <Link
                          href="/notifications"
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Bell className="w-5 h-5" />
                          <span>Notifications</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut()
                            setMobileMenuOpen(false)
                            window.location.href = '/'
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}