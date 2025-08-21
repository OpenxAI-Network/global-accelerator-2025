'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import OverpassControls from '../components/OverpassControls'
import Accordion from '../components/Accordion'
import TimePicker from '../components/TimePicker'

const MapClient = dynamic(() => import('../components/CityMap'), { ssr: false })

interface User {
  id: number
  username: string
  email: string
  city: string
  country: string
  bio?: string
  food?: number
  drinks?: number
  nightlife?: number
  nature?: number
  arts?: number
  entertainment?: number
  sports?: number
  shopping?: number
  music?: number
  diet_restrictions?: string
  dislikes?: string
}

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [amenity, setAmenity] = useState<'restaurant' | 'bar' | 'nightlife' | 'nature' | 'arts' | 'entertainment' | 'sports' | 'shopping' | 'live_music' | 'cafes' | 'fast_desserts' | 'results' | 'bookmarks' | null>(null)
  const [radius, setRadius] = useState<number>(1000)
  const [currentlyOpen, setCurrentlyOpen] = useState<boolean>(false)
  const [cityInput, setCityInput] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [countryInput, setCountryInput] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [locationInput, setLocationInput] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFormMinimized, setIsFormMinimized] = useState(false)
  const [planResult, setPlanResult] = useState<string>('')
    const [parsedResults, setParsedResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false)
  const [meetingType, setMeetingType] = useState('friendly-meetup')
  const [numberOfPeople, setNumberOfPeople] = useState('1')
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState('any')
  const [additionalPreferences, setAdditionalPreferences] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formTab, setFormTab] = useState<'inputs' | 'prompts'>('inputs')
  const [customPrompt, setCustomPrompt] = useState('')
  const [customPromptLocation, setCustomPromptLocation] = useState('')
  
  // User search state variables
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<any[]>([])
  const [showUserSearchResults, setShowUserSearchResults] = useState(false)
  const [customPromptLocationSuggestions, setCustomPromptLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showCustomPromptLocationSuggestions, setShowCustomPromptLocationSuggestions] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState<LocationSuggestion[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCityCountry, setSelectedCityCountry] = useState<string>('')
  const [locationValidationError, setLocationValidationError] = useState<string>('')
  const [customPromptValidationError, setCustomPromptValidationError] = useState<string>('')
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  
  // Calendar popup form state variables
  const [showCalendarPopup, setShowCalendarPopup] = useState(false)
  const [calendarEventData, setCalendarEventData] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    date: '',
    startTime: '',
    endTime: '',
    invitedUsers: [] as any[]
  })
  
  // Calendar popup user search state
  const [popupUserSearchQuery, setPopupUserSearchQuery] = useState('')
  const [popupUserSearchResults, setPopupUserSearchResults] = useState<any[]>([])
  const [showPopupUserSearchResults, setShowPopupUserSearchResults] = useState(false)
  
  // Results search state
  const [resultsSearchQuery, setResultsSearchQuery] = useState('')
  const [filteredResults, setFilteredResults] = useState<any[]>([])

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setCityInput(parsed.city ?? '')
      setSelectedCity(parsed.city ?? null)
      setCountryInput(parsed.country ?? '')
      setSelectedCountry(parsed.country ?? null)
    }
    setLoading(false)
  }, [])

  // Nominatim API for location suggestions
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (locationInput.length >= 3) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=10&accept-language=en`
          )
          const data = await response.json()
          
          // Sort suggestions to prioritize user's country first
          const userCountry = selectedCountry || user?.country || ''
          const sortedSuggestions = data.sort((a: LocationSuggestion, b: LocationSuggestion) => {
            const aInUserCountry = userCountry && a.display_name.toLowerCase().includes(userCountry.toLowerCase())
            const bInUserCountry = userCountry && b.display_name.toLowerCase().includes(userCountry.toLowerCase())
            
            if (aInUserCountry && !bInUserCountry) return -1
            if (!aInUserCountry && bInUserCountry) return 1
            return 0
          })
          
          setLocationSuggestions(sortedSuggestions)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error fetching location suggestions:', error)
        }
      } else {
        setLocationSuggestions([])
        setShowSuggestions(false)
      }
    }

    const timeoutId = setTimeout(fetchLocationSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [locationInput, selectedCountry, user?.country])

    // Filter results based on search query
  useEffect(() => {
    console.log('Filtering results: parsedResults length =', parsedResults.length, 'searchQuery =', resultsSearchQuery)
    console.log('Parsed results:', parsedResults)
    
    if (resultsSearchQuery.trim() === '') {
      console.log('Setting filteredResults to all parsedResults')
      setFilteredResults(parsedResults)
    } else {
      const filtered = parsedResults.filter(result => {
        const searchTerm = resultsSearchQuery.toLowerCase()
        const name = (result.name || '').toLowerCase()
        const description = (result.description || '').toLowerCase()
        const address = (result.address || '').toLowerCase()
        const priceRange = (result.price_range || '').toLowerCase()
        const openingHours = (result.opening_hours || '').toLowerCase()
        
        return name.includes(searchTerm) || 
               description.includes(searchTerm) || 
               address.includes(searchTerm) || 
               priceRange.includes(searchTerm) || 
               openingHours.includes(searchTerm)
      })
      console.log('Setting filteredResults to', filtered.length, 'filtered results')
      setFilteredResults(filtered)
    }
  }, [resultsSearchQuery, parsedResults])

  // Reset active tab when filtered results change
  useEffect(() => {
    if (filteredResults.length > 0 && activeTab >= filteredResults.length) {
      setActiveTab(0)
    }
  }, [filteredResults, activeTab])

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setLocationInput(suggestion.display_name)
    setShowSuggestions(false)
    setLocationValidationError('') // Clear validation error when valid location is selected
  }

  // User search functionality
  useEffect(() => {
    const searchUsers = async () => {
      if (userSearchQuery.length >= 3 && user) {
        try {
          const response = await fetch('/api/user-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              query: userSearchQuery
            }),
          })

          if (response.ok) {
            const data = await response.json()
            setUserSearchResults(data)
            setShowUserSearchResults(true)
          } else {
            console.error('User search failed')
            setUserSearchResults([])
            setShowUserSearchResults(false)
          }
        } catch (error) {
          console.error('Error searching users:', error)
          setUserSearchResults([])
          setShowUserSearchResults(false)
        }
      } else {
        setUserSearchResults([])
        setShowUserSearchResults(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [userSearchQuery, user])

  // Custom prompt location autocomplete effect
  useEffect(() => {
    const fetchCustomPromptLocationSuggestions = async () => {
      if (customPromptLocation.length >= 3) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customPromptLocation)}&limit=10&accept-language=en`
          )
          const data = await response.json()
          
          // Sort suggestions to prioritize user's country first
          const userCountry = selectedCountry || user?.country || ''
          const sortedSuggestions = data.sort((a: LocationSuggestion, b: LocationSuggestion) => {
            const aInUserCountry = userCountry && a.display_name.toLowerCase().includes(userCountry.toLowerCase())
            const bInUserCountry = userCountry && b.display_name.toLowerCase().includes(userCountry.toLowerCase())
            
            if (aInUserCountry && !bInUserCountry) return -1
            if (!aInUserCountry && bInUserCountry) return 1
            return 0
          })
          
          setCustomPromptLocationSuggestions(sortedSuggestions)
          setShowCustomPromptLocationSuggestions(true)
        } catch (error) {
          console.error('Error fetching custom prompt location suggestions:', error)
        }
      } else {
        setCustomPromptLocationSuggestions([])
        setShowCustomPromptLocationSuggestions(false)
      }
    }

    const timeoutId = setTimeout(fetchCustomPromptLocationSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [customPromptLocation, selectedCountry, user?.country])

  // City autocomplete effect
  useEffect(() => {
    const fetchCitySuggestions = async () => {
      if (cityInput.length >= 3) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&limit=10&accept-language=en&featuretype=city`
          )
          const data = await response.json()
          
          // Sort suggestions to prioritize user's country first
          const userCountry = selectedCountry || user?.country || ''
          const sortedSuggestions = data.sort((a: LocationSuggestion, b: LocationSuggestion) => {
            const aInUserCountry = userCountry && a.display_name.toLowerCase().includes(userCountry.toLowerCase())
            const bInUserCountry = userCountry && b.display_name.toLowerCase().includes(userCountry.toLowerCase())
            
            if (aInUserCountry && !bInUserCountry) return -1
            if (!aInUserCountry && bInUserCountry) return 1
            return 0
          })
          
          setCitySuggestions(sortedSuggestions)
          setShowCitySuggestions(true)
        } catch (error) {
          console.error('Error fetching city suggestions:', error)
        }
      } else {
        setCitySuggestions([])
        setShowCitySuggestions(false)
      }
    }

    const timeoutId = setTimeout(fetchCitySuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [cityInput, selectedCountry, user?.country])

  const handleUserSelect = (selectedUser: any) => {
    // Check if user is already selected
    const isAlreadySelected = selectedUsers.some(u => u.friend_id === selectedUser.friend_id || u.id === selectedUser.id)
    
    if (!isAlreadySelected) {
      setSelectedUsers([...selectedUsers, selectedUser])
    }
    setUserSearchQuery('')
    setShowUserSearchResults(false)
  }

  const removeSelectedUser = (userToRemove: any) => {
    setSelectedUsers(selectedUsers.filter(u => 
      (u.friend_id !== userToRemove.friend_id && u.id !== userToRemove.id) ||
      (u.friend_id === userToRemove.friend_id && u.id !== userToRemove.id) ||
      (u.friend_id !== userToRemove.friend_id && u.id === userToRemove.id)
    ))
  }

  const handleCustomPromptLocationSelect = (suggestion: LocationSuggestion) => {
    setCustomPromptLocation(suggestion.display_name)
    setShowCustomPromptLocationSuggestions(false)
    setLocationValidationError('') // Clear validation error when valid location is selected
  }

  const handleCitySelect = (suggestion: LocationSuggestion) => {
    // Extract city name and country from the full display name
    const displayName = suggestion.display_name
    const parts = displayName.split(',').map(part => part.trim())
    
    // Get the city name (first part)
    const cityName = parts[0]
    
    // Try to find the country (usually the last part, but let's be more robust)
    let countryName = ''
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i]
      // Check if this part looks like a country (not a state/province code)
      if (part.length > 2 && !/^[A-Z]{2,3}$/.test(part)) {
        countryName = part
        break
      }
    }
    
    // If we couldn't find a country, use the last part
    if (!countryName && parts.length > 1) {
      countryName = parts[parts.length - 1]
    }
    
    setCityInput(cityName)
    setSelectedCityCountry(countryName)
    setShowCitySuggestions(false)
  }

  // Function to open calendar popup with plan data
  const openCalendarPopup = (plan: any) => {
    if (!user) {
      alert('Please log in to add events to your calendar')
      return
    }

    // Extract coordinates from plan - prioritize AI response coordinates
    let latitude = 0
    let longitude = 0
    
    // First, try to use coordinates directly from AI response
    if (plan.lat && plan.lon) {
      latitude = parseFloat(plan.lat)
      longitude = parseFloat(plan.lon)
    } else if (plan.coordinates) {
      // Handle different coordinate formats as fallback
      if (typeof plan.coordinates === 'string') {
        // Format: "latitude,longitude" or "lat,lon"
        const coords = plan.coordinates.split(',')
        if (coords.length === 2) {
          latitude = parseFloat(coords[0].trim())
          longitude = parseFloat(coords[1].trim())
        }
      } else if (typeof plan.coordinates === 'object') {
        // Format: {lat: number, lon: number} or {latitude: number, longitude: number}
        if (plan.coordinates.lat && plan.coordinates.lon) {
          latitude = parseFloat(plan.coordinates.lat)
          longitude = parseFloat(plan.coordinates.lon)
        } else if (plan.coordinates.latitude && plan.coordinates.longitude) {
          latitude = parseFloat(plan.coordinates.latitude)
          longitude = parseFloat(plan.coordinates.longitude)
        }
      }
    }

    // Pre-fill the popup form with plan data
    setCalendarEventData({
      name: plan.name || 'PlanThat Event',
      address: plan.address || plan.location || plan.name || locationInput || '',
      latitude: latitude,
      longitude: longitude,
      date: selectedDate || new Date().toISOString().split('T')[0],
      startTime: startTime || '12:00',
      endTime: endTime || '14:00',
      invitedUsers: [...selectedUsers] // Copy selected users
    })
    
    setShowCalendarPopup(true)
  }

  // Function to add event to Regular Calendar from popup
  const addEventToCalendar = async () => {
    if (!user) {
      alert('Please log in to add events to your calendar')
      return
    }

    try {
      // Create event data for regular calendar
      const eventData = {
        location: calendarEventData.name,
        latitude: calendarEventData.latitude,
        longitude: calendarEventData.longitude,
        date: calendarEventData.date,
        start_time: calendarEventData.startTime,
        end_time: calendarEventData.endTime,
        description: `Event at ${calendarEventData.address || 'Location'}`,
        host_id: user.id,
        users: calendarEventData.invitedUsers.map(u => ({
          id: u.id || u.friend_id,
          username: u.username
        })).filter(u => u.id)
      }

      const response = await fetch('/api/regular-calendar/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        alert('Event added to your Regular Calendar successfully!')
        setShowCalendarPopup(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to add event: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding event to calendar:', error)
      alert('Failed to add event to calendar. Please try again.')
    }
  }

  // Function to close calendar popup
  const closeCalendarPopup = () => {
    setShowCalendarPopup(false)
    // Reset popup user search
    setPopupUserSearchQuery('')
    setPopupUserSearchResults([])
    setShowPopupUserSearchResults(false)
  }

  // User search functionality for popup
  useEffect(() => {
    const searchUsersForPopup = async () => {
      if (popupUserSearchQuery.length >= 3 && user) {
        try {
          const response = await fetch('/api/user-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id,
              query: popupUserSearchQuery
            }),
          })

          if (response.ok) {
            const data = await response.json()
            setPopupUserSearchResults(data)
            setShowPopupUserSearchResults(true)
          } else {
            console.error('User search failed')
            setPopupUserSearchResults([])
            setShowPopupUserSearchResults(false)
          }
        } catch (error) {
          console.error('Error searching users:', error)
          setPopupUserSearchResults([])
          setShowPopupUserSearchResults(false)
        }
      } else {
        setPopupUserSearchResults([])
        setShowPopupUserSearchResults(false)
      }
    }

    const timeoutId = setTimeout(searchUsersForPopup, 300)
    return () => clearTimeout(timeoutId)
  }, [popupUserSearchQuery, user])

  const handlePopupUserSelect = (selectedUser: any) => {
    // Check if user is already invited - handle both friend_id and id structures
    const selectedUserId = selectedUser.friend_id || selectedUser.id
    const isAlreadyInvited = calendarEventData.invitedUsers.some(u => {
      const invitedUserId = u.friend_id || u.id
      return invitedUserId === selectedUserId
    })
    
    console.log('Selected user:', selectedUser)
    console.log('Selected user ID:', selectedUserId)
    console.log('Current invited users:', calendarEventData.invitedUsers)
    console.log('Is already invited:', isAlreadyInvited)
    
    if (!isAlreadyInvited) {
      setCalendarEventData({
        ...calendarEventData,
        invitedUsers: [...calendarEventData.invitedUsers, selectedUser]
      })
    }
    // Keep the search input active for adding more users
    // Only clear the search results dropdown, not the input
    setShowPopupUserSearchResults(false)
  }

  // Helper function to parse AI response and extract JSON objects with geocoding
  const parseAIResponse = async (response: string) => {
    try {
      console.log('Parsing AI response:', response)
      
      let parsedResults: any[] = []
      
      // First, try to parse the entire response as a JSON array
      try {
        const parsedArray = JSON.parse(response)
        if (Array.isArray(parsedArray) && parsedArray.length > 0) {
          console.log('Successfully parsed as JSON array:', parsedArray)
          parsedResults = parsedArray.filter(item => item && item.name) // Only include valid objects with a name
        }
      } catch (arrayError) {
        console.log('Not a JSON array, trying other methods...')
      }
      
      // If no results from array parsing, try to find JSON arrays in the response
      if (parsedResults.length === 0) {
        const arrayMatches = response.match(/\[[\s\S]*?\]/g)
        if (arrayMatches) {
          for (const match of arrayMatches) {
            try {
              const parsed = JSON.parse(match)
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log('Successfully parsed JSON array from match:', parsed)
                parsedResults = parsed.filter(item => item && item.name)
                break
              }
            } catch (matchError) {
              console.log('Failed to parse array match:', matchError)
            }
          }
        }
      }
      
      // If still no results, try to find individual JSON objects in the response
      if (parsedResults.length === 0) {
        const jsonMatches = response.match(/\{[\s\S]*?\}/g)
        if (jsonMatches) {
          const parsed = jsonMatches.map(match => {
            try {
              return JSON.parse(match)
            } catch {
              return null
            }
          }).filter(item => item && item.name) // Only include valid objects with a name
          
          if (parsed.length > 0) {
            console.log('Successfully parsed individual JSON objects:', parsed)
            parsedResults = parsed
          }
        }
      }
      
      if (parsedResults.length === 0) {
        console.log('No valid JSON found in response')
        console.log('Raw response content:', response.substring(0, 500) + '...')
        return []
      }
      
      console.log(`Found ${parsedResults.length} initial results before geocoding`)
      
      // Since we're using coordinates directly from AI response, just return the parsed results
      console.log('Using coordinates directly from AI response')
      console.log('Returning', parsedResults.length, 'results from parseAIResponse')
      return parsedResults
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return []
    }
  }

  // Function to validate location using Nominatim API
  const validateLocation = async (location: string): Promise<boolean> => {
    if (!location || location.trim() === '') return false
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.trim())}&limit=1&accept-language=en`
      )
      const data = await response.json()
      return data.length > 0
    } catch (error) {
      console.error('Error validating location:', error)
      return false
    }
  }



  const handlePlanThat = async () => {
    setIsLoading(true)
    try {
      let prompt: string
      let requestBody: any
      
      // Validate custom prompt for User Prompts tab first
      if (formTab === 'prompts') {
        if (!customPrompt.trim()) {
          setCustomPromptValidationError('Please enter a custom prompt in the User Prompts section.')
          setIsLoading(false)
          return
        }
        setCustomPromptValidationError('') // Clear error if valid
      }
      
      // Validate location based on current tab
      let locationToValidate = ''
      if (formTab === 'prompts') {
        locationToValidate = customPromptLocation.trim()
        if (!locationToValidate) {
          alert('Please enter a valid location in the User Prompts section.')
          setIsLoading(false)
          return
        }
      } else {
        locationToValidate = locationInput.trim()
        if (!locationToValidate) {
          alert('Please enter a valid location in the User Inputs section.')
          setIsLoading(false)
          return
        }
      }
      
      // Validate the location
      const isValidLocation = await validateLocation(locationToValidate)
      if (!isValidLocation) {
        alert('Please enter a valid location. The location you entered could not be found.')
        setIsLoading(false)
        return
      }
      
      if (formTab === 'prompts' && customPrompt.trim()) {
        // Use custom prompt from User Prompts tab with user info
        const userPrompt = customPrompt.trim()
        const userFood = user?.food || 5
        const userDrinks = user?.drinks || 5
        const userNightlife = user?.nightlife || 5
        const userNature = user?.nature || 5
        const userArts = user?.arts || 5
        const userEntertainment = user?.entertainment || 5
        const userSports = user?.sports || 5
        const userShopping = user?.shopping || 5
        const userMusic = user?.music || 5
        const userDietRestrictions = user?.diet_restrictions || 'none'
        const userDislikes = user?.dislikes || 'none'
        
        const location = customPromptLocation.trim() || `${user?.city || 'Unknown'}, ${user?.country || 'Unknown'}`
        
        const role = `Act as an expert travel guide, focusing on recommending places to visit in the location provided by the user.`
        const task = `Recommend 5 places to visit in the location provided by the user: ${location}, and the following query: ${userPrompt}. Base the result on the user's preferences: 
        The user has provided the following preferences: food: ${userFood}/10, drinks: ${userDrinks}/10, nightlife: ${userNightlife}/10, nature: ${userNature}/10, arts: ${userArts}/10, entertainment: ${userEntertainment}/10, sports: ${userSports}/10, shopping: ${userShopping}/10, music: ${userMusic}/10 diet_restrictions: ${userDietRestrictions}, dislikes: ${userDislikes}`
        const context = `Prioritise accuracracy: location names and address must match official places (e.g google maps), and the coordinates must be valid. 
        Prioritise accuracy over creativity, and focus on providing the most accurate and relevant information possible.
        Highlight why the place is a good fit for the user's preferences in a concise summary.`
        const reasoning = `Internally, vet all suggested places to guarantee they are real, and that the coordinates are valid.
        Cross check place names with reliable sources like google maps, tripadvisor, yelp, apple maps, and do the same for coordinates.
        Ensure the place name is correct and not a typo.
        Also ensure the address of the place is correct and verified using an external source.
        Also ensure they fit the users preferences.
        If the place is not real, or is not backed by a reliable source, do not include it in the results.`
        const output_format  = `Returning the information in JSON format with these keys: "name", "address", "coordinates", "summary", "image", "link", "price_range", "opening_hours". put all locations in a list, and have each location as a seperate list item`
        const stop_condition = `Task is complete when five verified unique locations are found, re returned on the specified format, and valid coordinates are provided, and validation has confirmed full compliance with all requirements. Alternatively, if the user has provided a specific location, the task is complete when a verified unique location is found at that location., alternatively, if there are no results, return an empty array.`

        prompt = `Role: ${role}
        Task: ${task}
        Context: ${context}
        Reasoning: ${reasoning}
        Output Format: ${output_format}
        Stop Condition: ${stop_condition}`    

        setCurrentPrompt(prompt)
        requestBody = { prompt: prompt }
      } else {
        // Use structured form data from User Inputs tab
        // Separate activities by category and handle special values
        const foodActivities = selectedActivities.filter(a => ['restaurant', 'fancy-dining', 'fast-food'].includes(a))
        const drinkActivities = selectedActivities.filter(a => ['bar', 'cafes', 'live-music', 'sweet-drinks'].includes(a))
        const otherActivities = selectedActivities.filter(a => ['arts', 'entertainment', 'nature', 'nightlife', 'shopping', 'sightseeing', 'sports'].includes(a))

        // Check for special values (any/none) in each category
        const hasFoodAny = selectedActivities.includes('food-any')
        const hasFoodNone = selectedActivities.includes('food-none')
        const hasDrinksAny = selectedActivities.includes('drinks-any')
        const hasDrinksNone = selectedActivities.includes('drinks-none')
        const hasOtherAny = selectedActivities.includes('other-any')
        const hasOtherNone = selectedActivities.includes('other-none')

        // Prepare form data with special value handling
        const formData = {
          location: locationInput || `${user?.city || 'Unknown'}, ${user?.country || 'Unknown'}`,
          meetingType: meetingType === 'other' ? 'casual meetup' : meetingType,
          numberOfPeople: numberOfPeople,
          date: selectedDate || 'any',
          startTime: startTime || 'any',
          endTime: endTime || 'any',
          food: hasFoodAny ? 'any' : hasFoodNone ? 'none' : foodActivities.length > 0 ? foodActivities.join(', ') : 'none',
          drinks: hasDrinksAny ? 'any' : hasDrinksNone ? 'none' : drinkActivities.length > 0 ? drinkActivities.join(', ') : 'none',
          otherActivities: hasOtherAny ? 'any' : hasOtherNone ? 'none' : otherActivities.length > 0 ? otherActivities.join(', ') : 'none',
          priceRange: priceRange,
          additionalPreferences: additionalPreferences || 'none'
        }

        // Generate and display the prompt
        
        const role = `Act as an expert travel guide, focusing on recommending places to visit in the location provided by the user.`
        const task = `Recommend 5 places to visit in the location provided by the user: ${formData.location}. Base the result on the user's preferences: 
        The user has provided the following preferences: meeting type: ${formData.meetingType}, number of people: ${formData.numberOfPeople}, day of event: ${formData.date}, start time: ${formData.startTime}, end time: ${formData.endTime}, food: ${formData.food}, drinks: ${formData.drinks}, other activities: ${formData.otherActivities}, price range: ${formData.priceRange}, additional information: ${formData.additionalPreferences}`
        const context = `Prioritise accuracracy: location names and address must match official places (e.g google maps), and the coordinates must be valid. 
        Prioritise accuracy over creativity, and focus on providing the most accurate and relevant information possible.
        Highlight why the place is a good fit for the user's preferences in a concise summary.`
        const reasoning = `Internally, vet all suggested places to guarantee they are real, and that the coordinates are valid.
        Cross check place names with reliable sources like google maps, tripadvisor, yelp, apple maps, and do the same for coordinates.
        Ensure the place name is correct and not a typo.
        Also ensure the address of the place is correct and verified using an external source.
        Also ensure they fit the users preferences.
        If the place is not real, or is not backed by a reliable source, do not include it in the results.`
        const output_format  = `Returning the information in JSON format with these keys: "name", "address", "coordinates", "summary", "image", "link", "price_range", "opening_hours". put all locations in a list, and have each location as a seperate list item`
        const stop_condition = `Task is complete when five verified unique locations are found, re returned on the specified format, and valid coordinates are provided, and validation has confirmed full compliance with all requirements. Alternatively, if the user has provided a specific location, the task is complete when a verified unique location is found at that location., alternatively, if there are no results, return an empty array.`

        prompt = `Role: ${role}
        Task: ${task}
        Context: ${context}
        Reasoning: ${reasoning}
        Output Format: ${output_format}
        Stop Condition: ${stop_condition}`        

        setCurrentPrompt(prompt)
        requestBody = { prompt: prompt, ...formData }
      }

      const response = await fetch('/api/plan-that', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

                   const data = await response.json()
      console.log('API response data:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setPlanResult(data.result)
      
      // Parse the AI response to extract JSON objects with geocoding
      const parsed = await parseAIResponse(data.result)
      console.log('Parsed results:', parsed)
      console.log('Setting parsedResults with', parsed.length, 'items')
      setParsedResults(parsed)
      setActiveTab(0) // Reset to first tab
      
      // Automatically switch to Results tab on map if we have results with coordinates
      if (parsed.length > 0 && parsed.some((result: any) => result.coordinates)) {
        setAmenity('results')
      }
      
      setIsFormMinimized(true)
      setHasGeneratedPlan(true)
    } catch (error) {
      console.error('Error calling Plan That API:', error)
      
      // Check if we have any parsed results despite the error
      if (parsedResults.length > 0) {
        setPlanResult('Plan generated successfully! Some results may be incomplete.')
      } else {
        setPlanResult('Failed to generate plan. Please try again.')
      }
      
      setIsFormMinimized(true)
      setHasGeneratedPlan(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMoreOptions = async () => {
    setIsLoading(true)
    try {
      let prompt: string
      let requestBody: any
      
      // Validate custom prompt for User Prompts tab first
      if (formTab === 'prompts') {
        if (!customPrompt.trim()) {
          setCustomPromptValidationError('Please enter a custom prompt in the User Prompts section.')
          setIsLoading(false)
          return
        }
        setCustomPromptValidationError('') // Clear error if valid
      }
      
      // Validate location based on current tab
      let locationToValidate = ''
      if (formTab === 'prompts') {
        locationToValidate = customPromptLocation.trim()
        if (!locationToValidate) {
          alert('Please enter a valid location in the User Prompts section.')
          setIsLoading(false)
          return
        }
      } else {
        locationToValidate = locationInput.trim()
        if (!locationToValidate) {
          alert('Please enter a valid location in the User Inputs section.')
          setIsLoading(false)
          return
        }
      }
      
      // Validate the location
      const isValidLocation = await validateLocation(locationToValidate)
      if (!isValidLocation) {
        alert('Please enter a valid location. The location you entered could not be found.')
        setIsLoading(false)
        return
      }
      
      if (formTab === 'prompts' && customPrompt.trim()) {
        // Use custom prompt from User Prompts tab with user info
        const userPrompt = customPrompt.trim()
        const userFood = user?.food || 5
        const userDrinks = user?.drinks || 5
        const userNightlife = user?.nightlife || 5
        const userNature = user?.nature || 5
        const userArts = user?.arts || 5
        const userEntertainment = user?.entertainment || 5
        const userSports = user?.sports || 5
        const userShopping = user?.shopping || 5
        const userMusic = user?.music || 5
        const userDietRestrictions = user?.diet_restrictions || 'none'
        const userDislikes = user?.dislikes || 'none'
        
        const location = customPromptLocation.trim() || `${user?.city || 'Unknown'}, ${user?.country || 'Unknown'}`
        
        const role = `Act as an expert travel guide specializing in alternative and unique experiences.`
        const task = `Recommend 5 DIFFERENT and ALTERNATIVE places to visit in ${location} based on this query: "${userPrompt}". These should be COMPLETELY DIFFERENT from typical recommendations. Focus on:
        - Hidden gems and local secrets
        - Alternative venues and experiences
        - Different neighborhoods or areas
        - Unique cultural experiences
        - Off-the-beaten-path locations
        
        Base recommendations on user preferences: food: ${userFood}/10, drinks: ${userDrinks}/10, nightlife: ${userNightlife}/10, nature: ${userNature}/10, arts: ${userArts}/10, entertainment: ${userEntertainment}/10, sports: ${userSports}/10, shopping: ${userShopping}/10, music: ${userMusic}/10, diet_restrictions: ${userDietRestrictions}, dislikes: ${userDislikes}`
        const context = `AVOID mainstream or obvious recommendations. Prioritize unique, alternative, and diverse options that offer different experiences from typical tourist spots. Focus on local favorites, hidden gems, and unique venues.`
        const reasoning = `Think creatively and suggest places that are:
        - In different neighborhoods or areas than typical recommendations
        - Offer alternative experiences (e.g., if first suggestions were restaurants, suggest food trucks, markets, or cooking classes)
        - Include different price ranges or atmospheres
        - Feature unique cultural or local experiences
        - Are less known but highly rated by locals
        Internally, vet all suggested places to guarantee they are real, and that the coordinates are valid.
        Cross check place names with reliable sources like google maps, tripadvisor, yelp, apple maps, and do the same for coordinates.
        Ensure the place name is correct and not a typo.
        Also ensure the address of the place is correct and verified using an external source.
        Also ensure they fit the users preferences.
        If the place is not real, or is not backed by a reliable source, do not include it in the results.
        Ensure all places are real and have valid coordinates.`
        const output_format  = `Returning the information in JSON format with these keys: "name", "address", "coordinates", "summary", "image", "link", "price_range", "opening_hours". put all locations in a list, and have each location as a seperate list item`
        const stop_condition = `Task is complete when five verified unique alternative locations are found that are distinctly different from typical recommendations.`

        prompt = `Role: ${role}
        Task: ${task}
        Context: ${context}
        Reasoning: ${reasoning}
        Output Format: ${output_format}
        Stop Condition: ${stop_condition}`    
        setCurrentPrompt(prompt)
        requestBody = { prompt: prompt }
      } else {
        // Use structured form data from User Inputs tab
        // Separate activities by category and handle special values
        const foodActivities = selectedActivities.filter(a => ['restaurant', 'fancy-dining', 'fast-food'].includes(a))
        const drinkActivities = selectedActivities.filter(a => ['bar', 'cafes', 'live-music', 'sweet-drinks'].includes(a))
        const otherActivities = selectedActivities.filter(a => ['arts', 'entertainment', 'nature', 'nightlife', 'shopping', 'sightseeing', 'sports'].includes(a))

        // Check for special values (any/none) in each category
        const hasFoodAny = selectedActivities.includes('food-any')
        const hasFoodNone = selectedActivities.includes('food-none')
        const hasDrinksAny = selectedActivities.includes('drinks-any')
        const hasDrinksNone = selectedActivities.includes('drinks-none')
        const hasOtherAny = selectedActivities.includes('other-any')
        const hasOtherNone = selectedActivities.includes('other-none')

        // Prepare form data with special value handling
        const formData = {
          location: locationInput || `${user?.city || 'Unknown'}, ${user?.country || 'Unknown'}`,
          meetingType: meetingType === 'other' ? 'casual meetup' : meetingType,
          numberOfPeople: numberOfPeople,
          date: selectedDate || 'any',
          startTime: startTime || 'any',
          endTime: endTime || 'any',
          food: hasFoodAny ? 'any' : hasFoodNone ? 'none' : foodActivities.length > 0 ? foodActivities.join(', ') : 'none',
          drinks: hasDrinksAny ? 'any' : hasDrinksNone ? 'none' : drinkActivities.length > 0 ? drinkActivities.join(', ') : 'none',
          otherActivities: hasOtherAny ? 'any' : hasOtherNone ? 'none' : otherActivities.length > 0 ? otherActivities.join(', ') : 'none',
          priceRange: priceRange,
          additionalPreferences: additionalPreferences || 'none'
        }

        // Generate and display the prompt for alternative options
        const role = `Act as an expert travel guide specializing in alternative and unique experiences.`
        const task = `Recommend 5 DIFFERENT and ALTERNATIVE places to visit in ${formData.location} for a ${formData.meetingType} with ${formData.numberOfPeople} people. These should be COMPLETELY DIFFERENT from typical recommendations. Focus on:
        - Hidden gems and local secrets
        - Alternative venues and experiences
        - Different neighborhoods or areas
        - Unique cultural experiences
        - Off-the-beaten-path locations
        
        User preferences: meeting type: ${formData.meetingType}, number of people: ${formData.numberOfPeople}, day: ${formData.date}, time: ${formData.startTime}-${formData.endTime}, food: ${formData.food}, drinks: ${formData.drinks}, other activities: ${formData.otherActivities}, price range: ${formData.priceRange}, additional info: ${formData.additionalPreferences}`
        const context = `AVOID mainstream or obvious recommendations. Prioritize unique, alternative, and diverse options that offer different experiences from typical tourist spots. Focus on local favorites, hidden gems, and unique venues.`
        const reasoning = `Think creatively and suggest places that are:
        - In different neighborhoods or areas than typical recommendations
        - Offer alternative experiences (e.g., if first suggestions were restaurants, suggest food trucks, markets, or cooking classes)
        - Include different price ranges or atmospheres
        - Feature unique cultural or local experiences
        - Are less known but highly rated by locals
        
        Ensure all places are real and have valid coordinates.
        Internally, vet all suggested places to guarantee they are real, and that the coordinates are valid.
        Cross check place names with reliable sources like google maps, tripadvisor, yelp, apple maps, and do the same for coordinates.
        Ensure the place name is correct and not a typo.
        Also ensure the address of the place is correct and verified using an external source.
        Also ensure they fit the users preferences.
        If the place is not real, or is not backed by a reliable source, do not include it in the results.`
        const output_format  = `Returning the information in JSON format with these keys: "name", "address", "coordinates", "summary", "image", "link", "price_range", "opening_hours". put all locations in a list, and have each location as a seperate list item`
        const stop_condition = `Task is complete when five verified unique alternative locations are found that are distinctly different from typical recommendations.`

        prompt = `Role: ${role}
        Task: ${task}
        Context: ${context}
        Reasoning: ${reasoning}
        Output Format: ${output_format}
        Stop Condition: ${stop_condition}`

        setCurrentPrompt(prompt)
        requestBody = { prompt: prompt, ...formData }
      }

      const response = await fetch('/api/plan-that', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      console.log("test")
      

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

                   const data = await response.json()
      console.log('More Options API response data:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setPlanResult(prevResult => prevResult + '\n\n' + data.result)
      
      // Parse the new AI response and add to existing results
      const newParsed = await parseAIResponse(data.result)
      console.log('More Options parsed results:', newParsed)
      setParsedResults(prevResults => {
        console.log('Adding', newParsed.length, 'new results to existing', prevResults.length, 'results')
        const combined = [...prevResults, ...newParsed]
        console.log('Combined results:', combined.length, 'total')
        return combined
      })
      
      // Automatically switch to Results tab on map if we have new results with coordinates
      if (newParsed.length > 0 && newParsed.some((result: any) => result.coordinates)) {
        setAmenity('results')
      }
    } catch (error) {
      console.error('Error calling Plan That API:', error)
      setPlanResult(prevResult => prevResult + '\n\nFailed to generate plan. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPlanResult('')
    setParsedResults([])
    setActiveTab(0)
    setIsFormMinimized(false)
    setHasGeneratedPlan(false)
    setLocationInput('')
    setLocationSuggestions([])
    setShowSuggestions(false)
    setMeetingType('friendly-meetup')
    setNumberOfPeople('1')
    setSelectedDate('')
    setStartTime('')
    setEndTime('')
    setSelectedActivities([])
    setPriceRange('any')
    setAdditionalPreferences('')
    setCurrentPrompt('')
    setFormTab('inputs') // Reset to User Inputs tab
    setCustomPrompt('') // Clear custom prompt
    setAmenity(null) // Clear the map amenity selection
    setCurrentlyOpen(false) // Reset currently open filter
  }

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cityInput.trim()) {
      setSelectedCity(cityInput.trim())
      // If we have a country from autocomplete, use it; otherwise keep the current selected country
      if (selectedCityCountry) {
        setSelectedCountry(selectedCityCountry)
      }
      setSelectedCityCountry('') // Clear the autocomplete country selection
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // This should be handled by middleware, but just in case
    router.push('/auth/login')
    return null
  }

  const OverpassControlsWrapper = () => (
    <OverpassControls
      amenity={amenity}
      radius={radius}
      currentlyOpen={currentlyOpen}
      onChange={({ amenity, radius, currentlyOpen }) => {
        setAmenity(amenity)
        setRadius(radius)
        setCurrentlyOpen(currentlyOpen)
      }}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Card (Left) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Plan Your Meetup</h2>
            {!isFormMinimized ? (
              <div className="space-y-4">
                {/* Form Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setFormTab('inputs')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      formTab === 'inputs'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    User Inputs
                  </button>
                  <button
                    onClick={() => setFormTab('prompts')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      formTab === 'prompts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    User Prompts
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {formTab === 'inputs' ? 'Plan Details' : 'Custom Prompt'}
                  </h3>
                  <button
                    onClick={() => setIsFormMinimized(true)}
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <span>Hide Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                
                {/* Tab Content */}
                {formTab === 'inputs' ? (
                  <div className="space-y-4">
                    {/* User Search */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Friends/Users</label>
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search for friends and users..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showUserSearchResults && userSearchResults.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {userSearchResults.map((result, index) => (
                            <button
                              key={index}
                              onClick={() => handleUserSelect(result)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                            >
                              {result.username}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Users Display */}
                    {selectedUsers.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Selected Users:</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedUsers.map((selectedUser, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                            >
                              <span>{selectedUser.username}</span>
                              <button
                                onClick={() => removeSelectedUser(selectedUser)}
                                className="text-blue-600 hover:text-blue-800 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => {
                          setLocationInput(e.target.value)
                          setLocationValidationError('') // Clear error when user types
                        }}
                        placeholder="Enter your location..."
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          locationValidationError && formTab === 'inputs' ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {locationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleLocationSelect(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                            >
                              {suggestion.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                      {locationValidationError && formTab === 'inputs' && (
                        <p className="text-red-500 text-sm mt-1">{locationValidationError}</p>
                      )}
                    </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type of Meetup</label>
                  <select 
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="friendly-meetup">Friendly Meetup</option>
                    <option value="date">Romantic Date</option>
                    <option value="get-together">Get Together</option>
                    <option value="client-meeting">Client Meeting</option>
                    <option value="family-get-together">Family Get Together</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of People</label>
                  <select 
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7+">7+</option>
                  </select>
                </div>
                <Accordion title="Date & Time" defaultOpen={false}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <TimePicker
                      value={startTime}
                      onChange={setStartTime}
                      label="Start Time"
                    />
                    <TimePicker
                      value={endTime}
                      onChange={setEndTime}
                      label="End Time"
                    />
                  </div>
                </Accordion>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food</label>
                  <select
                    multiple
                    value={selectedActivities.filter(a => ['restaurant', 'fancy-dining', 'fast-food', 'food-dessert', 'food-any', 'food-none'].includes(a))}
                    onChange={(e) => {
                      const foodValues = Array.from(e.target.selectedOptions, option => option.value)
                      const nonFoodActivities = selectedActivities.filter(a => !['restaurant', 'fancy-dining', 'fast-food', 'food-dessert', 'food-any', 'food-none'].includes(a))
                      
                      // Handle special values
                      let newFoodValues: string[] = []
                      if (foodValues.includes('food-any')) {
                        newFoodValues = ['food-any']
                      } else if (foodValues.includes('food-none')) {
                        newFoodValues = ['food-none']
                      } else {
                        newFoodValues = foodValues.filter(v => !['food-any', 'food-none'].includes(v))
                      }
                      
                      setSelectedActivities([...nonFoodActivities, ...newFoodValues])
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  >
                    <option value="food-none">None</option>
                    <option value="food-any">Any</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="fancy-dining">Fancy Dining</option>
                    <option value="fast-food">Fast Food</option>
                    <option value="food-dessert">Desserts & Sweets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drinks</label>
                  <select
                    multiple
                    value={selectedActivities.filter(a => ['bar', 'cafes', 'live-music', 'sweet-drinks', 'drinks-any', 'drinks-none'].includes(a))}
                    onChange={(e) => {
                      const drinkValues = Array.from(e.target.selectedOptions, option => option.value)
                      const nonDrinkActivities = selectedActivities.filter(a => !['bar', 'cafes', 'live-music', 'sweet-drinks', 'drinks-any', 'drinks-none'].includes(a))
                      
                      // Handle special values
                      let newDrinkValues: string[] = []
                      if (drinkValues.includes('drinks-any')) {
                        newDrinkValues = ['drinks-any']
                      } else if (drinkValues.includes('drinks-none')) {
                        newDrinkValues = ['drinks-none']
                      } else {
                        newDrinkValues = drinkValues.filter(v => !['drinks-any', 'drinks-none'].includes(v))
                      }
                      
                      setSelectedActivities([...nonDrinkActivities, ...newDrinkValues])
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  >
                    <option value="drinks-none">None</option>
                    <option value="drinks-any">Any</option>
                    <option value="bar">Bar</option>
                    <option value="cafes">Cafes</option>
                    <option value="live-music">Live Music</option>
                    <option value="sweet-drinks">Sweet Drinks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
                  <select
                    multiple
                    value={selectedActivities.filter(a => ['arts', 'entertainment', 'nature', 'nightlife', 'shopping', 'sightseeing', 'sports', 'other-any', 'other-none'].includes(a))}
                    onChange={(e) => {
                      const otherValues = Array.from(e.target.selectedOptions, option => option.value)
                      const nonOtherActivities = selectedActivities.filter(a => !['arts', 'entertainment', 'nature', 'nightlife', 'shopping', 'sightseeing', 'sports', 'other-any', 'other-none'].includes(a))
                      
                      // Handle special values
                      let newOtherValues: string[] = []
                      if (otherValues.includes('other-any')) {
                        newOtherValues = ['other-any']
                      } else if (otherValues.includes('other-none')) {
                        newOtherValues = ['other-none']
                      } else {
                        newOtherValues = otherValues.filter(v => !['other-any', 'other-none'].includes(v))
                      }
                      
                      setSelectedActivities([...nonOtherActivities, ...newOtherValues])
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  >
                    <option value="other-none">None</option>
                    <option value="other-any">Any</option>
                    <option value="arts">Arts</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="nature">Nature</option>
                    <option value="nightlife">Nightlife</option>
                    <option value="shopping">Shopping</option>
                    <option value="sightseeing">SightSeeing</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                   <select 
                     value={priceRange}
                     onChange={(e) => setPriceRange(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="any">Any</option>
                     <option value="$0-$20">$0-$20</option>
                     <option value="$20-$40">$20-$40</option>
                     <option value="$40-$60">$40-$60</option>
                     <option value="$60-$80">$60-$80</option>
                     <option value="$80-$100">$80-$100</option>
                     <option value="$100+">$100+</option>
                   </select>
                 </div>
                <div>
                  <input
                    type="text"
                    value={additionalPreferences}
                    onChange={(e) => setAdditionalPreferences(e.target.value)}
                    placeholder="Any additional preferences?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handlePlanThat}
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-md transition-colors ${
                    isLoading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating Plan...</span>
                    </div>
                  ) : 'Plan That!'}
                </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* User Search for Custom Prompt */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Friends/Users</label>
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search for friends and users..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showUserSearchResults && userSearchResults.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {userSearchResults.map((result, index) => (
                            <button
                              key={index}
                              onClick={() => handleUserSelect(result)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                            >
                              {result.username}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Users Display for Custom Prompt */}
                    {selectedUsers.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Selected Users:</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedUsers.map((selectedUser, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                            >
                              <span>{selectedUser.username}</span>
                              <button
                                onClick={() => removeSelectedUser(selectedUser)}
                                className="text-blue-600 hover:text-blue-800 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        value={customPromptLocation}
                        onChange={(e) => {
                          setCustomPromptLocation(e.target.value)
                          setLocationValidationError('') // Clear error when user types
                        }}
                        placeholder="Enter location for your event..."
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          locationValidationError && formTab === 'prompts' ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {showCustomPromptLocationSuggestions && customPromptLocationSuggestions.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {customPromptLocationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleCustomPromptLocationSelect(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                            >
                              {suggestion.display_name}
                            </button>
                          ))}
                        </div>
                      )}
                      {locationValidationError && formTab === 'prompts' && (
                        <p className="text-red-500 text-sm mt-1">{locationValidationError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Prompt *</label>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => {
                          setCustomPrompt(e.target.value)
                          setCustomPromptValidationError('') // Clear error when user types
                        }}
                        placeholder="Enter your custom prompt for planning..."
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-vertical ${
                          customPromptValidationError ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {customPromptValidationError && (
                        <p className="text-red-500 text-sm mt-1">{customPromptValidationError}</p>
                      )}
                    </div>
                    <button
                      onClick={handlePlanThat}
                      disabled={isLoading}
                      className={`w-full py-2 px-4 rounded-md transition-colors ${
                        isLoading
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating Plan...</span>
                        </div>
                      ) : 'Plan That!'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Plans:</h3>
                  <button
                    onClick={() => setIsFormMinimized(false)}
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <span>Show Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                                 <div className="bg-gray-50 rounded-lg p-4">
                   {hasGeneratedPlan ? (
                     <div>
                       
                       {/* Search Bar */}
                       <div className="mb-4">
                         <div className="relative">
                           <input
                             type="text"
                             value={resultsSearchQuery}
                             onChange={(e) => setResultsSearchQuery(e.target.value)}
                             placeholder="Search in your results..."
                             className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                             </svg>
                           </div>
                         </div>
                         {resultsSearchQuery && (
                           <p className="text-sm text-gray-600 mt-1">
                             Showing {filteredResults.length} of {parsedResults.length} results
                           </p>
                         )}
                       </div>
                       
                       {/* Tabs */}
                       <div className="flex flex-col space-y-1 mb-4">
                         {(filteredResults.length > 0 ? filteredResults : parsedResults).map((result, index) => (
                           <button
                             key={index}
                             onClick={() => setActiveTab(index)}
                             className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                               activeTab === index
                                 ? 'bg-blue-500 text-white'
                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                             }`}
                           >
                             {result.name || `Option ${index + 1}`}
                           </button>
                         ))}
                       </div>
                       
                       {/* Tab Content */}
                       {(filteredResults.length > 0 ? filteredResults : parsedResults).length > 0 && (filteredResults.length > 0 ? filteredResults : parsedResults)[activeTab] && (
                         <div className="space-y-3">
                           {(() => {
                             const currentResults = filteredResults.length > 0 ? filteredResults : parsedResults;
                             const currentResult = currentResults[activeTab];
                             return (
                               <>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div>
                                     <h4 className="font-semibold text-lg text-gray-900 mb-2">
                                       {currentResult.name}
                                     </h4>
                                     <p className="text-gray-600 text-sm mb-2">
                                       {currentResult.summary || currentResult.description || 'No description available'}
                                     </p>
                                   </div>
                                   {currentResult.image && (
                                     <div className="flex justify-center">
                                       <img
                                         src={currentResult.image}
                                         alt={currentResult.name}
                                         className="w-32 h-32 object-cover rounded-lg"
                                         onError={(e) => {
                                           e.currentTarget.style.display = 'none'
                                         }}
                                       />
                                     </div>
                                   )}
                                 </div>
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                   <div>
                                     <p><strong>Address:</strong> {currentResult.address || currentResult.location || currentResult.name || 'Not specified'}</p>
                                     <p><strong>Coordinates:</strong> {
                                       currentResult.coordinates 
                                         ? (typeof currentResult.coordinates === 'object' 
                                             ? `${currentResult.coordinates.lat || currentResult.coordinates.latitude}, ${currentResult.coordinates.lon || currentResult.coordinates.longitude}`
                                             : currentResult.coordinates)
                                         : currentResult.lat && currentResult.lon 
                                           ? `${currentResult.lat}, ${currentResult.lon}`
                                           : 'Not specified'
                                     }</p>
                                     <p><strong>Price Range:</strong> {currentResult.price_range || 'Not specified'}</p>
                                   </div>
                                   <div>
                                     <p><strong>Opening Hours:</strong> {currentResult.opening_hours || 'Not specified'}</p>
                                     {currentResult.link && (
                                       <p>
                                         <strong>Link:</strong>{' '}
                                         <a
                                           href={currentResult.link}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="text-blue-600 hover:text-blue-800 underline"
                                         >
                                           Visit Website
                                         </a>
                                       </p>
                                     )}
                                   </div>
                                 </div>
                                 
                                 {/* Add to Calendar Button */}
                                 <div className="mt-4">
                                   <button
                                     onClick={() => openCalendarPopup(currentResult)}
                                     className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                   >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                     </svg>
                                     Add to Regular Calendar
                                   </button>
                                 </div>
                               </>
                             );
                           })()}
                         </div>
                       )}
                       
                       {/* Show raw AI response if no structured results */}
                       {filteredResults.length === 0 && planResult && (
                         <div className="mt-4">
                           <h4 className="font-semibold text-lg text-gray-900 mb-2">Raw AI Response</h4>
                           <div className="bg-white border border-gray-200 rounded-lg p-4">
                             <p className="text-gray-700 whitespace-pre-wrap">{planResult}</p>
                           </div>
                           <div className="mt-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                             <p className="text-sm">
                               <strong>Note:</strong> The AI response couldn't be parsed into structured results. 
                               You can still see the raw response above, or try generating more options.
                             </p>
                           </div>
                         </div>
                       )}
                       
                       {/* Debug: Show parsed results count */}
                       {parsedResults.length > 0 && filteredResults.length === 0 && (
                         <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
                           <p className="text-sm">
                             <strong>Debug:</strong> Found {parsedResults.length} parsed results but 0 filtered results. 
                             This might indicate a filtering issue.
                           </p>
                         </div>
                       )}
                     </div>
                   ) : (
                     <div>
                       <p className="text-gray-700 mb-4">{planResult}</p>
                       {parsedResults.length === 0 && planResult && (
                         <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                           <p className="text-sm">
                             <strong>Note:</strong> The AI response couldn't be parsed into structured results. 
                             You can still see the raw response above, or try generating more options.
                           </p>
                         </div>
                       )}
                     </div>
                   )}

                 </div>
                {hasGeneratedPlan ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleMoreOptions}
                      disabled={isLoading}
                      className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                        isLoading
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating More Options...</span>
                        </div>
                      ) : 'More Options'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePlanThat}
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-md transition-colors ${
                      isLoading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating Plan...</span>
                      </div>
                    ) : 'Plan That!'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Map Card (Right) */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your City</h2>
              <form onSubmit={handleCitySubmit} className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Enter city"
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {citySuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleCitySelect(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                        >
                          {suggestion.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-md"
                >
                  Send
                </button>
              </form>
            </div>
            <p className="text-gray-600 mb-4">Here's a map of {cityInput || (selectedCity ?? user.city)}, {(selectedCityCountry || (selectedCountry ?? user.country))}.</p>

            {/* POI Controls */}
            <OverpassControlsWrapper />

                         {/* Map */}
                           <MapClient 
                             city={(selectedCity ?? user.city)} 
                             country={(selectedCityCountry || (selectedCountry ?? user.country))} 
                             amenity={amenity} 
                             radius={radius} 
                             currentlyOpen={currentlyOpen} 
                             parsedResults={parsedResults} 
                             userId={user?.id}
                             onAddEvent={openCalendarPopup}
                           />
          </div>
        </div>
      </div>

      {/* Calendar Event Popup */}
      {showCalendarPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900">Add Event to Regular Calendar</h3>
              <button
                onClick={closeCalendarPopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={calendarEventData.name}
                  onChange={(e) => setCalendarEventData({...calendarEventData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={calendarEventData.address}
                  onChange={(e) => setCalendarEventData({...calendarEventData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date & Time */}
              <Accordion title="Date & Time" defaultOpen={false}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={calendarEventData.date}
                      onChange={(e) => setCalendarEventData({...calendarEventData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <TimePicker
                    value={calendarEventData.startTime}
                    onChange={(time) => setCalendarEventData({...calendarEventData, startTime: time})}
                    label="Start Time"
                  />
                  <TimePicker
                    value={calendarEventData.endTime}
                    onChange={(time) => setCalendarEventData({...calendarEventData, endTime: time})}
                    label="End Time"
                  />
                </div>
              </Accordion>

              {/* Invited Users */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invited Users</label>
                <p className="text-xs text-gray-500 mb-2">Search and select multiple users to invite to your event</p>
                
                {/* Add User Search */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={popupUserSearchQuery}
                    onChange={(e) => setPopupUserSearchQuery(e.target.value)}
                    placeholder="Search for users to invite (you can add multiple users)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {showPopupUserSearchResults && popupUserSearchResults.length > 0 && (
                    <div className="absolute z-[10000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                      {popupUserSearchResults.map((result, index) => {
                        const resultUserId = result.friend_id || result.id
                        const isAlreadyInvited = calendarEventData.invitedUsers.some(u => {
                          const invitedUserId = u.friend_id || u.id
                          return invitedUserId === resultUserId
                        })
                        
                        // Debug logging for first few results
                        if (index < 3) {
                          console.log(`Search result ${index}:`, result)
                          console.log(`Result user ID:`, resultUserId)
                          console.log(`Is already invited:`, isAlreadyInvited)
                        }
                        return (
                          <button
                            key={index}
                            onClick={() => handlePopupUserSelect(result)}
                            disabled={isAlreadyInvited}
                            className={`w-full text-left px-3 py-2 focus:outline-none text-sm ${
                              isAlreadyInvited 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'hover:bg-gray-100 focus:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{result.username}</span>
                              {isAlreadyInvited && (
                                <span className="text-xs text-gray-400">Already invited</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Invited Users List */}
                <div className="space-y-2">
                  {calendarEventData.invitedUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{user.username}</span>
                      <button
                        onClick={() => setCalendarEventData({
                          ...calendarEventData,
                          invitedUsers: calendarEventData.invitedUsers.filter((_, i) => i !== index)
                        })}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {calendarEventData.invitedUsers.length === 0 && (
                    <p className="text-sm text-gray-500">No users invited</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeCalendarPopup}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addEventToCalendar}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 