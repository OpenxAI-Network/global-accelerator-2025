'use client'

import { useState, useEffect } from 'react'

interface RegularCalendarEvent {
  event_id: number
  location: string
  date: string
  start_time: string
  end_time: string
  description: string
  host_id: number
  users: string[]
  invitations: string[]
}

interface User {
  id: number
  username: string
  email: string
  city: string
  country: string
  bio?: string
}

interface EditEventData {
  event_id: number
  location: string
  date: string
  start_time: string
  end_time: string
  description: string
}

interface Participant {
  id: number
  username: string
  status: 'attending' | 'invited'
}

export default function RegularCalendarPage() {
  const [events, setEvents] = useState<RegularCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EditEventData | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [participantsEvent, setParticipantsEvent] = useState<RegularCalendarEvent | null>(null)
  const [currentEventParticipants, setCurrentEventParticipants] = useState<Participant[]>([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<any[]>([])
  const [showUserSearchResults, setShowUserSearchResults] = useState(false)

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      fetchRegularCalendarEvents(parsed.id)
    } else {
      setError('User not found. Please log in.')
      setLoading(false)
    }
  }, [])

  // User search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userSearchQuery.length >= 3) {
        searchUsers(userSearchQuery)
      } else {
        setUserSearchResults([])
        setShowUserSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [userSearchQuery, user])

  const fetchRegularCalendarEvents = async (userId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/regular-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch regular calendar events')
      }

      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error('Error fetching regular calendar events:', err)
      setError('Failed to load regular calendar events')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (eventId: number) => {
    if (!user) return
    
    try {
      const response = await fetch('/api/regular-calendar/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          event_id: eventId, 
          user_id: user.id 
        }),
      })

      if (response.ok) {
        // Refresh events to show updated status
        fetchRegularCalendarEvents(user.id)
      } else {
        const errorData = await response.json()
        alert(`Failed to accept invitation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      alert('Failed to accept invitation. Please try again.')
    }
  }

  const rejectInvitation = async (eventId: number) => {
    if (!user) return
    
    try {
      const response = await fetch('/api/regular-calendar/reject-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          event_id: eventId, 
          user_id: user.id 
        }),
      })

      if (response.ok) {
        // Refresh events to show updated status
        fetchRegularCalendarEvents(user.id)
      } else {
        const errorData = await response.json()
        alert(`Failed to reject invitation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error)
      alert('Failed to reject invitation. Please try again.')
    }
  }

  const openEditModal = (event: RegularCalendarEvent) => {
    // Only allow editing if user is the host
    if (event.host_id !== user?.id) {
      alert('Only the event host can edit this event.')
      return
    }
    
    setEditingEvent({
      event_id: event.event_id,
      location: event.location,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      description: event.description
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingEvent(null)
  }

  const updateEventData = (field: keyof EditEventData, value: string) => {
    if (editingEvent) {
      setEditingEvent({
        ...editingEvent,
        [field]: value
      })
    }
  }

  const saveEventChanges = async () => {
    if (!editingEvent || !user) return
    
    setEditLoading(true)
    try {
      const response = await fetch('/api/regular-calendar/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: editingEvent.event_id,
          location: editingEvent.location,
          date: editingEvent.date,
          start_time: editingEvent.start_time,
          end_time: editingEvent.end_time,
          description: editingEvent.description,
          host_id: user.id
        }),
      })

      if (response.ok) {
        alert('Event updated successfully!')
        closeEditModal()
        // Refresh events to show updated data
        fetchRegularCalendarEvents(user.id)
      } else {
        const errorData = await response.json()
        alert(`Failed to update event: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const openParticipantsModal = async (event: RegularCalendarEvent) => {
    // Only allow host to manage participants
    if (event.host_id !== user?.id) {
      alert('Only the event host can manage participants.')
      return
    }
    
    setParticipantsEvent(event)
    setParticipantsLoading(true)
    try {
      const response = await fetch('/api/regular-calendar/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: event.event_id }),
      })

      if (response.ok) {
        const participants = await response.json()
        setCurrentEventParticipants(participants)
        setShowParticipantsModal(true)
      } else {
        const errorData = await response.json()
        alert(`Failed to load participants: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error loading participants:', error)
      alert('Failed to load participants. Please try again.')
    } finally {
      setParticipantsLoading(false)
    }
  }

  const closeParticipantsModal = () => {
    setShowParticipantsModal(false)
    setParticipantsEvent(null)
    setCurrentEventParticipants([])
    setUserSearchQuery('')
    setUserSearchResults([])
    setShowUserSearchResults(false)
  }

  const removeParticipant = async (participantId: number) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to remove this participant?')) {
      return
    }
    
    try {
      const response = await fetch('/api/regular-calendar/remove-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: participantsEvent?.event_id || 0,
          user_id: participantId,
          host_id: user.id
        }),
      })

      if (response.ok) {
        alert('Participant removed successfully!')
        // Refresh participants list
        if (participantsEvent) {
          const refreshResponse = await fetch('/api/regular-calendar/participants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ event_id: participantsEvent.event_id }),
          })
          if (refreshResponse.ok) {
            const participants = await refreshResponse.json()
            setCurrentEventParticipants(participants)
          }
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to remove participant: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error removing participant:', error)
      alert('Failed to remove participant. Please try again.')
    }
  }

  const searchUsers = async (query: string) => {
    if (query.length < 3 || !user) return
    
    try {
      const response = await fetch('/api/user-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          query: query
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserSearchResults(data)
        setShowUserSearchResults(true)
      } else {
        setUserSearchResults([])
        setShowUserSearchResults(false)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setUserSearchResults([])
      setShowUserSearchResults(false)
    }
  }

  const addInvitation = async (selectedUser: any) => {
    if (!user || !participantsEvent) return
    
    try {
      const response = await fetch('/api/regular-calendar/add-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: participantsEvent.event_id,
          user_id: selectedUser.id || selectedUser.friend_id,
          host_id: user.id
        }),
      })

      if (response.ok) {
        alert('Invitation sent successfully!')
        // Refresh participants list
        const refreshResponse = await fetch('/api/regular-calendar/participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event_id: participantsEvent.event_id }),
        })
        if (refreshResponse.ok) {
          const participants = await refreshResponse.json()
          setCurrentEventParticipants(participants)
        }
        setUserSearchQuery('')
        setShowUserSearchResults(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to send invitation: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
    }
  }

  const deleteEvent = async (event: RegularCalendarEvent) => {
    if (!user) return
    
    if (!confirm(`Are you sure you want to delete the event "${event.location}"? This action cannot be undone and all participants will be notified.`)) {
      return
    }
    
    try {
      const response = await fetch('/api/regular-calendar/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.event_id,
          host_id: user.id
        }),
      })

      if (response.ok) {
        alert('Event deleted successfully!')
        // Refresh events list
        fetchRegularCalendarEvents(user.id)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete event: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }

  const leaveEvent = async (event: RegularCalendarEvent) => {
    if (!user) return
    
    if (!confirm(`Are you sure you want to leave the event "${event.location}"?`)) {
      return
    }
    
    try {
      const response = await fetch('/api/regular-calendar/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.event_id,
          user_id: user.id
        }),
      })

      if (response.ok) {
        alert('Left event successfully!')
        // Refresh events list
        fetchRegularCalendarEvents(user.id)
      } else {
        const errorData = await response.json()
        alert(`Failed to leave event: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error leaving event:', error)
      alert('Failed to leave event. Please try again.')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(event => {
      const eventDate = event.date
      return eventDate === dateStr
    })
  }

  const formatTime = (timeString: string) => {
    // Assuming time is in HH:MM format
    return timeString
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const renderCalendarGrid = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 bg-gray-50"></div>)
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day)
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
      
      days.push(
        <div 
          key={day} 
          className={`p-2 border border-gray-200 min-h-[120px] ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.map((event, index) => (
              <div 
                key={index} 
                className="text-xs p-1 bg-green-100 text-green-800 rounded truncate"
                title={`${event.location} - ${formatTime(event.start_time)}`}
              >
                {event.location}
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading regular calendar...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Regular Calendar</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => user && fetchRegularCalendarEvents(user.id)}
                className="px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded-md"
              >
                Refresh
              </button>
              <button
                onClick={goToPreviousMonth}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Previous
              </button>
              <button
                onClick={goToCurrentMonth}
                className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-md"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {renderCalendarGrid()}
          </div>

          {/* Events List */}
          {events.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Events</h3>
              <div className="space-y-3">
                {events.map((event, index) => {
                  // Check if current user has a pending invitation for this event
                  const hasPendingInvitation = event.invitations && event.invitations.length > 0 && 
                    event.invitations.some((invitation: string) => invitation === user?.username)
                  
                  // Check if current user is attending this event
                  const isAttending = event.users && event.users.length > 0 && 
                    event.users.some((attendee: string) => attendee === user?.username)
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.location}</h4>
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>📅 {formatDate(event.date)}</span>
                            <span>🕐 {formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                          </div>
                          {event.users && event.users.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                👥 Attendees: {event.users.join(', ')}
                              </p>
                            </div>
                          )}
                          {event.invitations && event.invitations.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                📧 Pending Invitations: {event.invitations.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 ml-4">
                          {/* Host management buttons */}
                          {event.host_id === user?.id && (
                            <>
                              <button
                                onClick={() => openEditModal(event)}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openParticipantsModal(event)}
                                className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                              >
                                Manage Participants
                              </button>
                              <button
                                onClick={() => deleteEvent(event)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Delete Event
                              </button>
                            </>
                          )}
                          
                          {/* Leave button for attendees (non-hosts) */}
                          {isAttending && event.host_id !== user?.id && (
                            <button
                              onClick={() => leaveEvent(event)}
                              className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                            >
                              Leave Event
                            </button>
                          )}
                          
                          {/* Accept/Reject buttons for pending invitations */}
                          {hasPendingInvitation && (
                            <>
                              <button
                                onClick={() => acceptInvitation(event.event_id)}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => rejectInvitation(event.event_id)}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="mt-8 text-center text-gray-500">
              <p>No events found for this month.</p>
              <p className="text-sm mt-2">Create events to see them in your regular calendar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Participants Management Popup */}
      {showParticipantsModal && participantsEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 flex items-start justify-center z-50 pt-20"
          onClick={closeParticipantsModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Manage Participants</h3>
              <button
                onClick={closeParticipantsModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Add New Invitation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Invitation</label>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search for users to invite..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showUserSearchResults && userSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                      {userSearchResults.map((result, index) => {
                        const isAlreadyParticipant = currentEventParticipants.some(p => 
                          p.id === (result.id || result.friend_id)
                        )
                        return (
                          <button
                            key={index}
                            onClick={() => !isAlreadyParticipant && addInvitation(result)}
                            disabled={isAlreadyParticipant}
                            className={`w-full text-left px-3 py-2 focus:outline-none text-sm ${
                              isAlreadyParticipant 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'hover:bg-gray-100 focus:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{result.username}</span>
                              {isAlreadyParticipant && (
                                <span className="text-xs text-gray-400">Already invited/attending</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Participants</label>
                {participantsLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading participants...</div>
                ) : currentEventParticipants.length > 0 ? (
                  <div className="space-y-2">
                    {currentEventParticipants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">{participant.username}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            participant.status === 'attending' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participant.status === 'attending' ? 'Attending' : 'Invited'}
                          </span>
                        </div>
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No participants yet</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={closeParticipantsModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Event</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Event Name/Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => updateEventData('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => updateEventData('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-vertical"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingEvent.date}
                  onChange={(e) => updateEventData('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingEvent.start_time}
                    onChange={(e) => updateEventData('start_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingEvent.end_time}
                    onChange={(e) => updateEventData('end_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEventChanges}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
