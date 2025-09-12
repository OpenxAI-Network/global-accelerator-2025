'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface FriendRequest {
  id: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

interface Friend {
  id: string
  userId: string
  userName: string
  friendId: string
  friendName: string
  createdAt: string
}

interface FriendsContextType {
  friends: Friend[]
  friendRequests: FriendRequest[]
  addFriend: (friendId: string, friendName: string) => void
  acceptFriendRequest: (requestId: string) => void
  declineFriendRequest: (requestId: string) => void
  removeFriend: (friendId: string) => void
  isFriend: (userId: string) => boolean
  hasPendingRequest: (userId: string) => boolean
  isLoading: boolean
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFriendsData()
    }
  }, [user])

  const loadFriendsData = () => {
    try {
      // Load friends from localStorage
      const savedFriends = localStorage.getItem(`friends_${user?.id}`)
      if (savedFriends) {
        setFriends(JSON.parse(savedFriends))
      }

      // Load friend requests from localStorage
      const savedRequests = localStorage.getItem(`friendRequests_${user?.id}`)
      if (savedRequests) {
        setFriendRequests(JSON.parse(savedRequests))
      }
    } catch (error) {
      console.error('Error loading friends data:', error)
    }
    setIsLoading(false)
  }

  const addFriend = (friendId: string, friendName: string) => {
    if (!user) return

    const newRequest: FriendRequest = {
      id: `req_${Date.now()}`,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: friendId,
      toUserName: friendName,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    // Add to current user's outgoing requests
    const updatedRequests = [...friendRequests, newRequest]
    setFriendRequests(updatedRequests)
    localStorage.setItem(`friendRequests_${user.id}`, JSON.stringify(updatedRequests))

    // Add to target user's incoming requests (for demo purposes)
    const targetUserRequests = JSON.parse(localStorage.getItem(`friendRequests_${friendId}`) || '[]')
    targetUserRequests.push(newRequest)
    localStorage.setItem(`friendRequests_${friendId}`, JSON.stringify(targetUserRequests))
  }

  const acceptFriendRequest = (requestId: string) => {
    if (!user) return

    const request = friendRequests.find(r => r.id === requestId)
    if (!request) return

    // Update request status
    const updatedRequests = friendRequests.map(r => 
      r.id === requestId ? { ...r, status: 'accepted' as const } : r
    )
    setFriendRequests(updatedRequests)
    localStorage.setItem(`friendRequests_${user.id}`, JSON.stringify(updatedRequests))

    // Add to friends list
    const newFriend: Friend = {
      id: `friend_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      friendId: request.fromUserId,
      friendName: request.fromUserName,
      createdAt: new Date().toISOString()
    }

    const updatedFriends = [...friends, newFriend]
    setFriends(updatedFriends)
    localStorage.setItem(`friends_${user.id}`, JSON.stringify(updatedFriends))

    // Add reverse friendship for the other user
    const otherUserFriends = JSON.parse(localStorage.getItem(`friends_${request.fromUserId}`) || '[]')
    const reverseFriend: Friend = {
      id: `friend_${Date.now()}_reverse`,
      userId: request.fromUserId,
      userName: request.fromUserName,
      friendId: user.id,
      friendName: user.name,
      createdAt: new Date().toISOString()
    }
    otherUserFriends.push(reverseFriend)
    localStorage.setItem(`friends_${request.fromUserId}`, JSON.stringify(otherUserFriends))
  }

  const declineFriendRequest = (requestId: string) => {
    if (!user) return

    const updatedRequests = friendRequests.map(r => 
      r.id === requestId ? { ...r, status: 'declined' as const } : r
    )
    setFriendRequests(updatedRequests)
    localStorage.setItem(`friendRequests_${user.id}`, JSON.stringify(updatedRequests))
  }

  const removeFriend = (friendId: string) => {
    if (!user) return

    const updatedFriends = friends.filter(f => f.friendId !== friendId)
    setFriends(updatedFriends)
    localStorage.setItem(`friends_${user.id}`, JSON.stringify(updatedFriends))

    // Remove from other user's friends list
    const otherUserFriends = JSON.parse(localStorage.getItem(`friends_${friendId}`) || '[]')
    const updatedOtherFriends = otherUserFriends.filter((f: Friend) => f.friendId !== user.id)
    localStorage.setItem(`friends_${friendId}`, JSON.stringify(updatedOtherFriends))
  }

  const isFriend = (userId: string): boolean => {
    return friends.some(f => f.friendId === userId)
  }

  const hasPendingRequest = (userId: string): boolean => {
    return friendRequests.some(r => 
      (r.fromUserId === userId || r.toUserId === userId) && r.status === 'pending'
    )
  }

  return (
    <FriendsContext.Provider value={{
      friends,
      friendRequests,
      addFriend,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
      isFriend,
      hasPendingRequest,
      isLoading
    }}>
      {children}
    </FriendsContext.Provider>
  )
}

export function useFriends() {
  const context = useContext(FriendsContext)
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider')
  }
  return context
}
