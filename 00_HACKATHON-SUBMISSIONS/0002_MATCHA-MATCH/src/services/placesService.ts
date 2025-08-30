import { MatchaPlace } from "@/data/mockMatcha";

export interface UserLocation {
  lat: number;
  lng: number;
}

export class PlacesService {
  private placesService: google.maps.places.PlacesService | null = null;
  private map: google.maps.Map | null = null;

  constructor(map?: google.maps.Map) {
    if (map) {
      this.map = map;
      this.placesService = new google.maps.places.PlacesService(map);
    }
  }

  async searchNearbyMatcha(location: UserLocation, radius: number = 5000): Promise<MatchaPlace[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error("Places service not initialized"));
        return;
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: radius,
        keyword: "matcha tea cafe",
        type: "cafe"
      };

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const matchaPlaces: MatchaPlace[] = results
            .filter(place => place.geometry?.location)
            .map((place, index) => this.convertToMatchaPlace(place, location, index))
            .slice(0, 20); // Limit to 20 results
          
          resolve(matchaPlaces);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  private convertToMatchaPlace(place: google.maps.places.PlaceResult, userLocation: UserLocation, index: number): MatchaPlace {
    const lat = place.geometry!.location!.lat();
    const lng = place.geometry!.location!.lng();
    
    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
    
    // Generate a match score based on rating and distance
    const rating = place.rating || 4.0;
    const matchScore = Math.min(95, Math.round((rating / 5) * 100 - (distance * 5)));
    
    // Determine price range from price_level
    const priceRanges = ["$", "$$", "$$$", "$$$$"];
    const priceRange = priceRanges[place.price_level || 1] as "$" | "$$" | "$$$" | "$$$$";
    
    // Generate tags based on place types
    const tags = this.generateTags(place.types || []);
    
    return {
      id: place.place_id || `place-${index}`,
      name: place.name || "Unknown Matcha Place",
      rating: rating,
      priceRange: priceRange,
      distance: parseFloat(distance.toFixed(1)),
      matchScore: Math.max(60, matchScore), // Minimum 60% match
      address: place.vicinity || "Address not available",
      lat: lat,
      lng: lng,
      image: place.photos?.[0]?.getUrl({ maxWidth: 300, maxHeight: 200 }) || "http://localhost:8001/api/ai/placeholder/300/200",
      tags: tags
    };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.degToRad(lat2 - lat1);
    const dLng = this.degToRad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private generateTags(types: string[]): string[] {
    const tags: string[] = [];
    
    if (types.includes('cafe')) tags.push('cafe');
    if (types.includes('restaurant')) tags.push('restaurant');
    if (types.includes('meal_takeaway')) tags.push('takeout');
    if (types.includes('store')) tags.push('retail');
    
    // Add some default matcha-related tags
    const matchaTags = ['matcha', 'green tea', 'organic', 'authentic'];
    tags.push(matchaTags[Math.floor(Math.random() * matchaTags.length)]);
    
    return tags.slice(0, 3); // Limit to 3 tags
  }
}

export async function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        // Fallback to San Francisco if geolocation fails
        console.warn("Geolocation failed, using default location:", error);
        resolve({
          lat: 37.7749,
          lng: -122.4194
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}