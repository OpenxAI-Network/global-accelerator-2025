'use client'

import { useState } from 'react'
import { Plus, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface JoinClassProps {
  onClassJoined: (newClass: any) => void
}

export default function JoinClass({ onClassJoined }: JoinClassProps) {
  const { user } = useAuth()
  const [courseCode, setCourseCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!courseCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter a course code' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (!user?.id) {
        setMessage({ type: 'error', text: 'Please log in to join a class' })
        return
      }

      const response = await fetch('/api/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: courseCode.trim(),
          userId: user.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        onClassJoined(data.class)
        setCourseCode('')
        setTimeout(() => {
          setShowForm(false)
          setMessage(null)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      console.error('Error joining class:', error)
      setMessage({ type: 'error', text: 'Failed to join class. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setCourseCode('')
    setMessage(null)
  }

  if (!showForm) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
        >
          <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
          <span className="text-gray-600 group-hover:text-blue-600 font-medium">
            Join a Class
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Join a Class</h3>
        </div>
        
        <form onSubmit={handleJoinClass} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Code
            </label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              placeholder="e.g., FINC3012, ENGG1810"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the course code provided by your teacher
            </p>
          </div>

          {message && (
            <div className={`flex items-center space-x-2 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </span>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !courseCode.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Join Class</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
