'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, User, Mail, MapPin, Calendar, Heart, Utensils, Coffee, Moon, Trees, Palette, Gamepad2, ShoppingBag, AlertCircle } from 'lucide-react'

interface UserPreferences {
  food: number
  drinks: number
  nightlife: number
  nature: number
  arts: number
  entertainment: number
  sports: number
  shopping: number
  music: number
}

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Step 1: Basic Info
  const [basicInfo, setBasicInfo] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    dob: '',
    city: '',
    country: '',
    zipcode: ''
  })

  // Step 2: Preferences
  const [preferences, setPreferences] = useState({
    bio: '',
    diet_restrictions: '',
    dislikes: '',
    food: 5,
    drinks: 5,
    nightlife: 5,
    nature: 5,
    arts: 5,
    entertainment: 5,
    sports: 5,
    shopping: 5,
    music: 5
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleBasicInfoChange = (field: string, value: string) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (field: string, value: string | number) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  const validateStep1 = () => {
    if (!basicInfo.username || !basicInfo.password || !basicInfo.email || 
        !basicInfo.dob || !basicInfo.city || !basicInfo.country || !basicInfo.zipcode) {
      setError('Please fill in all required fields')
      return false
    }
    if (basicInfo.password !== basicInfo.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (basicInfo.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    setError('')
    return true
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...basicInfo,
          ...preferences
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Dispatch custom event to notify Navigation component
        window.dispatchEvent(new CustomEvent('userDataChanged'))
        
        // Set token in cookie for middleware
        document.cookie = `token=${data.token}; path=/; max-age=86400` // 24 hours
        
        // Redirect to main app
        router.push('/')
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const PreferenceSlider = ({ 
    label, 
    value, 
    onChange, 
    icon: Icon 
  }: { 
    label: string
    value: number
    onChange: (value: number) => void
    icon: any
  }) => {
    const [isDragging, setIsDragging] = useState(false)
    const sliderRef = useRef<HTMLDivElement>(null)
    
    const getIntensityColor = (val: number) => {
      if (val <= 3) return 'text-red-600 bg-red-50'
      if (val <= 6) return 'text-yellow-600 bg-yellow-50'
      return 'text-green-600 bg-green-50'
    }
    
    const getIntensityText = (val: number) => {
      if (val <= 3) return 'Low'
      if (val <= 6) return 'Medium'
      return 'High'
    }
    
    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      // Immediately update the value on mouse down
      handleMouseMove(e)
    }
    
    const handleClick = (e: React.MouseEvent) => {
      if (!isDragging && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const width = rect.width
        const percentage = Math.max(0, Math.min(1, x / width))
        const newValue = Math.round(percentage * 9) + 1
        const clampedValue = Math.max(1, Math.min(10, newValue))
        onChange(clampedValue)
      }
    }
    
    const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
      if (!isDragging || !sliderRef.current) return
      
      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width
      const percentage = Math.max(0, Math.min(1, x / width))
      const newValue = Math.round(percentage * 9) + 1 // Convert to 1-10 range
      
      // Ensure value is within bounds
      const clampedValue = Math.max(1, Math.min(10, newValue))
      
      // Always update the value when dragging, even if it's the same
      onChange(clampedValue)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
    }
    
    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }
    
    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault()
      setIsDragging(true)
      if (e.touches[0] && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect()
        const x = e.touches[0].clientX - rect.left
        const width = rect.width
        const percentage = Math.max(0, Math.min(1, x / width))
        const newValue = Math.round(percentage * 9) + 1
        const clampedValue = Math.max(1, Math.min(10, newValue))
        onChange(clampedValue)
      }
    }
    
    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging || !sliderRef.current) return
      
      e.preventDefault()
      if (e.touches[0]) {
        const rect = sliderRef.current.getBoundingClientRect()
        const x = e.touches[0].clientX - rect.left
        const width = rect.width
        const percentage = Math.max(0, Math.min(1, x / width))
        const newValue = Math.round(percentage * 9) + 1
        const clampedValue = Math.max(1, Math.min(10, newValue))
        onChange(clampedValue)
      }
    }
    
    const handleTouchEnd = () => {
      setIsDragging(false)
    }
    
    // Add global mouse event listeners
    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging])
    
    return (
    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-gray-400" />
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getIntensityColor(value)}`}>
            {getIntensityText(value)}
          </span>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            {value}/10
          </span>
        </div>
      </div>
      
      {/* Discrete Slider Track */}
      <div 
        ref={sliderRef}
        className={`relative slider-container cursor-pointer ${isDragging ? 'select-none dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Step Indicators */}
        <div className="absolute top-1/2 w-full flex justify-between transform -translate-y-1/2 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full step-indicator cursor-pointer ${
                step <= value ? 'bg-indigo-600 active' : 'bg-gray-300'
              }`}
              onClick={() => onChange(step)}
            />
          ))}
        </div>
        
        {/* Background Track */}
        <div 
          className="w-full h-3 bg-gray-200 rounded-full overflow-hidden slider-track transition-all duration-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            if (!isDragging && sliderRef.current) {
              const rect = sliderRef.current.getBoundingClientRect()
              const x = e.clientX - rect.left
              const width = rect.width
              const percentage = Math.max(0, Math.min(1, x / width))
              const newValue = Math.round(percentage * 9) + 1
              const clampedValue = Math.max(1, Math.min(10, newValue))
              onChange(clampedValue)
            }
          }}
        >
          <div 
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        
        {/* Slider Input (hidden but still functional for accessibility) */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute top-0 left-0 w-full h-3 custom-slider z-10 opacity-0"
        />
        
        {/* Custom Thumb */}
        <div 
          className={`absolute top-1/2 w-6 h-6 bg-white border-2 border-indigo-600 rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-200 ease-out slider-thumb flex items-center justify-center ${
            isDragging ? 'scale-110 shadow-xl' : ''
          }`}
          style={{ left: `calc(${(value / 10) * 100}% - 12px)` }}
        >
          <span className="text-xs font-bold text-indigo-600">{value}</span>
        </div>
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span>10</span>
      </div>
    </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join PlanThat
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1 ? 'Step 1: Basic Information' : 'Step 2: Your Preferences'}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${step * 50}%` }}
            ></div>
          </div>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleStep1Submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    value={basicInfo.username}
                    onChange={(e) => handleBasicInfoChange('username', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={basicInfo.email}
                    onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={basicInfo.password}
                    onChange={(e) => handleBasicInfoChange('password', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={basicInfo.confirmPassword}
                    onChange={(e) => handleBasicInfoChange('confirmPassword', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dob"
                    type="date"
                    required
                    value={basicInfo.dob}
                    onChange={(e) => handleBasicInfoChange('dob', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="city"
                    type="text"
                    required
                    value={basicInfo.city}
                    onChange={(e) => handleBasicInfoChange('city', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Your city"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="country"
                    type="text"
                    required
                    value={basicInfo.country}
                    onChange={(e) => handleBasicInfoChange('country', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Your country"
                  />
                </div>
              </div>

              {/* Zipcode */}
              <div>
                <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
                  Zip Code *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="zipcode"
                    type="text"
                    required
                    value={basicInfo.zipcode}
                    onChange={(e) => handleBasicInfoChange('zipcode', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Your zip code"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue to Preferences
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={preferences.bio}
                  onChange={(e) => handlePreferenceChange('bio', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              {/* Diet Restrictions */}
              <div>
                <label htmlFor="diet_restrictions" className="block text-sm font-medium text-gray-700">
                  Diet Restrictions
                </label>
                <input
                  id="diet_restrictions"
                  type="text"
                  value={preferences.diet_restrictions}
                  onChange={(e) => handlePreferenceChange('diet_restrictions', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., vegetarian, gluten-free, etc."
                />
              </div>

              {/* Dislikes */}
              <div>
                <label htmlFor="dislikes" className="block text-sm font-medium text-gray-700">
                  Dislikes
                </label>
                <input
                  id="dislikes"
                  type="text"
                  value={preferences.dislikes}
                  onChange={(e) => handlePreferenceChange('dislikes', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Things you don't like..."
                />
              </div>

              {/* Preference Sliders */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Rate your preferences</h3>
                  <p className="text-sm text-gray-600">Click or drag to select your preference level (1 = Not interested, 10 = Love it)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PreferenceSlider
                    label="Food"
                    value={preferences.food}
                    onChange={(value) => handlePreferenceChange('food', value)}
                    icon={Utensils}
                  />
                  <PreferenceSlider
                    label="Drinks"
                    value={preferences.drinks}
                    onChange={(value) => handlePreferenceChange('drinks', value)}
                    icon={Coffee}
                  />
                  <PreferenceSlider
                    label="Nightlife"
                    value={preferences.nightlife}
                    onChange={(value) => handlePreferenceChange('nightlife', value)}
                    icon={Moon}
                  />
                                     <PreferenceSlider
                     label="Nature"
                     value={preferences.nature}
                     onChange={(value) => handlePreferenceChange('nature', value)}
                     icon={Trees}
                   />
                  <PreferenceSlider
                    label="Arts"
                    value={preferences.arts}
                    onChange={(value) => handlePreferenceChange('arts', value)}
                    icon={Palette}
                  />
                  <PreferenceSlider
                    label="Entertainment"
                    value={preferences.entertainment}
                    onChange={(value) => handlePreferenceChange('entertainment', value)}
                    icon={Gamepad2}
                  />
                  <PreferenceSlider
                    label="Sports"
                    value={preferences.sports}
                    onChange={(value) => handlePreferenceChange('sports', value)}
                    icon={Heart}
                  />
                  <PreferenceSlider
                    label="Shopping"
                    value={preferences.shopping}
                    onChange={(value) => handlePreferenceChange('shopping', value)}
                    icon={ShoppingBag}
                  />
                  <PreferenceSlider
                    label="Music"
                    value={preferences.music}
                    onChange={(value) => handlePreferenceChange('music', value)}
                    icon={Heart}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}