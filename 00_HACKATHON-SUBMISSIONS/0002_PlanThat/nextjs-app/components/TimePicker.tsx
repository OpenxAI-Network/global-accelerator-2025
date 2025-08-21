'use client'

import { useState, useRef, useEffect } from 'react'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  label: string
  className?: string
}

export default function TimePicker({ value, onChange, label, className = '' }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate 15-minute intervals starting from current time
  const generateTimeOptions = () => {
    const options = []
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Round current time up to next 15-minute interval
    let startMinute = Math.ceil(currentMinute / 15) * 15
    let startHour = currentHour
    
    if (startMinute >= 60) {
      startMinute = 0
      startHour += 1
    }
    
    // Generate times starting from the next 15-minute interval
    for (let hour = startHour; hour < 24; hour++) {
      const minuteStart = hour === startHour ? startMinute : 0
      for (let minute = minuteStart; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeString)
      }
    }
    
    // If we're near the end of the day, add times for tomorrow
    if (options.length < 10) {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          options.push(timeString)
        }
      }
    }
    
    return options
  }

  const timeOptions = generateTimeOptions()
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const roundedCurrentMinute = Math.ceil(currentMinute / 15) * 15
  const nextIntervalHour = roundedCurrentMinute >= 60 ? currentHour + 1 : currentHour
  const nextIntervalMinute = roundedCurrentMinute >= 60 ? 0 : roundedCurrentMinute

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setIsOpen(false)
  }

  const formatDisplayTime = (time: string) => {
    if (!time) return 'Select time'
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div ref={dropdownRef} className="relative">
        <input
          type="text"
          readOnly
          value={value ? formatDisplayTime(value) : ''}
          onClick={() => setIsOpen(!isOpen)}
          placeholder="Select time"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
        />
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm ${
                  value === time ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                {formatDisplayTime(time)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
