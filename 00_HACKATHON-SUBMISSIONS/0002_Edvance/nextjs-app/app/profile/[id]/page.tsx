'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useFriends } from '../../../contexts/FriendsContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { User, ArrowLeft, GraduationCap, BookOpen, Calendar, Award, UserPlus, UserCheck, Edit, Camera, Save, X, Plus } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  bio: string | null
  profilePicture: string | null
  graduationYear: string | null
  degree: string | null
  major: string | null
  isDemo: boolean
  createdAt: string
}

export default function PublicProfilePage() {
  const { user, updateUser } = useAuth()
  const { addFriend, isFriend, hasPendingRequest } = useFriends()
  const router = useRouter()
  const params = useParams()
  const userId = decodeURIComponent(params.id as string)
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [showUsernameChange, setShowUsernameChange] = useState(false)
  const [newUsername, setNewUsername] = useState('')

  const handleAddFriend = () => {
    if (profile) {
      addFriend(profile.name, profile.name)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile || !user?.id) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          bio: profile.bio,
          profilePicture: profile.profilePicture,
          graduationYear: profile.graduationYear,
          degree: profile.degree,
          major: profile.major
        })
      })

      const data = await response.json()
      
      if (response.ok && data.user) {
        setProfile(data.user)
        setMessage('Profile saved successfully!')
        setIsEditing(false)
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.error || 'Error saving profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && profile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile(prev => prev ? {
          ...prev,
          profilePicture: e.target?.result as string
        } : null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUsernameChange = async () => {
    if (!newUsername.trim() || !user || !profile) return
    
    const oldUsername = user.name
    const updatedUsername = newUsername.trim()
    
    try {
      // Update username in database via API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: updatedUsername,
          bio: profile.bio,
          profilePicture: profile.profilePicture,
          graduationYear: profile.graduationYear,
          degree: profile.degree,
          major: profile.major
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update username in database')
      }

      // Update user context
      const updatedUser = { ...user, name: updatedUsername }
      updateUser(updatedUser)
      
      // Update profile state
      setProfile(prev => prev ? { ...prev, name: updatedUsername } : null)
      
      // Update all questions with old username in localStorage
      const existingQuestions = JSON.parse(localStorage.getItem('questions') || '[]')
      const updatedQuestions = existingQuestions.map((q: any) => {
        if (q.username === oldUsername) {
          return { ...q, username: updatedUsername }
        }
        return q
      })
      localStorage.setItem('questions', JSON.stringify(updatedQuestions))
      
      // Update all answers with old username in localStorage
      const existingAnswers = JSON.parse(localStorage.getItem('answers') || '[]')
      const updatedAnswers = existingAnswers.map((a: any) => {
        if (a.username === oldUsername) {
          return { ...a, username: updatedUsername }
        }
        return a
      })
      localStorage.setItem('answers', JSON.stringify(updatedAnswers))
      
      // Update friends data in localStorage
      const friendsData = JSON.parse(localStorage.getItem(`friends_${user.id}`) || '[]')
      const updatedFriendsData = friendsData.map((f: any) => {
        if (f.name === oldUsername) {
          return { ...f, name: updatedUsername }
        }
        return f
      })
      localStorage.setItem(`friends_${user.id}`, JSON.stringify(updatedFriendsData))
      
      // Update friend requests in localStorage
      const friendRequestsData = JSON.parse(localStorage.getItem(`friendRequests_${user.id}`) || '[]')
      const updatedFriendRequestsData = friendRequestsData.map((f: any) => {
        if (f.name === oldUsername) {
          return { ...f, name: updatedUsername }
        }
        return f
      })
      localStorage.setItem(`friendRequests_${user.id}`, JSON.stringify(updatedFriendRequestsData))
      
      // Close modal and reset
      setShowUsernameChange(false)
      setNewUsername('')
      
      // Show success message
      setMessage(`Username successfully changed from "${oldUsername}" to "${updatedUsername}"! All your posts and comments have been updated.`)
      
    } catch (error) {
      console.error('Error changing username:', error)
      setMessage('Error changing username. Please try again.')
    }
  }

  const fetchProfile = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/profile?userId=${targetUserId}`)
      const data = await response.json()
      
      if (response.ok && data.user) {
        setProfile(data.user)
        setError('')
      } else {
        setError(data.error || 'Profile not found')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    if (!user) return
    
    // Check if we're viewing by user ID or user name
    let targetUserId = userId
    
    // If userId looks like a name (not a cuid), it might be the current user's name
    if (user.name === userId) {
      targetUserId = user.id
    }
    
    fetchProfile(targetUserId)
  }, [userId, user])

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
              <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
              <button
                onClick={handleGoBack}
                className="flex items-center mx-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-gray-100">
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
                <User className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              </div>
              <div className="flex items-center space-x-4">
                {isOwnProfile && isEditing && (
                  <button
                    onClick={() => setShowUsernameChange(true)}
                    className="flex items-center px-3 py-1 text-sm text-orange-600 bg-orange-100 rounded-full hover:bg-orange-200"
                  >
                    Change Username
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Profile Header */}
            <div className="flex items-start space-x-6 mb-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                {isEditing && isOwnProfile && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  {isOwnProfile && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Profile
                    </button>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{profile.email}</p>
                <div className="flex items-center space-x-2">
                  {profile.isDemo && (
                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Demo Account
                    </span>
                  )}
                  {!isOwnProfile && (
                    <>
                      {isFriend(profile.name) ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Friend
                        </span>
                      ) : hasPendingRequest(profile.name) ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Request Sent
                        </span>
                      ) : (
                        <button
                          onClick={handleAddFriend}
                          className="inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add Friend
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing && isOwnProfile ? (
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-md">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                )}
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Graduation Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Graduation Year
                  </label>
                  {isEditing && isOwnProfile ? (
                    <input
                      type="text"
                      value={profile.graduationYear || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, graduationYear: e.target.value } : null)}
                      placeholder="e.g., 2025"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-md">
                      {profile.graduationYear || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="h-4 w-4 inline mr-1" />
                    Degree
                  </label>
                  {isEditing && isOwnProfile ? (
                    <input
                      type="text"
                      value={profile.degree || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, degree: e.target.value } : null)}
                      placeholder="e.g., Bachelor of Science"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-md">
                      {profile.degree || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Major */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    Major
                  </label>
                  {isEditing && isOwnProfile ? (
                    <input
                      type="text"
                      value={profile.major || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, major: e.target.value } : null)}
                      placeholder="e.g., Computer Science"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-md">
                      {profile.major || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>



              {/* Action Buttons */}
              {isEditing && isOwnProfile && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Username Modal */}
        {showUsernameChange && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Username
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter your new username"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUsernameChange(false)
                    setNewUsername('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUsernameChange}
                  disabled={saving || !newUsername.trim()}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
