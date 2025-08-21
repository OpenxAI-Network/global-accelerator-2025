interface FallbackPlan {
  name: string
  address: string
  coordinates: string
  description: string
  price_range: string
  opening_hours: string
}

export function generateFallbackPlans(formData: any): any[] {
  const { location, meetingType, numberOfPeople, food, drinks, otherActivities, priceRange } = formData
  
  // Provide safe defaults for undefined values
  const safeMeetingType = meetingType || 'meeting'
  const safeLocation = location || 'your area'
  const safeNumberOfPeople = numberOfPeople || 'a group'
  const safePriceRange = priceRange || '$$'
  
  // Generate generic fallback plans based on meeting type
  const fallbackPlans = [
    {
      name: `${safeMeetingType} at Local Cafe`,
      address: `${safeLocation}`,
      coordinates: "0,0",
      description: `A cozy local cafe perfect for ${safeMeetingType.toLowerCase()} with ${safeNumberOfPeople} people.`,
      price_range: safePriceRange,
      opening_hours: "9:00 AM - 6:00 PM"
    },
    {
      name: `${safeMeetingType} at Community Center`,
      address: `${safeLocation}`,
      coordinates: "0,0", 
      description: `Community center with flexible spaces for ${safeMeetingType.toLowerCase()}.`,
      price_range: "$",
      opening_hours: "8:00 AM - 8:00 PM"
    },
    {
      name: `${safeMeetingType} at Public Park`,
      address: `${safeLocation}`,
      coordinates: "0,0",
      description: `Beautiful outdoor setting for ${safeMeetingType.toLowerCase()} with ${safeNumberOfPeople} people.`,
      price_range: "Free",
      opening_hours: "Dawn to Dusk"
    },
    {
      name: `${safeMeetingType} at Library`,
      address: `${safeLocation}`,
      coordinates: "0,0",
      description: `Quiet library space perfect for ${safeMeetingType.toLowerCase()}.`,
      price_range: "Free",
      opening_hours: "10:00 AM - 8:00 PM"
    },
    {
      name: `${safeMeetingType} at Restaurant`,
      address: `${safeLocation}`,
      coordinates: "0,0",
      description: `Local restaurant with great food for ${safeMeetingType.toLowerCase()}.`,
      price_range: safePriceRange,
      opening_hours: "11:00 AM - 10:00 PM"
    }
  ]

  return fallbackPlans
}
