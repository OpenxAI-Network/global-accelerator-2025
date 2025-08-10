'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  Brain, Zap, Users, Trophy, ArrowRight, BookOpen, Sparkles, 
  Rocket, Target, Globe, Award, Star, ChevronDown, Play,
  MessageSquare, BarChart3, Lightbulb, Cpu, Mic, Volume2,
  Code, Database, Shield, Infinity, CheckCircle, User, MicOff,
  Pause, Activity, TrendingUp, Eye, Headphones, VolumeX} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [showLiveDemo, setShowLiveDemo] = useState(false)
  const [liveStats, setLiveStats] = useState({ learners: 2847, courses: 156, success: 97.3 })
  const [demoMessages, setDemoMessages] = useState<Array<{role: string, content: string}>>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    checkUser()
    
    // Page loading simulation
    const loadingTimer = setTimeout(() => {
      setIsPageLoading(false)
    }, 2000)
    
    // Live stats animation
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        learners: prev.learners + Math.floor(Math.random() * 5),
        courses: prev.courses + (Math.random() > 0.95 ? 1 : 0),
        success: Math.min(99.9, prev.success + (Math.random() > 0.9 ? 0.1 : 0))
      }))
    }, 3000)
    
    return () => {
      clearTimeout(loadingTimer)
      clearInterval(interval)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const startVoiceDemo = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setAiResponse('Speech recognition not supported in this browser. Please try Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    setIsListening(true)
    setAiResponse('🎤 Listening... Ask me anything about AI learning!')

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      setIsListening(false)
      setAiResponse('🤔 Processing your question...')
      
      setDemoMessages(prev => [...prev, { role: 'user', content: transcript }])
      
      try {
        const response = await fetch('/api/ai/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: transcript,
            context: 'landing_page_demo',
            learningStyle: 'conversational'
          })
        })
        
        const data = await response.json()
        const aiMessage = data.response || 'I can help you learn faster with personalized AI tutoring!'
        
        setAiResponse(aiMessage)
        setDemoMessages(prev => [...prev, { role: 'assistant', content: aiMessage }])
        
        // Speak the response
        if ('speechSynthesis' in window && !isMuted) {
          speechSynthesis.cancel() // Stop any ongoing speech
          const utterance = new SpeechSynthesisUtterance(aiMessage)
          utterance.rate = 0.9
          utterance.pitch = 1
          speechSynthesis.speak(utterance)
        }
      } catch (error) {
        const fallbackResponse = 'I can help you master any skill with personalized AI tutoring and real-time feedback!'
        setAiResponse(fallbackResponse)
        setDemoMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }])
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      setAiResponse('Sorry, I couldn\'t hear you clearly. Please try again.')
    }

    recognition.start()
  }

  const features = [
    {
      icon: Brain,
      title: 'GPT-4 AI Tutor',
      description: 'Advanced conversational AI that adapts to your learning style in real-time',
      color: 'from-blue-500 to-purple-500',
      stats: '99.7% Accuracy'
    },
    {
      icon: Mic,
      title: 'Voice Learning',
      description: 'Natural speech interaction with OpenAI Whisper & TTS for immersive learning',
      color: 'from-green-500 to-emerald-500',
      stats: '15+ Languages'
    },
    {
      icon: Activity,
      title: 'Real-time Analytics',
      description: 'Live learning insights with predictive AI recommendations and progress tracking',
      color: 'from-orange-500 to-red-500',
      stats: '10x Faster'
    },
    {
      icon: Target,
      title: 'Adaptive Paths',
      description: 'AI-curated curriculum that evolves based on your performance and goals',
      color: 'from-purple-500 to-pink-500',
      stats: '97% Success'
    }
  ]

  if (isPageLoading) {
    return <LoadingScreen message="Initializing AI Learning Platform..." />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          backgroundColor: scrollYProgress.get() > 0.1 ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrollYProgress.get() > 0.1 ? 'blur(12px)' : 'none',
          borderBottom: scrollYProgress.get() > 0.1 ? '1px solid rgba(229, 231, 235, 0.5)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <span className={`text-xl sm:text-2xl font-black transition-all duration-300 ${
                  scrollYProgress.get() > 0.1 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' 
                    : 'text-white drop-shadow-lg'
                }`}>
                  SkillForge-XAI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { href: '#features', label: 'Features' },
                { href: '#about', label: 'About' },
                { href: '#', label: 'Live Demo', onClick: () => setShowLiveDemo(true) },
              ].map((item) => (
                item.onClick ? (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`px-3 py-2 font-medium transition-colors ${
                      scrollYProgress.get() > 0.1 
                        ? 'text-gray-700 hover:text-gray-900' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 font-medium transition-colors ${
                      scrollYProgress.get() > 0.1 
                        ? 'text-gray-700 hover:text-gray-900' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className={`transition-colors ${
                scrollYProgress.get() > 0.1 
                  ? '[&>button]:text-gray-700 [&>button]:hover:text-gray-900' 
                  : '[&>button]:text-white [&>button]:hover:text-white'
              }`}>
                <ThemeToggle />
              </div>

              {/* Desktop Auth Buttons / Profile */}
              <div className="hidden md:flex items-center space-x-3">
                {loading ? (
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                ) : user ? (
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
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow"
                    >
                      {(() => {
                        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || '';
                        return name.charAt(0).toUpperCase() || 'U';
                      })()}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className={`px-4 py-2 font-medium transition-colors ${
                        scrollYProgress.get() > 0.1 
                          ? 'text-gray-700 hover:text-gray-900' 
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  scrollYProgress.get() > 0.1 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Modern Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl z-50 md:hidden border-l border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">SkillForge-XAI</span>
                  </div>
                  <button 
                    onClick={() => setShowMobileMenu(false)} 
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {[
                    { href: '#features', label: 'Features', icon: Rocket },
                    { href: '#about', label: 'About', icon: Lightbulb },
                    { href: '#', label: 'Live Demo', icon: Target, onClick: () => { setShowLiveDemo(true); setShowMobileMenu(false); } },
                  ].map((item) => (
                    item.onClick ? (
                      <motion.button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full flex items-center space-x-3 px-4 py-4 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-200 group"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.label}</span>
                      </motion.button>
                    ) : (
                      <motion.div key={item.href} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          href={item.href}
                          onClick={() => setShowMobileMenu(false)}
                          className="flex items-center space-x-3 px-4 py-4 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-200 group"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.label}</span>
                        </Link>
                      </motion.div>
                    )
                  ))}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                    {user ? (
                      <>
                        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/dashboard"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-4 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-200 group"
                          >
                            <BarChart3 className="w-5 h-5" />
                            <span className="font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Dashboard</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/profile"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-4 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-200 group"
                          >
                            <User className="w-5 h-5" />
                            <span className="font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Profile</span>
                          </Link>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/auth/login"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center space-x-3 px-4 py-4 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-700 rounded-xl transition-all duration-200 group"
                          >
                            <Shield className="w-5 h-5" />
                            <span className="font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Sign In</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href="/auth/signup"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center justify-center space-x-2 px-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
                          >
                            <Rocket className="w-5 h-5" />
                            <span>Get Started</span>
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/aivid.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-purple-800/30 to-purple-900/50"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-3 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-white/30">
                <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">OpenxAI Global Accelerator 2025 Submission</span>
                <span className="sm:hidden">OpenxAI 2025</span>
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
                Revolutionary
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl">
                AI Learning
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
              Experience the future of education with AI-powered personalized learning, 
              voice interaction, and adaptive assessments that evolve with your progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                href={user ? "/dashboard" : "/auth/signup"}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl transition-all transform hover:scale-105 inline-flex items-center justify-center shadow-2xl backdrop-blur-sm"
              >
                <Rocket className="mr-3 w-6 h-6" />
                {user ? "Go to Dashboard" : "Start Learning Free"}
              </Link>
              <button className="px-10 py-5 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 inline-flex items-center justify-center shadow-xl">
                <Play className="mr-3 w-6 h-6" />
                Watch Demo
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto mb-16">
              <motion.div 
                className="text-center p-4 sm:p-8 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                  {liveStats.learners.toLocaleString()}
                </div>
                <div className="text-white/80 text-xs sm:text-sm flex items-center justify-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  Live Learners
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 sm:p-8 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <div className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                  {liveStats.courses}
                </div>
                <div className="text-white/80 text-xs sm:text-sm">
                  AI Courses
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 sm:p-8 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <div className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                  {liveStats.success.toFixed(1)}%
                </div>
                <div className="text-white/80 text-xs sm:text-sm">
                  Success Rate
                </div>
              </motion.div>
            </div>

            {/* Live AI Demo Button */}
            <motion.button
              onClick={() => setShowLiveDemo(!showLiveDemo)}
              className="mb-8 px-12 py-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 text-white rounded-3xl font-bold text-xl transition-all transform hover:scale-110 inline-flex items-center shadow-2xl backdrop-blur-sm border border-white/20"
              whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="mr-3 w-7 h-7" />
              Try Live AI Demo
              <ArrowRight className="ml-3 w-7 h-7" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Live AI Demo Section */}
      <AnimatePresence>
        {showLiveDemo && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-12 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <Rocket className="w-8 h-8" />
                    Live AI Demo - Interactive Learning Experience
                  </h3>
                  <p className="text-white/90 text-lg">
                    Experience revolutionary AI-powered learning in real-time
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Voice Demo */}
                  <div className="bg-white/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Live AI Voice Tutor
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsMuted(!isMuted)
                            if (!isMuted && 'speechSynthesis' in window) {
                              speechSynthesis.cancel() // Stop current speech when muting
                            }
                          }}
                          className={`p-2 rounded-full transition-all ${
                            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                          } text-white shadow-lg`}
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={startVoiceDemo}
                          className={`p-3 rounded-full transition-all ${
                            isListening 
                              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white shadow-lg`}
                        >
                          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4 h-40 overflow-y-auto mb-4">
                      {demoMessages.length > 0 ? (
                        <div className="space-y-2">
                          {demoMessages.slice(-4).map((msg, idx) => (
                            <div key={idx} className={`text-sm ${
                              msg.role === 'user' ? 'text-blue-200' : 'text-white'
                            }`}>
                              <span className="font-medium">
                                {msg.role === 'user' ? 'You: ' : 'AI: '}
                              </span>
                              {msg.content}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-white text-sm">
                          {aiResponse || 'Click the microphone to start a real AI conversation...'}
                        </div>
                      )}
                    </div>
                    <div className="text-white/80 text-xs flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      Try: "What makes AI learning effective?" or "How do I get started?"
                    </div>
                  </div>
                  
                  {/* Real-time Analytics */}
                  <div className="bg-white/20 rounded-2xl p-6">
                    <h4 className="text-white font-bold flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5" />
                      Real-time Analytics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Learning Velocity</span>
                        <span className="text-green-300 font-bold">2.3x</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">AI Confidence</span>
                        <span className="text-blue-300 font-bold">96%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">Retention Rate</span>
                        <span className="text-purple-300 font-bold">94%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                        <motion.div 
                          className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '87%' }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                      </div>
                      <div className="text-white/60 text-xs text-center">Live Progress Tracking</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <button 
                    onClick={() => setShowLiveDemo(false)}
                    className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Close Demo
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                About SkillForge-XAI
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Pioneering the future of AI-powered education with cutting-edge technology and personalized learning experiences.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                We're revolutionizing education by harnessing the power of GPT-4, advanced voice recognition, and real-time analytics to create personalized learning experiences that adapt to each student's unique needs and learning style.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Learners</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">97%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">Built for OpenxAI 2025</h4>
              <p className="mb-6">
                SkillForge-XAI represents the cutting edge of AI education technology, developed specifically for the OpenxAI Global Accelerator 2025 competition in the LearnAI track.
              </p>
              <div className="flex items-center space-x-4">
                <Brain className="w-8 h-8" />
                <div>
                  <div className="font-bold">Advanced AI Integration</div>
                  <div className="text-sm opacity-90">GPT-4 + Whisper + TTS</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'Your data is protected with enterprise-grade security and encryption.'
              },
              {
                icon: Globe,
                title: 'Global Access',
                description: 'Available worldwide with multi-language support and 24/7 accessibility.'
              },
              {
                icon: Infinity,
                title: 'Continuous Innovation',
                description: 'Regular updates with the latest AI advancements and learning methodologies.'
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <Icon className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-bold">CUTTING-EDGE AI TECHNOLOGY</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Revolutionary Learning Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the world's most advanced AI-powered education platform with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${feature.color} text-white`}>
                      {feature.stats}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 w-0 group-hover:w-full transition-all duration-500"
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-10 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-1/3 w-3 h-3 bg-pink-300 rounded-full animate-bounce"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-8">
              <Rocket className="w-6 h-6 text-yellow-300" />
              <span className="font-bold text-lg">OPENXAI GLOBAL ACCELERATOR 2025</span>
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Future of AI Education
              <br />
              <span className="text-yellow-300">Starts Here</span>
            </h2>
            
            <p className="text-xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience revolutionary AI-powered learning with GPT-4 intelligence, voice interaction, 
              real-time analytics, and adaptive learning paths that deliver exceptional results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                href={user ? "/dashboard" : "/auth/signup"}
                className="group bg-white text-blue-600 hover:bg-yellow-300 hover:text-blue-800 font-bold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 inline-flex items-center shadow-2xl"
              >
                <Sparkles className="mr-2 w-6 h-6 group-hover:text-blue-800" />
                {user ? "Continue Learning" : "Start Learning Today"}
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button 
                onClick={() => setShowLiveDemo(true)}
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-bold py-4 px-8 rounded-2xl text-lg transition-all border border-white/30 inline-flex items-center"
              >
                <Play className="mr-2 w-6 h-6" />
                Experience Live Demo
              </button>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Brain className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Learning</h3>
                <p className="text-blue-100">Advanced GPT-4 integration with personalized tutoring and adaptive learning paths</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Mic className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Voice Learning</h3>
                <p className="text-blue-100">Natural voice interaction with OpenAI Whisper and text-to-speech technology</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <BarChart3 className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Real-time Analytics</h3>
                <p className="text-blue-100">Comprehensive learning insights with predictive AI recommendations</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillForge-XAI
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 SkillForge-XAI. Built for OpenxAI Global Accelerator 2025.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}