'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

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
        mouseVelocity = distance / timeDiff // pixels per millisecond
      }
      
      lastMousePosition = currentPosition
      lastMouseTime = currentTime
      setMousePosition(currentPosition)
      
      // Only create ripples if mouse is moving fast enough
      if (mouseVelocity > 0.1) {
        // Scale ripple intensity based on velocity
        const velocityScale = Math.min(mouseVelocity * 10, 1) // Cap at 1
        const maxRadius = 30 + (velocityScale * 70) // 30-100px based on speed
        const speed = 1 + (velocityScale * 2) // 1-3 based on speed
        
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 0,
          maxRadius: maxRadius,
          opacity: 0.3 + (velocityScale * 0.4), // 0.3-0.7 based on speed
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
        // Update position
        shape.x += shape.vx
        shape.y += shape.vy
        shape.rotation += 0.01

        // Bounce off edges
        if (shape.x < shape.size || shape.x > canvas.width - shape.size) {
          shape.vx *= -1
        }
        if (shape.y < shape.size || shape.y > canvas.height - shape.size) {
          shape.vy *= -1
        }

        // Add some wave motion
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

        // Draw ripple
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

  const handleGetStarted = () => {
    router.push('/login')
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        {/* Logo Container - No Box */}
        <div className="text-center mb-16">
          {/* EDVANCE Logo - Larger and without container */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/edvance-logo.png"
              alt="EDVANCE Logo"
              width={690}
              height={207}
              className="max-w-full h-auto drop-shadow-2xl -ml-8"
              priority
            />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Your education
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight py-2">
            Advanced by AI
          </h2>
          <p className="text-xl text-white/80 leading-relaxed">
            Join the future of collaborative learning with AI-powered discussions, 
            intelligent insights, and personalized educational experiences.
          </p>
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 hover:from-purple-500 hover:to-pink-500"
        >
          <span className="flex items-center gap-3">
            Get Started
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
          
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        </button>

        {/* Floating elements - reduced for better contrast */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-1000 opacity-60"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-500 opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-pink-300 rounded-full animate-pulse delay-1500 opacity-60"></div>
      </div>
    </div>
  )
}
