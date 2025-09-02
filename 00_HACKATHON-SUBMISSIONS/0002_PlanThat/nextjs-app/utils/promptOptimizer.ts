export function optimizePrompt(prompt: string): string {
  // Remove unnecessary whitespace and newlines
  let optimized = prompt.replace(/\s+/g, ' ').trim()
  
  // Shorten common phrases
  optimized = optimized
    .replace(/give me 5 ideas for a/g, '5 ideas for')
    .replace(/with the following preferences:/g, 'preferences:')
    .replace(/When returning the information, give me the following format:/g, 'Format:')
    .replace(/Important: For coordinates, use decimal degrees format like/g, 'Coordinates: decimal format')
    .replace(/Do not use degrees\/minutes\/seconds format or other coordinate systems./g, '')
    .replace(/If there are no results, return an empty array./g, '')
  
  // Simplify location format
  optimized = optimized.replace(/location\/region:/g, 'location:')
  
  // Remove redundant quotes around simple values
  optimized = optimized.replace(/"(\d+)"|"(\w+)"|"([^"]{1,10})"/g, (match, p1, p2, p3) => {
    const value = p1 || p2 || p3
    // Keep quotes for longer strings or special values
    if (value.length > 10 || value.includes(' ') || value.includes(',')) {
      return match
    }
    return value
  })
  
  // Limit prompt length to improve response time
  const maxLength = 1000
  if (optimized.length > maxLength) {
    optimized = optimized.substring(0, maxLength) + '...'
  }
  
  return optimized
}

export function createEfficientPrompt(formData: any): string {
  const {
    location,
    meetingType,
    numberOfPeople,
    date,
    startTime,
    endTime,
    food,
    drinks,
    otherActivities,
    priceRange,
    additionalPreferences
  } = formData

  // Create a more concise prompt optimized for Gemma 2:9b
  return `Generate exactly 5 activity ideas for a ${meetingType} in ${location} for ${numberOfPeople} people.

Preferences: Food: ${food}, Drinks: ${drinks}, Activities: ${otherActivities}, Price: ${priceRange}${additionalPreferences !== 'none' ? `, Notes: ${additionalPreferences}` : ''}

Respond with ONLY a valid JSON array containing exactly 5 objects. No additional text or explanations.

[
  {
    "name": "Place Name",
    "address": "Full Address", 
    "coordinates": "latitude,longitude",
    "description": "Brief description",
    "price_range": "Price level",
    "opening_hours": "Hours of operation"
  }
]`
}
