'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useFriends } from '../../contexts/FriendsContext'
import ProtectedRoute from '../../components/ProtectedRoute'
import { User, ArrowLeft, UserPlus, UserCheck, UserX, Users, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FriendsPage() {
  const { user } = useAuth()
  const { 
    friends, 
    friendRequests, 
    acceptFriendRequest, 
    declineFriendRequest, 
    removeFriend 
  } = useFriends()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const pendingRequests = friendRequests.filter(r => r.status === 'pending')

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
                <Users className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="flex space-x-8 mb-8">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'friends'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>My Friends ({friends.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'requests'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Friend Requests ({pendingRequests.length})</span>
            </button>
          </div>

          {/* Friends List */}
          {activeTab === 'friends' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Friends</h2>
              </div>
              
              {friends.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start connecting with other students by sending friend requests!
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Browse Questions
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {friend.friendName}
                            </h3>
                            <p className="text-sm text-gray-500">Friend since {new Date(friend.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/profile/${friend.friendId}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => removeFriend(friend.friendId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friend Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Friend Requests</h2>
              </div>
              
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">
                    You don't have any pending friend requests at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.fromUserName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Wants to be your friend • {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/profile/${request.fromUserId}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Profile
                          </Link>
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="flex items-center px-3 py-1 text-sm text-green-600 bg-green-100 rounded-full hover:bg-green-200"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.id)}
                            className="flex items-center px-3 py-1 text-sm text-red-600 bg-red-100 rounded-full hover:bg-red-200"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
