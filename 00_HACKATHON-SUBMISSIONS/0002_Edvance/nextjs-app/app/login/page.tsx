'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Mail, Lock, Eye, EyeOff, Home } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import RegisterForm from '../../components/RegisterForm'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation variables
    let time = 0
    let ripples: Array<{
      x: number
      y: number
      radius: number
      maxRadius: number
      opacity: number
      speed: number
    }> = []

    // Mouse tracking for velocity
    let lastMousePosition = { x: 0, y: 0 }
    let lastMouseTime = 0
    let mouseVelocity = 0

    // Geometric shapes
    let shapes: Array<{
      x: number
      y: number
      size: number
      rotation: number
      vx: number
      vy: number
      type: 'triangle' | 'square' | 'hexagon'
      color: string
    }> = []

    // Initialize geometric shapes
    for (let i = 0; i < 15; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 40 + 20,
        rotation: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        type: ['triangle', 'square', 'hexagon'][Math.floor(Math.random() * 3)] as 'triangle' | 'square' | 'hexagon',
        color: i % 3 === 0 ? '#8B5CF6' : i % 3 === 1 ? '#EC4899' : '#3B82F6'
      })
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now()
      const currentPosition = { x: e.clientX, y: e.clientY }
      
      // Calculate mouse velocity
      if (lastMouseTime > 0) {
        const timeDiff = currentTime - lastMouseTime
        const distance = Math.sqrt(
          Math.pow(currentPosition.x - lastMousePosition.x, 2) + 
          Math.pow(currentPosition.y - lastMousePosition.y, 2)
        )
        mouseVelocity = distance / timeDiff
      }
      
      lastMousePosition = currentPosition
      lastMouseTime = currentTime
      
      // Only create ripples if mouse is moving fast enough
      if (mouseVelocity > 0.1) {
        const velocityScale = Math.min(mouseVelocity * 10, 1)
        const maxRadius = 30 + (velocityScale * 70)
        const speed = 1 + (velocityScale * 2)
        
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 0,
          maxRadius: maxRadius,
          opacity: 0.3 + (velocityScale * 0.4),
          speed: speed
        })
      }
    }

    // Draw geometric shape
    const drawShape = (shape: any) => {
      ctx.save()
      ctx.translate(shape.x, shape.y)
      ctx.rotate(shape.rotation)
      ctx.strokeStyle = shape.color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.3

      switch (shape.type) {
        case 'triangle':
          ctx.beginPath()
          ctx.moveTo(0, -shape.size)
          ctx.lineTo(-shape.size * 0.866, shape.size * 0.5)
          ctx.lineTo(shape.size * 0.866, shape.size * 0.5)
          ctx.closePath()
          ctx.stroke()
          break
        case 'square':
          ctx.strokeRect(-shape.size, -shape.size, shape.size * 2, shape.size * 2)
          break
        case 'hexagon':
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3
            const x = Math.cos(angle) * shape.size
            const y = Math.sin(angle) * shape.size
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.stroke()
          break
      }
      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      time += 0.01

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#0F0F23')
      gradient.addColorStop(0.5, '#1A1A2E')
      gradient.addColorStop(1, '#16213E')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw animated grid
      const gridSize = 60
      const offsetX = (time * 20) % gridSize
      const offsetY = (time * 15) % gridSize

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Update and draw geometric shapes
      shapes.forEach((shape, index) => {
        shape.x += shape.vx
        shape.y += shape.vy
        shape.rotation += 0.01

        if (shape.x < shape.size || shape.x > canvas.width - shape.size) {
          shape.vx *= -1
        }
        if (shape.y < shape.size || shape.y > canvas.height - shape.size) {
          shape.vy *= -1
        }

        shape.x += Math.sin(time + index) * 0.5
        shape.y += Math.cos(time + index * 0.7) * 0.5

        drawShape(shape)
      })

      // Draw connecting lines between nearby shapes
      shapes.forEach((shape1, i) => {
        shapes.slice(i + 1).forEach(shape2 => {
          const distance = Math.sqrt(
            Math.pow(shape1.x - shape2.x, 2) + Math.pow(shape1.y - shape2.y, 2)
          )
          
          if (distance < 150) {
            const opacity = (150 - distance) / 150 * 0.2
            ctx.beginPath()
            ctx.moveTo(shape1.x, shape1.y)
            ctx.lineTo(shape2.x, shape2.y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      // Draw floating particles
      for (let i = 0; i < 80; i++) {
        const x = (i * 37 + time * 30) % canvas.width
        const y = (i * 73 + Math.sin(time + i) * 15) % canvas.height
        const size = Math.sin(time + i) * 1 + 2
        
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${0.4 + Math.sin(time + i) * 0.2})`
        ctx.fill()
      }

      // Update and draw ripples
      ripples = ripples.filter(ripple => {
        ripple.radius += ripple.speed
        ripple.opacity -= 0.02

        if (ripple.opacity <= 0) return false

        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(139, 92, 246, ${ripple.opacity})`
        ctx.lineWidth = 2
        ctx.stroke()

        return true
      })

      // Draw data flow lines
      for (let i = 0; i < 5; i++) {
        const startX = 0
        const startY = (canvas.height / 6) * (i + 1)
        const endX = canvas.width
        const endY = startY + Math.sin(time + i) * 50
        
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = `rgba(236, 72, 153, ${0.1 + Math.sin(time + i) * 0.05})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      requestAnimationFrame(animate)
    }

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove)
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const validateUniversityEmail = (email: string) => {
    // Check if it's a university email (contains .edu or common university domains)
    const universityDomains = [
      '.edu',
      'university',
      'college',
      'academic',
      'student'
    ]
    return universityDomains.some(domain => email.toLowerCase().includes(domain))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate email format
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Authenticate with database
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: email.split('@')[0].replace(/[0-9]/g, '').replace(/[._]/g, ' '),
          role: 'student', // Default for new users
          isDemo: email.includes('student@university.edu') || email.includes('teacher@university.edu'),
          password
        })
      })

      const data = await response.json()
      
      if (data.user) {
        login({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role.toLowerCase(),
          isDemo: data.user.isDemo
        })
        router.push('/')
        return
      } else if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Authentication failed. Please try again.')
      setLoading(false)
      return
    }

    setError('Authentication failed. Please check your credentials.')
    setLoading(false)
  }

  const handleDemoLogin = (type: 'student' | 'teacher') => {
    if (type === 'student') {
      setEmail('student@university.edu')
      setPassword('Alice102!')
    } else {
      setEmail('teacher@university.edu')
      setPassword('Chen102!')
    }
  }

  // Handle switching back to login
  const handleBackToLogin = () => {
    setShowRegister(false)
    setError('')
  }

  const handleGoHome = () => {
    router.push('/home')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: -1 }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            {/* Go Home Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-white/10 hover:text-white transition-colors duration-200 border border-white/20"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>
            
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">
              {showRegister ? 'Join Us' : 'Welcome Back'}
            </h2>
            <p className="mt-2 text-white/70">
              {showRegister 
                ? 'Create your AI Discussion Forum account' 
                : 'Sign in to your AI Discussion Forum account'
              }
            </p>
          </div>

          {/* Conditional Form Rendering */}
          {showRegister ? (
            <RegisterForm onBackToLogin={handleBackToLogin} />
          ) : (
            /* Login Form */
          <div className="bg-black/20 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-white/10">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  University Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-md leading-5 bg-black/30 text-white placeholder-white/50 focus:outline-none focus:placeholder-white/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-sm"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-white/20 rounded-md leading-5 bg-black/30 text-white placeholder-white/50 focus:outline-none focus:placeholder-white/30 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/50" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-md p-4 backdrop-blur-sm">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-black/20 rounded-md border border-white/10 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-white/90 mb-2">Demo Accounts</h3>
              <p className="text-xs text-white/60 mb-3">
                Test the forum with different user roles:
              </p>
              
              <div className="space-y-3">
                {/* Student Demo */}
                <div className="bg-black/30 p-3 rounded border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-purple-300">Student Account</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">Student</span>
                  </div>
                  <div className="text-xs text-white/60 space-y-1 mb-2">
                    <p><strong>Email:</strong> student@university.edu</p>
                    <p><strong>Password:</strong> Alice102!</p>
                  </div>
                  <button
                    onClick={() => handleDemoLogin('student')}
                    className="w-full py-1.5 px-3 border border-purple-500/30 rounded text-xs font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                  >
                    Login as Student
                  </button>
                </div>

                {/* Teacher Demo */}
                <div className="bg-black/30 p-3 rounded border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-pink-300">Teacher Account</span>
                    <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">Teacher</span>
                  </div>
                  <div className="text-xs text-white/60 space-y-1 mb-2">
                    <p><strong>Email:</strong> teacher@university.edu</p>
                    <p><strong>Password:</strong> Chen102!</p>
                  </div>
                  <button
                    onClick={() => handleDemoLogin('teacher')}
                    className="w-full py-1.5 px-3 border border-pink-500/30 rounded text-xs font-medium text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
                  >
                    Login as Teacher
                  </button>
                </div>
              </div>
            </div>

            {/* Create Account Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowRegister(true)}
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
              >
                Don't have an account? Create one
              </button>
            </div>
          </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              By signing in, you agree to our{' '}
              <a href="#" className="text-purple-300 hover:text-purple-200">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-300 hover:text-purple-200">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
