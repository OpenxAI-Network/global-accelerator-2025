export interface MatchaPlace {
  id: string;
  name: string;
  rating: number;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  distance: number; // in miles
  matchScore: number; // 0-100
  address: string;
  lat: number;
  lng: number;
  image: string;
  tags: string[];
  heartsCount?: number; // NEW: Number of hearts for this place
  isHearted?: boolean; // NEW: Whether current user has hearted this place
}

export const mockMatchaPlaces: MatchaPlace[] = [
  {
    id: "1",
    name: "Zen Matcha House",
    rating: 4.8,
    priceRange: "$$",
    distance: 0.3,
    matchScore: 95,
    address: "123 Green St, San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    image: "http://localhost:8001/api/ai/placeholder/300/200",
    tags: ["ceremonial grade", "organic", "wifi"],
    heartsCount: 42
  },
  {
    id: "2", 
    name: "Emerald Tea Lounge",
    rating: 4.6,
    priceRange: "$$$",
    distance: 0.7,
    matchScore: 88,
    address: "456 Matcha Ave, San Francisco, CA",
    lat: 37.7849,
    lng: -122.4094,
    image: "http://localhost:8001/api/ai/placeholder/300/200",
    tags: ["premium blends", "quiet atmosphere", "desserts"],
    heartsCount: 35
  },
  {
    id: "3",
    name: "Green Leaf Cafe",
    rating: 4.4,
    priceRange: "$",
    distance: 1.2,
    matchScore: 82,
    address: "789 Tea Rd, San Francisco, CA",
    lat: 37.7649,
    lng: -122.4294,
    image: "http://localhost:8001/api/ai/placeholder/300/200",
    tags: ["affordable", "casual", "takeout"],
    heartsCount: 28
  },
  {
    id: "4",
    name: "Traditional Matcha Studio",
    rating: 4.9,
    priceRange: "$$$$",
    distance: 1.8,
    matchScore: 90,
    address: "321 Ceremony Way, San Francisco, CA",
    lat: 37.7549,
    lng: -122.4394,
    image: "http://localhost:8001/api/ai/placeholder/300/200",
    tags: ["tea ceremony", "authentic", "premium"],
    heartsCount: 67
  },
  {
    id: "5",
    name: "Modern Matcha Co.",
    rating: 4.2,
    priceRange: "$$",
    distance: 2.1,
    matchScore: 75,
    address: "654 Innovation St, San Francisco, CA",
    lat: 37.7449,
    lng: -122.4494,
    image: "http://localhost:8001/api/ai/placeholder/300/200",
    tags: ["modern twist", "instagram-worthy", "fusion"],
    heartsCount: 19
  }
];