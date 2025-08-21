'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useCallback } from 'react'
import { useRef } from 'react'

// Fix Leaflet's default icon paths under Next.js
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl.src ?? (markerIcon2xUrl as unknown as string),
  iconUrl: markerIconUrl.src ?? (markerIconUrl as unknown as string),
  shadowUrl: markerShadowUrl.src ?? (markerShadowUrl as unknown as string),
})

// Overpass API helper: retry with backoff and mirror fallback
async function fetchOverpassWithFallback(overpassQuery: string): Promise<{ elements?: Array<any> }> {
  const endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ]

  const maxRetriesPerEndpoint = 2
  const backoffMs = [0, 1500, 3000]

  for (const endpoint of endpoints) {
    for (let attempt = 0; attempt <= maxRetriesPerEndpoint; attempt++) {
      if (attempt < backoffMs.length && backoffMs[attempt] > 0) {
        await new Promise(res => setTimeout(res, backoffMs[attempt]))
      }

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 30000) // 30s client timeout
        console.log(overpassQuery)
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json',
            // User-Agent header is recommended by OSM; some browsers may strip it
          },
          body: new URLSearchParams({ data: overpassQuery }).toString(),
          signal: controller.signal,
        })

        clearTimeout(timeout)

        if (res.ok) {
          return await res.json() as { elements?: Array<any> }
        }

        // Retry on typical transient errors
        if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504 || res.status >= 500) {
          continue
        }

        // For other HTTP errors, stop and throw immediately
        const text = await res.text().catch(() => '')
        throw new Error(`Overpass error ${res.status}: ${text}`)
      } catch (err: any) {
        // Retry on abort/network errors
        if (err?.name === 'AbortError') {
          continue
        }
        // For network errors, try next attempt or endpoint
        if (attempt === maxRetriesPerEndpoint) {
          // proceed to next endpoint
        }
      }
    }
  }

  throw new Error('All Overpass API endpoints timed out or failed. Please try again later.')
}

interface CityMapProps {
  city: string
  country: string
  zoom?: number
  className?: string
  amenity?: 'restaurant' | 'bar' | 'nightlife' | 'nature' | 'arts' | 'entertainment' | 'sports' | 'shopping' | 'live_music' | 'cafes' | 'fast_desserts' | 'results' | 'bookmarks' | null
  radius?: number // meters
  currentlyOpen?: boolean // filter for currently open places
  parsedResults?: any[] // AI-generated results with coordinates
  userId?: number // for bookmark functionality
  onAddEvent?: (eventData: any) => void // callback for adding events
}

interface Poi {
  id: number
  name: string | undefined
  lat: number
  lon: number
  tags?: any
  typeLabel?: string
}

function getFeatureLabel(tags: any): string | undefined {
  if (!tags) return undefined
  if (tags.name && tags.name.trim()) return tags.name
  // Trails
  if (tags.route === 'hiking') return tags.ref ? `Hiking route ${tags.ref}` : 'Hiking route'
  // Nature types
  if (tags.natural === 'beach') return 'Beach'
  if (tags.leisure === 'park') return 'Park'
  if (tags.landuse === 'forest') return 'Forest'
  if (tags.natural === 'water' && tags.water === 'lake') return 'Lake'
  if (tags.waterway === 'river') return 'River'
  if (tags.waterway === 'waterfall') return 'Waterfall'
  if (tags.natural === 'peak') return 'Peak'
  if (tags.tourism === 'viewpoint') return 'Viewpoint'
  if (tags.leisure === 'nature_reserve') return 'Nature reserve'
  if (tags.natural === 'cave_entrance') return 'Cave entrance'
  if (tags.natural === 'hot_spring') return 'Hot spring'
  if (tags.sport === 'climbing') return 'Climbing site'
  if (tags.tourism === 'camp_site') return 'Camp site'
  if (tags.tourism === 'picnic_site') return 'Picnic site'
  if (tags.tourism === 'wildlife_hide') return 'Wildlife hide'
  // Arts variants
  if (tags.amenity === 'arts_centre') return 'Arts centre'
  if (tags.amenity === 'theatre') return 'Theatre'
  if (tags.amenity === 'community_centre') return 'Community centre'
  if (tags.amenity === 'music_school') return 'Music school'
  if (tags.tourism === 'gallery') return 'Gallery'
  if (tags.tourism === 'museum') return 'Museum'
  if (tags.leisure === 'art_gallery') return 'Art gallery'
  if (tags.building === 'theatre') return 'Theatre'
  if (tags.building === 'museum') return 'Museum'
  if (tags.craft) return `Craft: ${tags.craft}`
  if (tags.amenity === 'dance_school') return 'Dance school'
  if (tags.leisure === 'outdoor_dance') return 'Outdoor dance'
  // Nightlife variants
  if (tags.amenity === 'nightclub') return 'Nightclub'
  if (tags.amenity === 'casino') return 'Casino'
  if (tags.amenity === 'music_venue') return 'Music venue'
  if (tags.amenity === 'bar') return 'Bar'
  // Fallback to any recognizable tag
  if (tags.amenity) return tags.amenity
  if (tags.natural) return tags.natural
  if (tags.leisure) return tags.leisure
  if (tags.tourism) return tags.tourism
  if (tags.waterway) return tags.waterway
  if (tags.landuse) return tags.landuse
  return undefined
}

function getSuburb(tags: any): string | undefined {
  if (!tags) return undefined
  return tags['addr:suburb'] || tags['addr:neighbourhood'] || tags['addr:city'] || undefined
}

function getShortDescription(tags: any): string | undefined {
  if (!tags) return undefined
  return tags['short_description'] || tags['description'] || undefined
}

function getWebsite(tags: any): string | undefined {
  if (!tags) return undefined
  const raw = tags['website'] || tags['contact:website'] || tags['url']
  if (!raw || typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  // Normalize to absolute URL
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

// Helper function to check if a place is currently open based on opening hours
function isCurrentlyOpen(openingHours: string): boolean {
  if (!openingHours) return false
  
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes() // Convert to minutes since midnight
  
  // Handle special cases
  if (openingHours.toLowerCase() === '24/7' || openingHours.toLowerCase() === '24h') {
    return true
  }
  
  // Parse opening hours string (e.g., "Mo-Fr 09:00-17:00; Sa 10:00-15:00")
  const rules = openingHours.split(';')
  
  for (const rule of rules) {
    const trimmedRule = rule.trim()
    if (!trimmedRule) continue
    
    // Parse day range and time range with more flexible patterns
    const match = trimmedRule.match(/^([A-Za-z]{2}(?:-[A-Za-z]{2})?)\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/)
    if (!match) continue
    
    const dayRange = match[1]
    const openHour = parseInt(match[2])
    const openMinute = parseInt(match[3])
    const closeHour = parseInt(match[4])
    const closeMinute = parseInt(match[5])
    
    // Convert day abbreviations to numbers
    const dayMap: { [key: string]: number } = {
      'Mo': 1, 'Tu': 2, 'We': 3, 'Th': 4, 'Fr': 5, 'Sa': 6, 'Su': 0
    }
    
    let isDayMatch = false
    if (dayRange.includes('-')) {
      // Handle day ranges like "Mo-Fr"
      const [startDay, endDay] = dayRange.split('-')
      const startDayNum = dayMap[startDay]
      const endDayNum = dayMap[endDay]
      
      if (startDayNum <= endDayNum) {
        // Normal range (e.g., Mo-Fr)
        isDayMatch = currentDay >= startDayNum && currentDay <= endDayNum
      } else {
        // Wrapping range (e.g., Fr-Mo)
        isDayMatch = currentDay >= startDayNum || currentDay <= endDayNum
      }
    } else {
      // Single day
      isDayMatch = currentDay === dayMap[dayRange]
    }
    
    if (isDayMatch) {
      const openTime = openHour * 60 + openMinute
      const closeTime = closeHour * 60 + closeMinute
      
      // Handle overnight hours (e.g., 22:00-02:00)
      if (closeTime < openTime) {
        // If current time is after open time OR before close time (next day)
        return currentTime >= openTime || currentTime <= closeTime
      } else {
        // Normal hours
        return currentTime >= openTime && currentTime <= closeTime
      }
    }
  }
  
  return false
}

// Helper function to add opening hours filter to Overpass queries
function addOpeningHoursFilter(query: string, currentlyOpen: boolean): string {
  if (!currentlyOpen) return query
  
  // For client-side filtering, we don't modify the query
  // Instead, we'll filter the results after fetching
  return query
}

function getTypeLabelFromTags(tags: any, selected: CityMapProps['amenity']): string | undefined {
  if (!tags) return selected ?? undefined
  // Shopping types
  if (tags.building === 'mall') return 'mall'
  if (tags.amenity === 'marketplace') return 'marketplace'
  if (tags.shop === 'market') return 'market'
  if (tags.landuse === 'retail') return 'retail'
  // Live music types
  if (tags['theatre:type'] === 'music') return 'music theatre'
  if (tags.amenity === 'music_venue') return 'music venue'
  if (tags.amenity === 'concert_hall') return 'concert hall'
  if (tags.event === 'music_festival') return 'music festival'
  if (tags.shop === 'music') return 'music shop'
  // Sports types
  if (tags.leisure === 'sports_centre') return 'sports centre'
  if (tags.leisure === 'stadium') return 'stadium'
  if (tags.leisure === 'pitch') return tags.sport ? `${tags.sport} pitch` : 'sports pitch'
  if (tags.amenity === 'ice_rink') return 'ice rink'
  if (tags.amenity === 'bowling_alley') return 'bowling alley'
  if (tags.leisure === 'sports_hall') return 'sports hall'
  if (tags.leisure === 'swimming_pool') return 'swimming pool'
  if (tags.leisure === 'golf_course') return 'golf course'
  // Arts types
  if (tags.amenity === 'arts_centre') return 'arts centre'
  if (tags.amenity === 'theatre') return 'theatre'
  if (tags.tourism === 'gallery') return 'gallery'
  if (tags.tourism === 'museum') return 'museum'
  if (tags.leisure === 'art_gallery') return 'art gallery'
  if (tags.building === 'pavilion') return 'pavilion'
  // Nightlife
  if (tags.amenity === 'nightclub') return 'nightclub'
  if (tags.amenity === 'casino') return 'casino'
  if (tags.amenity === 'bar') return 'bar'
  // Nature
  if (tags.leisure === 'park') return 'park'
  if (tags.landuse === 'forest') return 'forest'
  if (tags['route'] === 'hiking') return 'hiking route'
  if (tags.natural === 'beach') return 'beach'
  if (tags.tourism === 'viewpoint') return 'viewpoint'
  if (tags.leisure === 'nature_reserve') return 'nature reserve'
  // Default to selected amenity key if nothing else
  return selected ?? undefined
}

function RecenterOnChange({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center[0], center[1], zoom, map])
  return null
}

function CaptureMapInstance({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap()
  useEffect(() => { onReady(map) }, [map, onReady])
  return null
}

export default function CityMap({ city, country, zoom = 15, className, amenity = null as CityMapProps['amenity'], radius = 1000, currentlyOpen = false, parsedResults = [], userId, onAddEvent }: CityMapProps) {
  const [center, setCenter] = useState<[number, number] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pois, setPois] = useState<Poi[]>([])
  const [visibleCount, setVisibleCount] = useState<number>(10)
  const [selectedPoiId, setSelectedPoiId] = useState<number | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const poisRef = useRef<Poi[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [bookmarkLoading, setBookmarkLoading] = useState<boolean>(false)
  const [bookmarkedPois, setBookmarkedPois] = useState<Set<string>>(new Set())
  const [bookmarkIds, setBookmarkIds] = useState<Map<string, number>>(new Map()) // Map of "lat,lon" to bookmark ID
  const [poiSearchQuery, setPoiSearchQuery] = useState<string>('')
  const [filteredPois, setFilteredPois] = useState<Poi[]>([])
  useEffect(() => { poisRef.current = pois }, [pois])

  // Filter POIs based on search query
  useEffect(() => {
    if (poiSearchQuery.trim() === '') {
      setFilteredPois(pois)
    } else {
      const filtered = pois.filter(poi => {
        const searchTerm = poiSearchQuery.toLowerCase()
        const name = (poi.name || '').toLowerCase()
        const typeLabel = (poi.typeLabel || '').toLowerCase()
        const tags = poi.tags || {}
        const description = (tags.description || tags['short_description'] || '').toLowerCase()
        const suburb = (tags['addr:suburb'] || tags['addr:neighbourhood'] || '').toLowerCase()
        const address = (tags['addr:street'] || tags['addr:housenumber'] || '').toLowerCase()
        
        return name.includes(searchTerm) || 
               typeLabel.includes(searchTerm) || 
               description.includes(searchTerm) || 
               suburb.includes(searchTerm) || 
               address.includes(searchTerm)
      })
      setFilteredPois(filtered)
    }
  }, [poiSearchQuery, pois])

  // Reset visible count when search query changes
  useEffect(() => {
    setVisibleCount(10)
  }, [poiSearchQuery])
  const handleMapReady = useCallback((m: L.Map) => { mapRef.current = m }, [])

  // Bookmark functions
  const fetchBookmarks = useCallback(async () => {
    if (!userId) return
    
    setBookmarkLoading(true)
    try {
      const response = await fetch(`http://localhost:5001/bookmarks/get?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setBookmarkLoading(false)
    }
  }, [userId])

  const checkBookmarkExists = useCallback(async (latitude: number, longitude: number): Promise<boolean> => {
    if (!userId) return false
    
    try {
      const response = await fetch('http://localhost:5001/bookmarks/check_exists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, latitude, longitude }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.exists
      }
    } catch (error) {
      console.error('Error checking bookmark exists:', error)
    }
    return false
  }, [userId])

  const addBookmark = useCallback(async (poi: Poi) => {
    if (!userId) return
    
    try {
      const response = await fetch('http://localhost:5001/bookmarks/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          latitude: poi.lat,
          longitude: poi.lon,
          name: poi.name || 'Unknown',
          description: poi.tags?.description || poi.tags?.['short_description'] || '',
          image: poi.tags?.image || '',
          suburb: poi.tags?.['addr:suburb'] || poi.tags?.['addr:neighbourhood'] || '',
          hours: poi.tags?.opening_hours || '',
          website: poi.tags?.website || poi.tags?.['contact:website'] || poi.tags?.url || ''
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const bookmarkId = data.id // Get the new bookmark ID
        
        // Immediately update the UI state
        setBookmarkedPois(prev => new Set(Array.from(prev).concat(`${poi.lat},${poi.lon}`)))
        if (bookmarkId) {
          setBookmarkIds(prev => new Map(prev).set(`${poi.lat},${poi.lon}`, bookmarkId))
        }
        
        // Refresh bookmarks in background to ensure consistency
        fetchBookmarks()
        // Update bookmarked POIs for results section
        if (amenity === 'results') {
          updateBookmarkedPois()
        }
      }
    } catch (error) {
      console.error('Error adding bookmark:', error)
    }
  }, [userId, fetchBookmarks, amenity])

  const removeBookmark = useCallback(async (bookmarkId: number) => {
    console.log(`Removing bookmark with ID: ${bookmarkId}`)
    console.log('Current bookmarkIds:', Array.from(bookmarkIds.entries()))
    
    try {
      const response = await fetch('http://localhost:5001/bookmarks/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookmark_id: bookmarkId }),
      })

      if (response.ok) {
        // Find the coordinates for this bookmark ID in our bookmarkIds map
        let coordinatesKey: string | null = null
        bookmarkIds.forEach((id, key) => {
          if (id === bookmarkId) {
            coordinatesKey = key
          }
        })
        
        console.log(`Found coordinates key: ${coordinatesKey}`)
        
        if (coordinatesKey) {
          // Immediately update the UI state
          setBookmarkedPois(prev => {
            const newSet = new Set(Array.from(prev))
            newSet.delete(coordinatesKey!)
            console.log(`Updated bookmarkedPois: ${Array.from(newSet)}`)
            return newSet
          })
          setBookmarkIds(prev => {
            const newMap = new Map(prev)
            newMap.delete(coordinatesKey!)
            console.log(`Updated bookmarkIds: ${Array.from(newMap.entries())}`)
            return newMap
          })
          console.log(`Immediately removed bookmark from UI: ${coordinatesKey}`)
        } else {
          console.warn(`Could not find coordinates key for bookmark ID: ${bookmarkId}`)
        }
        
        // Refresh bookmarks in background to ensure consistency
        fetchBookmarks()
        // Update bookmarked POIs for results section
        if (amenity === 'results') {
          updateBookmarkedPois()
        }
      } else {
        console.error('Failed to remove bookmark from server:', response.status)
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }, [fetchBookmarks, bookmarkIds, amenity])

  // Function to check which POIs are bookmarked and store their IDs
  const updateBookmarkedPois = useCallback(async () => {
    if (!userId || !pois.length) return
    
    console.log(`updateBookmarkedPois called for ${pois.length} POIs`)
    
    const bookmarkedSet = new Set<string>()
    const bookmarkIdsMap = new Map<string, number>()
    
    // First, get all bookmarks for the user
    try {
      const response = await fetch(`http://localhost:5001/bookmarks/get?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const allBookmarks = await response.json()
        console.log(`Found ${allBookmarks.length} total bookmarks for user`)
        
        // Check which POIs are bookmarked and store their IDs
        for (const poi of pois) {
          const bookmark = allBookmarks.find((b: any) => {
            // Use more robust coordinate matching with tolerance for floating point precision
            const latMatch = Math.abs(b.latitude - poi.lat) < 0.00001
            const lonMatch = Math.abs(b.longitude - poi.lon) < 0.00001
            return latMatch && lonMatch
          })
          if (bookmark) {
            const key = `${poi.lat},${poi.lon}`
            bookmarkedSet.add(key)
            bookmarkIdsMap.set(key, bookmark.id)
            console.log(`POI ${poi.name} (${key}) is bookmarked with ID ${bookmark.id}`)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching bookmarks for POI check:', error)
    }
    
    console.log(`Setting ${bookmarkedSet.size} bookmarked POIs`)
    setBookmarkedPois(bookmarkedSet)
    setBookmarkIds(bookmarkIdsMap)
  }, [userId, pois])

  // Check if a POI is bookmarked
  const isPoiBookmarked = useCallback((poi: Poi) => {
    const key = `${poi.lat},${poi.lon}`
    const isBookmarked = bookmarkedPois.has(key)
    console.log(`Checking if POI ${poi.name} (${key}) is bookmarked:`, isBookmarked)
    console.log('Current bookmarkedPois size:', bookmarkedPois.size)
    console.log('Current bookmarkedPois:', Array.from(bookmarkedPois))
    return isBookmarked
  }, [bookmarkedPois])

  const query = useMemo(() => `${city}, ${country}`.trim(), [city, country])

  // Define icons with useMemo to ensure consistent hook order
  const redIcon = useMemo(() => L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;background:#ef4444;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(239,68,68,0.6);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }), [])

  const blueIcon = useMemo(() => L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;background:#2563eb;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(37,99,235,0.4);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }), [])

  const greenIcon = useMemo(() => L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;background:#10b981;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(16,185,129,0.4);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }), [])

  const purpleIcon = useMemo(() => L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;background:#8b5cf6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 2px rgba(139,92,246,0.4);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }), [])

  const handleSelectPoi = useCallback((p: Poi) => {
    setSelectedPoiId(p.id)
    // Pan immediately to the POI without waiting for state
    try {
      const m = mapRef.current
      if (m) {
        m.setView([p.lat, p.lon], m.getZoom(), { animate: true })
      }
    } catch {}
    // Ensure selected item is visible in the results list
    const list = poisRef.current
    const idx = list.findIndex(item => item.id === p.id)
    if (idx >= 0) {
      setVisibleCount(c => Math.max(c, idx + 1))
    }
  }, [])

  const selectedRef = useCallback((el: HTMLButtonElement | null) => {
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(10)
  }, [amenity, center?.[0], center?.[1], radius])

  // Clear selection only when category changes
  useEffect(() => {
    setSelectedPoiId(null)
  }, [amenity])

  // Fetch bookmarks when amenity is 'bookmarks'
  useEffect(() => {
    if (amenity === 'bookmarks' && userId) {
      fetchBookmarks()
    }
  }, [amenity, userId, fetchBookmarks])

  // Initialize bookmark state when component mounts
  useEffect(() => {
    if (userId && pois.length > 0 && amenity !== 'bookmarks') {
      console.log('Initializing bookmark state on component mount')
      updateBookmarkedPois()
    }
  }, [userId, pois.length, amenity, updateBookmarkedPois])

  // Update POIs when bookmarks change (for bookmarks tab)
  useEffect(() => {
    if (amenity === 'bookmarks' && userId) {
      const bookmarkPois: Poi[] = bookmarks.map((bookmark: any) => ({
        id: bookmark.id,
        name: bookmark.name,
        lat: bookmark.latitude,
        lon: bookmark.longitude,
        tags: {
          description: bookmark.description,
          image: bookmark.image,
          suburb: bookmark.suburb,
          opening_hours: bookmark.hours,
          website: bookmark.website
        },
        typeLabel: 'Bookmark'
      }))
      setPois(bookmarkPois)
    }
  }, [bookmarks, amenity, userId])

  // Update bookmarked POIs when POIs change (for non-bookmarks tabs)
  useEffect(() => {
    if (amenity !== 'bookmarks' && userId && pois.length > 0) {
      console.log(`Updating bookmarked POIs for amenity: ${amenity}, pois count: ${pois.length}`)
      updateBookmarkedPois()
    }
  }, [pois, amenity, userId, updateBookmarkedPois])

  // Update bookmarked POIs when amenity changes (for all non-bookmarks tabs)
  useEffect(() => {
    if (amenity !== 'bookmarks' && amenity !== null && userId && pois.length > 0) {
      console.log(`Amenity changed to: ${amenity}, updating bookmarked POIs`)
      updateBookmarkedPois()
    }
  }, [amenity, userId, pois.length, updateBookmarkedPois])

  // Geocode city + country to center
  useEffect(() => {
    let isCancelled = false

    async function geocode() {
      try {
        setError(null)
        const url = new URL('https://nominatim.openstreetmap.org/search')
        url.searchParams.set('q', query)
        url.searchParams.set('format', 'json')
        url.searchParams.set('limit', '1')

        const res = await fetch(url.toString(), {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en',
          }
        })
        const data: Array<{ lat: string; lon: string }> = await res.json()
        if (!isCancelled) {
          if (Array.isArray(data) && data.length > 0) {
            const lat = parseFloat(data[0].lat)
            const lon = parseFloat(data[0].lon)
            setCenter([lat, lon])
          } else {
            setError('Location not found')
          }
        }
      } catch (e) {
        if (!isCancelled) setError('Failed to load map location')
      }
    }

    if (city && country) geocode()

    return () => {
      isCancelled = true
    }
  }, [query, city, country])

  // Query Overpass for POIs when center + amenity provided
  useEffect(() => {
    let isCancelled = false

    async function fetchPois() {
      if (!center || !amenity || !radius) {
        setPois([])
        setIsLoading(false)
        return
      }

      // Handle results amenity type (AI-generated results)
      if (amenity === 'results') {
        console.log('Processing AI results for map:', parsedResults.length, 'results')
        
        const resultsPois: Poi[] = parsedResults
          .filter((result: any) => {
            // Check if result has coordinates in any format
            const hasCoordinates = (
              (result.lat && result.lon) || 
              (result.coordinates && typeof result.coordinates === 'object') ||
              (result.coordinates && typeof result.coordinates === 'string')
            )
            const hasName = result.name
            
            if (!hasName) {
              console.warn('Result missing name:', result)
              return false
            }
            
            if (!hasCoordinates) {
              console.warn('Result missing coordinates:', result)
              return false
            }
            
            return true
          })
          .map((result: any, index: number) => {
            try {
              let lat: number, lon: number
              
              // Extract coordinates from different possible formats
              if (result.lat && result.lon) {
                // Direct lat/lon properties
                lat = parseFloat(result.lat)
                lon = parseFloat(result.lon)
              } else if (result.coordinates) {
                if (typeof result.coordinates === 'object') {
                  // Coordinates object: {lat: x, lon: y} or {latitude: x, longitude: y}
                  lat = parseFloat(result.coordinates.lat || result.coordinates.latitude)
                  lon = parseFloat(result.coordinates.lon || result.coordinates.longitude)
                } else if (typeof result.coordinates === 'string') {
                  // Coordinates string: "lat,lon"
                  const coords = result.coordinates.split(',').map((c: string) => parseFloat(c.trim()))
                  lat = coords[0]
                  lon = coords[1]
                } else {
                  console.warn('Unknown coordinates format:', result.coordinates)
                  return null
                }
              } else {
                console.warn('No coordinates found for result:', result)
                return null
              }

              // Validate coordinates
              if (isNaN(lat) || isNaN(lon)) {
                console.warn('Invalid coordinate values:', { lat, lon, result })
                return null
              }
              
              // Check if coordinates are within reasonable bounds
              if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                console.warn('Coordinates out of bounds:', { lat, lon })
                return null
              }

              console.log(`Adding result to map: ${result.name} at ${lat}, ${lon}`)

              return {
                id: index + 10000, // Use high ID to avoid conflicts with Overpass results
                name: result.name,
                lat,
                lon,
                tags: {
                  description: result.description,
                  address: result.address || result.location,
                  price_range: result.price_range,
                  opening_hours: result.opening_hours,
                  website: result.link || result.website
                },
                typeLabel: result.address || result.location || result.name
              }
            } catch (error) {
              console.error('Error processing AI result:', result.name, error)
              return null
            }
          })
          .filter(Boolean) as Poi[]

        console.log('Final POIs for map:', resultsPois.length, 'places')

        if (!isCancelled) {
          setPois(resultsPois)
          setIsLoading(false)
          // Update bookmarked POIs for results
          if (userId && resultsPois.length > 0) {
            updateBookmarkedPois()
          }
        }
        return
      }

      // Handle bookmarks amenity type
      if (amenity === 'bookmarks') {
        if (!userId) {
          setPois([])
          setIsLoading(false)
          return
        }
        
        // Fetch bookmarks and convert to POIs
        await fetchBookmarks()
        const bookmarkPois: Poi[] = bookmarks.map((bookmark: any, index: number) => ({
          id: bookmark.id,
          name: bookmark.name,
          lat: bookmark.latitude,
          lon: bookmark.longitude,
          tags: {
            description: bookmark.description,
            image: bookmark.image,
            suburb: bookmark.suburb,
            opening_hours: bookmark.hours,
            website: bookmark.website
          },
          typeLabel: 'Bookmark'
        }))

        if (!isCancelled) {
          setPois(bookmarkPois)
          setIsLoading(false)
        }
        return
      }
      try {
        setIsLoading(true)
        setError(null)
        const [lat, lon] = center
        let overpassQuery = ''
        if (amenity === 'nightlife') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              node["amenity"="nightclub"](around:${radius},${lat},${lon});
              node["amenity"="casino"](around:${radius},${lat},${lon});
              node["amenity"="music_venue"](around:${radius},${lat},${lon});
              node["amenity"="bar"](around:${radius},${lat},${lon});
              way["amenity"="nightclub"](around:${radius},${lat},${lon});
              way["amenity"="casino"](around:${radius},${lat},${lon});
              way["amenity"="music_venue"](around:${radius},${lat},${lon});
              way["amenity"="bar"](around:${radius},${lat},${lon});
              relation["amenity"="nightclub"](around:${radius},${lat},${lon});
              relation["amenity"="casino"](around:${radius},${lat},${lon});
              relation["amenity"="music_venue"](around:${radius},${lat},${lon});
              relation["amenity"="bar"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else if (amenity === 'nature') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              relation["route"="hiking"](around:${radius},${lat},${lon});

              nwr["natural"="beach"](around:${radius},${lat},${lon});
              nwr["leisure"="park"](around:${radius},${lat},${lon});
              way["landuse"="forest"](around:${radius},${lat},${lon});
              nwr["natural"="water"]["water"="lake"](around:${radius},${lat},${lon});
              nwr["waterway"="river"](around:${radius},${lat},${lon});
              nwr["waterway"="waterfall"](around:${radius},${lat},${lon});
              nwr["natural"="peak"](around:${radius},${lat},${lon});
              nwr["tourism"="viewpoint"](around:${radius},${lat},${lon});
              nwr["leisure"="nature_reserve"](around:${radius},${lat},${lon});
              nwr["natural"="cave_entrance"](around:${radius},${lat},${lon});
              nwr["natural"="hot_spring"](around:${radius},${lat},${lon});
              nwr["sport"="climbing"](around:${radius},${lat},${lon});
              nwr["tourism"="camp_site"](around:${radius},${lat},${lon});
              nwr["tourism"="picnic_site"](around:${radius},${lat},${lon});
              nwr["tourism"="wildlife_hide"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else if (amenity === 'arts') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              nwr["amenity"="arts_centre"](around:${radius},${lat},${lon});
              nwr["amenity"="theatre"](around:${radius},${lat},${lon});
              nwr["amenity"="community_centre"](around:${radius},${lat},${lon});
              nwr["amenity"="music_school"](around:${radius},${lat},${lon});
              nwr["tourism"="gallery"](around:${radius},${lat},${lon});
              nwr["tourism"="museum"](around:${radius},${lat},${lon});
              nwr["tourism"="artwork"]["artwork_type"!="statue"](around:${radius},${lat},${lon});
              nwr["leisure"="art_gallery"](around:${radius},${lat},${lon});
              nwr["building"="theatre"](around:${radius},${lat},${lon});
              nwr["building"="museum"](around:${radius},${lat},${lon});
              nwr["building"="arts_centre"](around:${radius},${lat},${lon});
              nwr["craft"](around:${radius},${lat},${lon});
              nwr["amenity"="dance_school"](around:${radius},${lat},${lon});
              nwr["leisure"="outdoor_dance"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else if (amenity === 'entertainment') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              nwr["amenity"="theatre"](around:${radius},${lat},${lon});
              nwr["amenity"="cinema"](around:${radius},${lat},${lon});
              nwr["amenity"="arts_centre"](around:${radius},${lat},${lon});
              nwr["leisure"="sports_centre"](around:${radius},${lat},${lon});
              nwr["tourism"="theme_park"](around:${radius},${lat},${lon});
              nwr["leisure"="amusement_arcade"](around:${radius},${lat},${lon});
              nwr["leisure"="miniature_golf"](around:${radius},${lat},${lon});
              nwr["amenity"="planetarium"](around:${radius},${lat},${lon});
              nwr["amenity"="aquarium"](around:${radius},${lat},${lon});
              nwr["amenity"="exhibition_centre"](around:${radius},${lat},${lon});
              nwr["amenity"="events_venue"](around:${radius},${lat},${lon});
            );
            out center;
          `
                } else if (amenity === 'sports') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              nwr["leisure"="sports_centre"](around:${radius},${lat},${lon});
              nwr["leisure"="stadium"](around:${radius},${lat},${lon});
              nwr["leisure"="pitch"]["sport"](around:${radius},${lat},${lon});
              nwr["amenity"="ice_rink"](around:${radius},${lat},${lon});
              nwr["amenity"="bowling_alley"](around:${radius},${lat},${lon});
              nwr["leisure"="sports_hall"](around:${radius},${lat},${lon});
              nwr["leisure"="swimming_pool"]["name"]["access"!~"^(private|residents|customers)$"]["private"!="yes"](around:${radius},${lat},${lon});
              nwr["leisure"="golf_course"]["sport"="golf"](around:${radius},${lat},${lon});
              nwr["leisure"="miniature_golf"](around:${radius},${lat},${lon});
              nwr["leisure"="sports_centre"]["sport"="climbing"](around:${radius},${lat},${lon});
              nwr["sport"="skating"](around:${radius},${lat},${lon});
              nwr["amenity"="bar"]["bar:sport"="yes"](around:${radius},${lat},${lon});
              nwr["amenity"="bar"]["bar:sports"="yes"](around:${radius},${lat},${lon});
              nwr["amenity"="pub"]["bar:sport"="yes"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else if (amenity === 'shopping') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              nwr["building"="mall"](around:${radius},${lat},${lon});
              nwr["amenity"="marketplace"](around:${radius},${lat},${lon});
              nwr["shop"="market"](around:${radius},${lat},${lon});
              nwr["landuse"="retail"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else if (amenity === 'live_music') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              nwr["amenity"="theatre"]["theatre:type"="music"](around:${radius},${lat},${lon});
              nwr["amenity"="theatre"](around:${radius},${lat},${lon});
              nwr["event"="music_festival"](around:${radius},${lat},${lon});
              nwr["shop"="music"](around:${radius},${lat},${lon});
              nwr["amenity"="music_venue"](around:${radius},${lat},${lon});
              nwr["amenity"="concert_hall"](around:${radius},${lat},${lon});
              nwr["building"="pavilion"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else if (amenity === 'cafes') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              nwr["cuisine"="pastries"](around:${radius},${lat},${lon});
              nwr["cuisine"="tea"](around:${radius},${lat},${lon});
              nwr["amenity"="cafe"](around:${radius},${lat},${lon});
              nwr["shop"="coffee"](around:${radius},${lat},${lon});
              nwr["cuisine"="coffee_shop"](around:${radius},${lat},${lon});
              nwr["shop"="bakery"](around:${radius},${lat},${lon});
              nwr["shop"="pastry"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else if (amenity === 'fast_desserts') {
          overpassQuery = `[
            out:json][timeout:25];
            (
              nwr["amenity"="fast_food"](around:${radius},${lat},${lon});
              nwr["cuisine"="ice_cream"](around:${radius},${lat},${lon});
              nwr["cuisine"="burger"](around:${radius},${lat},${lon});
              nwr["cuisine"="pizza"](around:${radius},${lat},${lon});
              nwr["cuisine"="sushi"](around:${radius},${lat},${lon});
              nwr["shop"="confectionery"](around:${radius},${lat},${lon});
              nwr["cuisine"="dessert"](around:${radius},${lat},${lon});
              nwr["shop"="chocolate"](around:${radius},${lat},${lon});
              nwr["shop"="pastry"](around:${radius},${lat},${lon});
              nwr["cuisine"="donuts"](around:${radius},${lat},${lon});
            );
            out center;
          `
        } else {
          overpassQuery = `[
            out:json][timeout:25];
            (
              node["amenity"="${amenity}"](around:${radius},${lat},${lon});
              way["amenity"="${amenity}"](around:${radius},${lat},${lon});
              relation["amenity"="${amenity}"](around:${radius},${lat},${lon});
            );
            out center;
          `
        }
        
        // Apply opening hours filter if requested
        overpassQuery = addOpeningHoursFilter(overpassQuery, currentlyOpen)
        
        const json = await fetchOverpassWithFallback(overpassQuery)
        if (!isCancelled) {
          const items: Poi[] = (json.elements ?? [])
            .map((el: any) => {
              const label = getFeatureLabel(el.tags)
              const typeLabel = getTypeLabelFromTags(el.tags, amenity)
              if (el.type === 'node' && typeof el.lat === 'number' && typeof el.lon === 'number') {
                return { id: el.id, name: label, lat: el.lat, lon: el.lon, tags: el.tags, typeLabel }
              }
              if ((el.type === 'way' || el.type === 'relation') && el.center) {
                return { id: el.id, name: label, lat: el.center.lat, lon: el.center.lon, tags: el.tags, typeLabel }
              }
              return null
            })
            .filter(Boolean) as Poi[]
          // Custom sort for restaurants: name+website+hours, then name+website, then name, then others
          if (amenity === 'restaurant') {
            items.sort((a, b) => {
              const aWebsite = !!getWebsite(a.tags)
              const bWebsite = !!getWebsite(b.tags)
              const aHours = !!(a.tags && a.tags.opening_hours)
              const bHours = !!(b.tags && b.tags.opening_hours)
              const aTier = (a.name ? 2 : 0) + (aWebsite ? 1 : 0) + (aHours ? 1 : 0)
              const bTier = (b.name ? 2 : 0) + (bWebsite ? 1 : 0) + (bHours ? 1 : 0)
              if (aTier !== bTier) return bTier - aTier
              const an = (a.name || a.typeLabel || '').toLowerCase()
              const bn = (b.name || b.typeLabel || '').toLowerCase()
              return an.localeCompare(bn)
            })
          } else {
            // Default: named first, then by name/type
            items.sort((a, b) => {
              const aNamed = a.name ? 1 : 0
              const bNamed = b.name ? 1 : 0
              if (aNamed !== bNamed) return bNamed - aNamed
              const an = (a.name || a.typeLabel || '').toLowerCase()
              const bn = (b.name || b.typeLabel || '').toLowerCase()
              return an.localeCompare(bn)
            })
          }
          
          // Apply client-side opening hours filtering if requested
          let filteredItems = items
          if (currentlyOpen && amenity) {
            // Only apply filtering to non-results amenity types
            const filterableAmenities = ['restaurant', 'bar', 'nightlife', 'nature', 'arts', 'entertainment', 'sports', 'shopping', 'live_music', 'cafes', 'fast_desserts']
            if (filterableAmenities.includes(amenity)) {
              filteredItems = items.filter(item => {
                const openingHours = item.tags?.opening_hours
                return isCurrentlyOpen(openingHours)
              })
            }
          }
          
          setPois(filteredItems)
          setIsLoading(false)
        }
      } catch (e) {
        if (!isCancelled) setError('Map data timed out. Try reducing the radius or changing the filter.')
        setIsLoading(false)
      }
    }

    fetchPois()

    return () => { isCancelled = true }
  }, [center, amenity, radius, currentlyOpen, parsedResults])

  if (typeof window === 'undefined') return null

  if (error) {
    return (
      <div className={`w-full h-96 rounded-lg border border-gray-200 flex items-center justify-center ${className ?? ''}`}>
        <span className="text-sm text-gray-600">{error}</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="w-full h-96 overflow-hidden rounded-lg border border-gray-200">
        {center ? (
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            attributionControl={true}
            whenReady={() => { /* set later via effect */ }}
          >
            <CaptureMapInstance onReady={handleMapReady} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterOnChange center={center} zoom={zoom} />
            {pois.map(p => (
              <Marker
                key={`${p.id}-${selectedPoiId === p.id ? 'sel' : 'norm'}`}
                position={[p.lat, p.lon] as [number, number]}
                icon={selectedPoiId === p.id ? redIcon : (amenity === 'results' ? greenIcon : amenity === 'bookmarks' ? purpleIcon : blueIcon)}
                eventHandlers={{ click: () => handleSelectPoi(p) }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">{p.name ?? `${amenity?.charAt(0).toUpperCase()}${amenity?.slice(1)} (no name)`}</div>
                    <div className="text-gray-600">{p.lat.toFixed(5)}, {p.lon.toFixed(5)}</div>
                    {getWebsite(p.tags) && (
                      <div className="mt-1"><a className="text-blue-600 underline" href={getWebsite(p.tags)!} target="_blank" rel="noopener noreferrer">Website</a></div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm text-gray-600">Loading map...</span>
          </div>
        )}
      </div>
      {amenity && (
        <div className="mt-3">
          <div className="text-sm text-gray-700 mb-2">
            {isLoading ? 'Loading...' : (() => {
              const locationTabs = new Set(['arts','entertainment','live_music','nature','nightlife','shopping'])
              const count = pois.length
              const labelMap: Record<string, string> = {
                restaurant: 'Restaurants',
                bar: 'Bars',
                cafes: 'Cafes',
                fast_desserts: 'Fast Food / Desserts',
                sports: 'Sports',
                results: 'Results',
                bookmarks: 'Bookmarks',
                arts: 'Arts',
                entertainment: 'Entertainment',
                live_music: 'Live Music',
                nature: 'Nature',
                nightlife: 'Nightlife',
                shopping: 'Shopping',
              }
              const key = amenity ?? 'results'
              const tabLabel = labelMap[key] || (key || '')
              if (locationTabs.has(key)) {
                return `Found ${count} ${tabLabel} locations within ${radius}m`
              }
              return `Found ${count} ${tabLabel} within ${radius}m`
            })()}
          </div>
          
          {/* Search Bar */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={poiSearchQuery}
                onChange={(e) => setPoiSearchQuery(e.target.value)}
                placeholder={`Search in ${amenity}...`}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {poiSearchQuery && (
              <p className="text-xs text-gray-600 mt-1">
                Showing {filteredPois.length} of {pois.length} results
              </p>
            )}
          </div>
          
          <div className="bg-white border rounded-md divide-y max-h-72 overflow-auto">
            {filteredPois.slice(0, visibleCount).map((p) => {
              const opening = p.tags?.opening_hours ? String(p.tags.opening_hours) : undefined
              const suburb = getSuburb(p.tags)
              const desc = getShortDescription(p.tags) || p.typeLabel || amenity || ''
              const isSelected = selectedPoiId === p.id
              const website = getWebsite(p.tags)
              const isOpen = opening ? isCurrentlyOpen(opening) : undefined
              return (
                <div
                  key={p.id}
                  className={`w-full text-left p-3 select-none ${isSelected ? 'bg-red-50' : ''}`}
                >
                  <button
                    type="button"
                    ref={isSelected ? selectedRef : undefined}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectPoi(p)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectPoi(p) } }}
                    className="w-full text-left"
                  >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`font-medium ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>{p.name || desc}</div>
                      {opening && isOpen !== undefined && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isOpen 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{p.lat.toFixed(5)}, {p.lon.toFixed(5)}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">{desc}</div>
                  <div className="mt-1 text-xs text-gray-500 flex gap-4 flex-wrap">
                    {suburb && <span>Suburb: {suburb}</span>}
                    {opening && <span>Hours: {opening}</span>}
                    {website && (
                      <a className="text-blue-600 underline" href={website} target="_blank" rel="noopener noreferrer">Website</a>
                    )}
                  </div>
                  </button>
                  
                  {/* Bookmark and Event functionality */}
                  {amenity !== 'bookmarks' && userId && (
                    <div className="mt-2 flex justify-end gap-2">
                      {isPoiBookmarked(p) ? (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            // Get the bookmark ID from our stored map
                            const bookmarkId = bookmarkIds.get(`${p.lat},${p.lon}`)
                            if (bookmarkId) {
                              await removeBookmark(bookmarkId)
                            }
                          }}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Remove Bookmark
                        </button>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await addBookmark(p)
                          }}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Add Bookmark
                        </button>
                      )}
                      
                      {/* Add Event Button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          // Create event data from POI
                          const eventData = {
                            name: p.name || desc,
                            address: p.tags?.address || p.tags?.suburb || `${p.lat}, ${p.lon}`,
                            latitude: p.lat,
                            longitude: p.lon,
                            date: new Date().toISOString().split('T')[0],
                            startTime: '12:00',
                            endTime: '14:00',
                            invitedUsers: []
                          }
                          // Call the parent's openCalendarPopup function
                          if (onAddEvent) {
                            onAddEvent(eventData)
                          }
                        }}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Add Event
                      </button>
                    </div>
                  )}
                  
                  {amenity === 'bookmarks' && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          await removeBookmark(p.id)
                        }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove Bookmark
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {filteredPois.length === 0 && (
              <div className="p-3 text-sm text-gray-500">
                {poiSearchQuery ? 'No results match your search' : 'No results'}
              </div>
            )}
          </div>
          {visibleCount < filteredPois.length && (
            <button
              onClick={() => setVisibleCount(c => Math.min(c + 10, filteredPois.length))}
              className="mt-2 text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md border"
            >
              View more
            </button>
          )}
        </div>
      )}
    </div>
  )
} 