'use client'

import { useState, useEffect } from 'react'

interface LoadingProgressProps {
  isLoading: boolean
  message?: string
  estimatedTime?: number // in seconds
}

export default function LoadingProgress({ 
  isLoading, 
  message = "Generating AI response...", 
  estimatedTime = 30 
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      setTimeElapsed(0)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setTimeElapsed(elapsed)
      
      // Calculate progress based on estimated time
      const calculatedProgress = Math.min((elapsed / estimatedTime) * 100, 95) // Cap at 95% until complete
      setProgress(calculatedProgress)
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading, estimatedTime])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
          <p className="text-sm text-gray-600 mb-4">
            This may take up to {estimatedTime} seconds...
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-gray-500">
            Time elapsed: {timeElapsed}s
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            <p>💡 Tip: Similar requests will be much faster due to caching!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
