'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: number
  username: string
  email: string
  city: string
  country: string
  bio?: string
}

interface FriendRequest {
  id: number
  friend_1_id: number
  friend_1_name: string
  friend_2_id: number
  friend_2_name: string
}

interface Friend {
  id: number
  friend_1_id: number
  friend_1_name: string
  friend_2_id: number
  friend_2_name: string
}

interface Notification {
  id: number
  user_id: number
  notification: string
  read: boolean
  created_at: string
}

interface EventInvitation {
  event_id: number
  location: string
  date: string
  start_time: string
  end_time: string
  description: string
  host_username: string
}

interface SearchResult {
  id: number
  username: string
  friendshipStatus?: 'friends' | 'request_sent' | 'request_received' | 'none'
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [eventInvitations, setEventInvitations] = useState<EventInvitation[]>([])
  const [showEventInvitations, setShowEventInvitations] = useState(false)
  const [eventInvitationsLoading, setEventInvitationsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sentFriendRequests, setSentFriendRequests] = useState<Set<number>>(new Set())
  const [friendsList, setFriendsList] = useState<Set<number>>(new Set())

  // Function to close all popups
  const closeAllPopups = () => {
    setShowFriendRequests(false)
    setShowFriends(false)
    setShowSearch(false)
    setShowNotifications(false)
    setShowEventInvitations(false)
  }

  // Function to load user data from localStorage
  const loadUserData = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        // Fetch additional data after setting user
        if (parsed.id) {
          fetchFriendRequests(parsed.id)
          fetchFriends(parsed.id)
          fetchNotifications(parsed.id)
          fetchEventInvitations(parsed.id)
          fetchSentFriendRequests(parsed.id)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid user data
        localStorage.removeItem('user')
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    // Load user data on component mount
    loadUserData()

    // Listen for storage changes (when user data is added/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        console.log('User data changed in localStorage, reloading...')
        loadUserData()
      }
    }

    // Listen for custom events (for same-tab updates)
    const handleUserDataChange = () => {
      console.log('User data changed via custom event, reloading...')
      loadUserData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userDataChanged', handleUserDataChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userDataChanged', handleUserDataChange)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = async (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.friend-dropdown') && !target.closest('.search-dropdown') && !target.closest('.notification-dropdown') && !target.closest('.event-invitation-dropdown')) {
        
        // Mark notifications as read when closing via click outside
        if (showNotifications) {
          const displayedNotifications = notifications.filter(n => !n.read)
          if (displayedNotifications.length > 0) {
            await markNotificationsAsRead(displayedNotifications.map(n => n.id))
            // Refresh notifications after marking as read
            if (user) {
              await fetchNotifications(user.id)
            }
          }
        }
        
        // Close all popups
        closeAllPopups()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, notifications, user])

  // Periodic notification check for logged-in users
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchNotifications(user.id)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  // Fetch notifications
  const fetchNotifications = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/notifications/get?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched notifications:', data)
        
        // Check if there are new unread notifications
        const currentUnreadCount = notifications.filter(n => !n.read).length
        const newUnreadCount = data.filter((n: any) => !n.read).length
        
        if (newUnreadCount > currentUnreadCount && currentUnreadCount > 0) {
          // New notification arrived - could add sound or visual feedback here
          console.log('New notification received!')
        }
        
        // Data is already in object format from backend
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds: number[]) => {
    if (!user) return
    
    setNotificationsLoading(true)
    try {
      const response = await fetch('http://localhost:5001/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notifications: notificationIds.map(id => ({ id }))
        }),
      })

      if (response.ok) {
        // Refresh notifications
        fetchNotifications(user.id)
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    if (!user) return
    
    try {
      const response = await fetch('http://localhost:5001/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notifications: [{ id: notificationId }]
        }),
      })

      if (response.ok) {
        // Update local state immediately for better UX
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    if (!user) return
    
    setNotificationsLoading(true)
    try {
      const response = await fetch('http://localhost:5001/notifications/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId }),
      })

      if (response.ok) {
        // Refresh notifications
        fetchNotifications(user.id)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Fetch event invitations
  const fetchEventInvitations = async (userId: number) => {
    try {
      const response = await fetch('/api/regular-calendar/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setEventInvitations(data)
      }
    } catch (error) {
      console.error('Error fetching event invitations:', error)
    }
  }

  // Accept event invitation
  const acceptEventInvitation = async (eventId: number) => {
    if (!user) return
    
    setEventInvitationsLoading(true)
    try {
      const response = await fetch('/api/regular-calendar/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId, user_id: user.id }),
      })

      if (response.ok) {
        // Refresh invitations and notifications
        fetchEventInvitations(user.id)
        fetchNotifications(user.id)
      } else {
        const errorData = await response.json()
        alert(`Failed to accept invitation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error accepting event invitation:', error)
      alert('Failed to accept invitation. Please try again.')
    } finally {
      setEventInvitationsLoading(false)
    }
  }

  // Reject event invitation
  const rejectEventInvitation = async (eventId: number) => {
    if (!user) return
    
    setEventInvitationsLoading(true)
    try {
      const response = await fetch('/api/regular-calendar/reject-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId, user_id: user.id }),
      })

      if (response.ok) {
        // Refresh invitations and notifications
        fetchEventInvitations(user.id)
        fetchNotifications(user.id)
      } else {
        const errorData = await response.json()
        alert(`Failed to reject invitation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error rejecting event invitation:', error)
      alert('Failed to reject invitation. Please try again.')
    } finally {
      setEventInvitationsLoading(false)
    }
  }

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return
    
    setSearchLoading(true)
    try {
      const response = await fetch('http://localhost:5001/search/get_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        // Filter out the current user from search results
        const filteredResults = data.filter((result: any) => result.id !== user.id)
        setSearchResults(filteredResults)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      searchUsers(query)
    } else {
      setSearchResults([])
    }
  }

  // Send friend request
  const sendFriendRequest = async (friendId: number) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/friends/send_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_1_id: user.id, friend_2_id: friendId }),
      })

      if (response.ok) {
        // Add to sent friend requests set
        setSentFriendRequests(prev => {
          const newSet = new Set(prev).add(friendId)
          console.log(`Updated sentFriendRequests: ${Array.from(newSet)}`)
          return newSet
        })
        console.log(`Friend request sent to user ${friendId}`)
      } else {
        const errorData = await response.json()
        console.error('Error sending friend request:', errorData.error)
        // Show error message to user (you can add a toast notification here)
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendRequests = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/friends/get_requests?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFriendRequests(data)
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  const fetchFriends = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/friends/get_friends?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFriends(data)
        
        // Extract friend IDs and populate the friendsList set
        const friendIds = new Set<number>()
        data.forEach((friend: any) => {
          // Add both friend_1_id and friend_2_id to the set (excluding the current user)
          if (friend.friend_1_id !== userId) {
            friendIds.add(friend.friend_1_id)
          }
          if (friend.friend_2_id !== userId) {
            friendIds.add(friend.friend_2_id)
          }
        })
        setFriendsList(friendIds)
        console.log('Friends list updated:', Array.from(friendIds))
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const handleAcceptRequest = async (friend1Id: number, friend2Id: number) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/friends/accept_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_1_id: friend1Id, friend_2_id: friend2Id }),
      })

      if (response.ok) {
        // Refresh both lists
        fetchFriendRequests(user.id)
        fetchFriends(user.id)
        // Remove from sent friend requests if it was there
        setSentFriendRequests(prev => {
          const newSet = new Set(prev)
          newSet.delete(friend2Id) // friend2Id is the user who accepted the request
          return newSet
        })
      }
    } catch (error) {
      console.error('Error accepting friend request:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle accepting friend request from search results
  const handleAcceptRequestFromSearch = async (friendId: number) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/friends/accept_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_1_id: friendId, friend_2_id: user.id }),
      })

      if (response.ok) {
        // Refresh both lists
        fetchFriendRequests(user.id)
        fetchFriends(user.id)
        // Remove from sent friend requests if it was there
        setSentFriendRequests(prev => {
          const newSet = new Set(prev)
          newSet.delete(friendId) // friendId is the user who sent the request
          return newSet
        })
      }
    } catch (error) {
      console.error('Error accepting friend request:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch sent friend requests
  const fetchSentFriendRequests = async (userId: number) => {
    try {
      console.log(`Fetching sent friend requests for user ${userId}`)
      const response = await fetch(`http://localhost:5001/friends/get_sent_requests?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Sent friend requests data:', data)
        // Extract the friend_2_id (the user who received the request) from each sent request
        const sentRequestIds = data.map((request: any) => request.friend_2_id)
        console.log('Sent request IDs:', sentRequestIds)
        setSentFriendRequests(new Set(sentRequestIds))
      } else {
        console.error('Failed to fetch sent friend requests:', response.status)
      }
    } catch (error) {
      console.error('Error fetching sent friend requests:', error)
    }
  }

  // Check if a user is in the sent friend requests set
  const hasSentFriendRequest = (userId: number) => {
    const hasSent = sentFriendRequests.has(userId)
    console.log(`Checking if user ${userId} has sent request: ${hasSent}`)
    return hasSent
  }

  // Check if a user is in the friends list
  const isFriend = (userId: number) => {
    const isFriendUser = friendsList.has(userId)
    console.log(`Checking if user ${userId} is friend: ${isFriendUser}`)
    return isFriendUser
  }

  const handleRejectRequest = async (friend1Id: number, friend2Id: number) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/friends/remove_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_1_id: friend1Id, friend_2_id: friend2Id }),
      })

      if (response.ok) {
        fetchFriendRequests(user.id)
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async (friend1Id: number, friend2Id: number) => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/friends/remove_friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_1_id: friend1Id, friend_2_id: friend2Id }),
      })

      if (response.ok) {
        fetchFriends(user.id)
      }
    } catch (error) {
      console.error('Error removing friend:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    // Dispatch custom event to notify Navigation component
    window.dispatchEvent(new CustomEvent('userDataChanged'))
    window.location.href = '/auth/login'
  }

  const getOtherUserId = (request: FriendRequest) => {
    return request.friend_1_id === user?.id ? request.friend_2_id : request.friend_1_id
  }

  const getOtherFriendId = (friend: Friend) => {
    return friend.friend_1_id === user?.id ? friend.friend_2_id : friend.friend_1_id
  }

  const getOtherUserName = (request: FriendRequest) => {
    return request.friend_1_id === user?.id ? request.friend_2_name : request.friend_1_name
  }

  const getOtherFriendName = (friend: Friend) => {
    return friend.friend_1_id === user?.id ? friend.friend_2_name : friend.friend_1_name
  }

  // Show loading state briefly while checking authentication
  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-gray-900">PlanThat</div>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Don't render navigation if user is not logged in
  if (!user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              PlanThat
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              key="calendar"
              href="/regular-calendar" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Calendar
            </Link>
            
            {/* Notifications */}
            <div key="notifications" className="relative notification-dropdown">
              <button
                onClick={async () => {
                  const wasOpen = showNotifications
                  
                  // Close all other popups first
                  closeAllPopups()
                  
                  // Toggle notifications popup
                  setShowNotifications(!wasOpen)
                  
                  if (!wasOpen) {
                    // Opening the dropdown - fetch fresh notifications
                    if (user) {
                      await fetchNotifications(user.id)
                    }
                  } else {
                    // Closing the dropdown - mark all displayed notifications as read immediately
                    const displayedNotifications = notifications.filter(n => !n.read)
                    if (displayedNotifications.length > 0) {
                      await markNotificationsAsRead(displayedNotifications.map(n => n.id))
                      // Refresh notifications after marking as read
                      if (user) {
                        await fetchNotifications(user.id)
                      }
                    }
                  }
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v3.75l2.25 2.25V12a8.25 8.25 0 0 0-16.5 0v3.75l2.25-2.25V9.75a6 6 0 0 1 6-6z" />
                </svg>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span key="notification-badge" className="ml-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div key="notifications-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button
                          onClick={() => {
                            const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
                            markNotificationsAsRead(unreadIds)
                          }}
                          disabled={notificationsLoading}
                          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm">No notifications</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 rounded-lg border flex items-start gap-2 ${
                              notification.read 
                                ? 'bg-white border-gray-200' 
                                : 'bg-blue-50 border-blue-200'
                            } hover:bg-gray-50 transition-colors cursor-pointer`}
                            onClick={() => {
                              if (!notification.read) {
                                markNotificationAsRead(notification.id)
                              }
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                              disabled={notificationsLoading}
                              className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                              title="Delete notification"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="flex-1">
                              <p className={`text-sm ${
                                notification.read ? 'text-gray-700' : 'text-blue-900 font-medium'
                              }`}>
                                {notification.notification}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0 mt-0.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Event Invitations */}
            <div key="event-invitations" className="relative event-invitation-dropdown">
              <button
                onClick={async () => {
                  const wasOpen = showEventInvitations
                  
                  // Close all other popups first
                  closeAllPopups()
                  
                  // Toggle event invitations popup
                  setShowEventInvitations(!wasOpen)
                  
                  if (!wasOpen) {
                    // Opening the dropdown - fetch fresh invitations
                    if (user) {
                      await fetchEventInvitations(user.id)
                    }
                  }
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Event Invitations
                {eventInvitations.length > 0 && (
                  <span key="event-invitation-badge" className="ml-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {eventInvitations.length}
                  </span>
                )}
              </button>
              
              {showEventInvitations && (
                <div key="event-invitations-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Event Invitations</h3>
                    {eventInvitations.length === 0 ? (
                      <p className="text-gray-500 text-sm">No pending event invitations</p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {eventInvitations.map((invitation) => (
                          <div 
                            key={invitation.event_id} 
                            className="p-3 rounded-lg border bg-orange-50 border-orange-200"
                          >
                            <div className="mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">{invitation.location}</h4>
                              <p className="text-xs text-gray-600 mt-1">{invitation.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>📅 {invitation.date}</span>
                                <span>🕐 {invitation.start_time} - {invitation.end_time}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">Host: {invitation.host_username}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptEventInvitation(invitation.event_id)}
                                disabled={eventInvitationsLoading}
                                className="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => rejectEventInvitation(invitation.event_id)}
                                disabled={eventInvitationsLoading}
                                className="flex-1 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Users */}
            <div key="search" className="relative search-dropdown">
              <button
                onClick={() => {
                  const wasOpen = showSearch
                  
                  // Close all other popups first
                  closeAllPopups()
                  
                  // Toggle search popup
                  setShowSearch(!wasOpen)
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Users
              </button>
              
              {showSearch && (
                <div key="search-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Search Users</h3>
                    <div className="mb-3">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search by username..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    
                    {searchLoading && (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">Searching...</p>
                      </div>
                    )}
                    
                    {!searchLoading && searchQuery && searchResults.length === 0 && (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">No users found</p>
                      </div>
                    )}
                    
                    {!searchLoading && searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((user) => {
                          const hasSentRequest = hasSentFriendRequest(user.id)
                          const isFriendUser = isFriend(user.id)
                          console.log(`User ${user.username} (ID: ${user.id}) - hasSentRequest: ${hasSentRequest}, isFriend: ${isFriendUser}`)
                          console.log('Current sentFriendRequests:', Array.from(sentFriendRequests))
                          console.log('Current friendsList:', Array.from(friendsList))
                          
                          return (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                              </div>
                              {isFriendUser ? (
                                <button
                                  disabled={true}
                                  className="px-3 py-1 text-xs bg-green-400 text-white rounded disabled:opacity-50 cursor-not-allowed"
                                >
                                  Friends
                                </button>
                              ) : hasSentRequest ? (
                                <button
                                  disabled={true}
                                  className="px-3 py-1 text-xs bg-gray-400 text-white rounded disabled:opacity-50 cursor-not-allowed"
                                >
                                  Request Sent
                                </button>
                              ) : (
                                <button
                                  onClick={() => sendFriendRequest(user.id)}
                                  disabled={loading}
                                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                  Add Friend
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Friend Requests Dropdown */}
            <div key="friend-requests" className="relative friend-dropdown">
              <button
                onClick={() => {
                  const wasOpen = showFriendRequests
                  
                  // Close all other popups first
                  closeAllPopups()
                  
                  // Toggle friend requests popup
                  setShowFriendRequests(!wasOpen)
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                Friend Requests
                {friendRequests.length > 0 && (
                  <span key="friend-requests-badge" className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {friendRequests.length}
                  </span>
                )}
              </button>
              
              {showFriendRequests && (
                <div key="friend-requests-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Friend Requests</h3>
                    {friendRequests.length === 0 ? (
                      <p className="text-gray-500 text-sm">No pending friend requests</p>
                    ) : (
                      <div className="space-y-3">
                        {friendRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {getOtherUserName(request)}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptRequest(request.friend_1_id, request.friend_2_id)}
                                disabled={loading}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.friend_1_id, request.friend_2_id)}
                                disabled={loading}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Friends Dropdown */}
            <div key="friends" className="relative friend-dropdown">
              <button
                onClick={() => {
                  const wasOpen = showFriends
                  
                  // Close all other popups first
                  closeAllPopups()
                  
                  // Toggle friends popup
                  setShowFriends(!wasOpen)
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                Friends
                {friends.length > 0 && (
                  <span key="friends-badge" className="ml-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {friends.length}
                  </span>
                )}
              </button>
              
              {showFriends && (
                <div key="friends-dropdown" className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Friends</h3>
                    {friends.length === 0 ? (
                      <p className="text-gray-500 text-sm">No friends yet</p>
                    ) : (
                      <div className="space-y-3">
                        {friends.map((friend) => (
                          <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {getOtherFriendName(friend)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFriend(friend.friend_1_id, friend.friend_2_id)}
                              disabled={loading}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              key="logout"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 