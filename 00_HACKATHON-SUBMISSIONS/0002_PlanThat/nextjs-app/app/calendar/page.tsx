'use client'

import { useState, useEffect } from 'react'

interface CalendarEvent {
  summary: string
  description?: string
  start: string
  end: string
  location?: string
  attendees?: string[]
  attendees_emails?: string[]
  attendees_names?: string[]
}

interface User {
  id: number
  username: string
  email: string
  city: string
  country: string
  bio?: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      fetchCalendarEvents(parsed.id)
    } else {
      setError('User not found. Please log in.')
      setLoading(false)
    }
  }, [])

  const fetchCalendarEvents = async (userId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/calendar/get?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events')
      }

      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error('Error fetching calendar events:', err)
      setError('Failed to load calendar events')
    } finally {
      setLoading(false)
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
      const eventDate = new Date(event.start).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
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
                className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                title={`${event.summary} - ${formatTime(event.start)}`}
              >
                {event.summary}
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
            <div className="text-lg text-gray-600">Loading calendar...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => user && fetchCalendarEvents(user.id)}
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
                {events.map((event, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.summary}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        {event.location && (
                          <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>📅 {formatDate(event.start)}</span>
                          <span>🕐 {formatTime(event.start)} - {formatTime(event.end)}</span>
                        </div>
                        {event.attendees_names && event.attendees_names.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              👥 Attendees: {event.attendees_names.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="mt-8 text-center text-gray-500">
              <p>No events found for this month.</p>
              <p className="text-sm mt-2">Make sure your Google Calendar is connected and you have events scheduled.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
