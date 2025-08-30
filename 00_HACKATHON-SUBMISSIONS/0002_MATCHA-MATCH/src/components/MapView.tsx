import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Star, MapPin } from "lucide-react";

// UPDATED: Interface to match Django API response
interface DjangoPlace {
  id: string;
  name: string;
  rating: number;
  price_level?: number;
  vicinity?: string;
  lat: number;  // Ensure Django sends this
  lng: number;  // Ensure Django sends this
  match_score: number;  // Ensure Django sends this
  distance?: number;
  price_range?: string;
  photos?: string[];
}

// UPDATED: Removed props since we'll fetch data internally
export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<DjangoPlace[]>([]); // UPDATED: State for places
  const [hoveredPlace, setHoveredPlace] = useState<DjangoPlace | null>(null); // UPDATED: Type change
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true); // UPDATED: Loading state
  const [error, setError] = useState<string | null>(null); // UPDATED: Error state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null); // UPDATED: User location

  // UPDATED: Function to get user's current location
  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            resolve(location);
          },
          (error) => {
            console.log("Geolocation failed, using Sydney as default:", error);
            // Default to Sydney
            const sydneyLocation = { lat: -33.8688, lng: 151.2093 };
            setUserLocation(sydneyLocation);
            resolve(sydneyLocation);
          }
        );
      } else {
        // Default to Sydney if geolocation not supported
        const sydneyLocation = { lat: -33.8688, lng: 151.2093 };
        setUserLocation(sydneyLocation);
        resolve(sydneyLocation);
      }
    });
  };

  // UPDATED: Function to fetch places from Django API
  const fetchPlaces = async (userLat?: number, userLng?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build URL with location parameters if available
              let url = 'http://localhost:8000/api/places/';
      if (userLat && userLng) {
        url += `?lat=${userLat}&lng=${userLng}`;
      }
      
      console.log('Fetching places from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received places data:', data);
      
      // Handle both array response and object with results array
      const placesData = Array.isArray(data) ? data : data.results || [];
      
      if (placesData.length === 0) {
        console.warn('No places data received');
      }
      
      setPlaces(placesData);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Failed to load matcha places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Initialize map and fetch data
  useEffect(() => {
    const initMapAndData = async () => {
      try {
        // Get user location first
        const location = await getUserLocation();
        console.log('User location:', location);
        
        // Fetch places with user location
        await fetchPlaces(location.lat, location.lng);
        
        // Initialize map
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo-key",
          version: "weekly",
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        if (mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: location, // UPDATED: Use user location or Sydney default
            zoom: 13,
            mapId: "matcha-map",
          });

          setMap(mapInstance);
          console.log('Map initialized successfully');
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setError('Failed to initialize map. Please check your API key.');
        setLoading(false);
      }
    };

    initMapAndData();
  }, []); // UPDATED: Empty dependency array since we handle everything internally

  // UPDATED: Add markers when places or map changes
  useEffect(() => {
    if (!map || places.length === 0) {
      console.log('Map or places not ready:', { map: !!map, placesCount: places.length });
      return;
    }

    console.log('Adding markers for places:', places);

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "demo-key",
      version: "weekly",
    });

    const addMarkers = async () => {
      try {
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        // Clear existing markers (you might want to store marker references to clear them properly)
        
        // Add markers for each place
        places.forEach((place, index) => {
          console.log(`Adding marker ${index + 1}:`, place);
          
          const markerElement = document.createElement("div");
          markerElement.className = "custom-marker";
          markerElement.innerHTML = `
            <div style="
              background: linear-gradient(135deg, #22c55e, #16a34a);
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              ${place.match_score || '?'}
            </div>
          `;

          const marker = new AdvancedMarkerElement({
            map: map,
            position: { lat: place.lat, lng: place.lng },
            content: markerElement,
          });

          // Add hover events
          markerElement.addEventListener("mouseenter", (e) => {
            setHoveredPlace(place);
            setTooltipPosition({ x: e.clientX, y: e.clientY });
          });

          markerElement.addEventListener("mouseleave", () => {
            setHoveredPlace(null);
          });

          markerElement.addEventListener("mousemove", (e) => {
            setTooltipPosition({ x: e.clientX, y: e.clientY });
          });
        });
        
        console.log('All markers added successfully');
      } catch (error) {
        console.error("Error adding markers:", error);
      }
    };

    addMarkers();
  }, [map, places]); // UPDATED: Depend on both map and places

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-matcha-forest";
    if (score >= 80) return "text-matcha-dark";
    return "text-matcha-medium";
  };

  // UPDATED: Helper function to format price range
  const formatPriceRange = (priceLevel?: number) => {
    if (!priceLevel) return "Price not available";
    return "$".repeat(priceLevel);
  };

  // UPDATED: Calculate distance if not provided by backend
  const calculateDistance = (place: DjangoPlace) => {
    if (place.distance) return place.distance;
    
    if (!userLocation) return "Distance unknown";
    
    // Simple distance calculation (you might want to use a more accurate method)
    const R = 3959; // Earth's radius in miles
    const dLat = (place.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (place.lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(place.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  return (
    <div className="relative h-[600px] w-full">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
      
      {/* UPDATED: Enhanced loading/error states */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha-dark mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading matcha places...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Fetching data from Django API...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-red-600 mb-2">⚠️ {error}</p>
            <button 
              onClick={() => fetchPlaces(userLocation?.lat, userLocation?.lng)}
              className="px-4 py-2 bg-matcha-dark text-white rounded-lg hover:bg-matcha-forest transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Debug info */}
      {!loading && !error && places.length === 0 && (
        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-muted-foreground">No places found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Places loaded: {places.length}
            </p>
            <button 
              onClick={() => fetchPlaces(userLocation?.lat, userLocation?.lng)}
              className="px-4 py-2 bg-matcha-dark text-white rounded-lg hover:bg-matcha-forest transition-colors mt-4"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Hover Tooltip - UPDATED: Handle new data structure */}
      {hoveredPlace && (
        <div
          className="fixed z-50 bg-white p-4 rounded-lg shadow-xl border border-border max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 100,
          }}
        >
          <h4 className="font-semibold text-foreground mb-2">
            {hoveredPlace.name}
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{hoveredPlace.rating || 'N/A'}</span>
              </div>
              <span className="text-muted-foreground">
                {hoveredPlace.price_range || formatPriceRange(hoveredPlace.price_level)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{calculateDistance(hoveredPlace)} miles away</span>
            </div>
            
            <div className={`font-semibold ${getMatchScoreColor(hoveredPlace.match_score || 0)}`}>
              {hoveredPlace.match_score || 0}% match
            </div>
            
            {hoveredPlace.vicinity && (
              <div className="text-xs text-muted-foreground mt-1">
                {hoveredPlace.vicinity}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}