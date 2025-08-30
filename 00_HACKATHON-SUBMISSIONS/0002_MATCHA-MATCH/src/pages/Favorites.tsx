import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import PlaceCard from "@/components/PlaceCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useReviews } from "@/hooks/useReviews";
import { mockMatchaPlaces } from "@/data/mockMatcha";
import { useEffect, useState } from "react";

export default function Favorites() {
  const navigate = useNavigate();
  const { getFavoritedPlaces, getTotalFavoritedPlaces, getTotalHeartCount } = useFavorites();
  const { getTotalReviews } = useReviews();
  
  const [realPlaces, setRealPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const favoritedPlaces = getFavoritedPlaces();
  const totalFavorited = getTotalFavoritedPlaces();
    const totalHeartCount = getTotalHeartCount();
  const totalReviews = getTotalReviews();
  
  // Fetch real places data from backend
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api";
        const res = await fetch(`${API_BASE}/places/?lat=-33.8688&lng=151.2093`);
        if (res.ok) {
          const data = await res.json();
          const rawPlaces = Array.isArray(data) ? data : data.results || [];
          console.log('🔍 Raw places fetched:', rawPlaces);
          
          // Use the SAME mapping logic as the main page
          const mappedPlaces = rawPlaces.map((p: any) => ({
            id: p.id ?? p.place_id ?? crypto.randomUUID(),
            name: p.name ?? "Unknown",
            lat: p.lat ?? p.geometry?.location?.lat ?? -33.8688,
            lng: p.lng ?? p.geometry?.location?.lng ?? 151.2093,
            rating: typeof p.rating === "number" ? p.rating : 0,
            priceRange: p.price_range ? "$".repeat(Math.min(4, Math.max(1, p.price_range))) : "$$",
            distance: typeof p.distance === "number" ? p.distance : 0,
            matchScore: typeof p.match_score === "number" ? p.match_score : Math.floor(80 + Math.random() * 20),
            address: (p.vicinity ?? p.address ?? "") as string,
            photos: Array.isArray(p.photos) && p.photos.length ? p.photos : [`http://localhost:8001/api/ai/placeholder/400/200/`],
            openNow: p.open_now ?? p.opening_hours?.open_now ?? undefined,
            tags: p.types || ["matcha", "cafe"],
          }));
          
          console.log('🔍 Mapped places:', mappedPlaces);
          setRealPlaces(mappedPlaces);
        }
      } catch (error) {
        console.error('Failed to fetch places:', error);
        // Fallback to mock data if backend fails
        setRealPlaces(mockMatchaPlaces);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaces();
  }, []);
  
  // Get full place data for favorited places (use real data if available)
  const placesWithData = favoritedPlaces.map(favorite => {
    console.log('🔍 Processing favorite:', favorite);
    console.log('🔍 Looking for place name:', favorite.placeName);
    console.log('🔍 Available real places:', realPlaces.map(p => ({ id: p.id, name: p.name })));
    
    // Try to find place in real data by NAME (more reliable than ID)
    const placeData = realPlaces.find(p => p.name === favorite.placeName);
    
    if (placeData) {
      console.log('✅ Found real place data:', placeData);
      return {
        ...placeData,
        heartsCount: favorite.heartsCount,
        isHearted: true
      };
    }
    
    // Fallback to mock data if not found in real data
    const mockPlaceData = mockMatchaPlaces.find(p => p.id === favorite.placeId);
    if (mockPlaceData) {
      console.log('⚠️ Using mock place data:', mockPlaceData);
      return {
        ...mockPlaceData,
        heartsCount: favorite.heartsCount,
        isHearted: true
      };
    }
    
    console.log('❌ No place data found for favorite:', favorite);
    return null;
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/home")}
              className="text-appaccent hover:text-appaccent/80 hover:bg-appaccent/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Most Loved Matcha Spots</h1>
                <p className="text-muted-foreground">
                  Discover the community's favorite matcha experiences
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-appaccent">{totalFavorited}</div>
            <div className="text-sm text-muted-foreground">Favorited Places</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-appprimary/20 rounded-lg p-6 text-center">
            <Heart className="h-8 w-8 text-red-500 fill-current mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">
              {totalHeartCount}
            </div>
            <div className="text-sm text-muted-foreground">Total Hearts</div>
          </div>
          
          <div className="bg-card border border-appprimary/20 rounded-lg p-6 text-center">
            <div className="h-8 w-8 bg-appprimary rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">★</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalReviews}</div>
            <div className="text-sm text-muted-foreground">Total Reviews</div>
          </div>
          
          <div className="bg-card border border-appprimary/20 rounded-lg p-6 text-center">
            <div className="h-8 w-8 bg-appaccent rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔥</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {favoritedPlaces.length > 0 ? Math.round(favoritedPlaces[0].heartsCount / favoritedPlaces[favoritedPlaces.length - 1].heartsCount * 10) / 10 : 0}x
            </div>
            <div className="text-sm text-muted-foreground">Most vs Least Loved</div>
          </div>
        </div>

        {/* Places Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground font-cute">Loading favorite places...</p>
            </div>
          </div>
        ) : placesWithData.length > 0 ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Top Favorited Places
              </h2>
              <div className="text-sm text-muted-foreground">
                Sorted by heart count (highest first)
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {placesWithData.map((place) => (
                <div key={place.id} className="relative">
                  <PlaceCard place={place} />
                  {/* Heart Count Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Heart className="h-4 w-4 fill-current" />
                      <span>{place.heartsCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              No Favorites Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start exploring matcha spots and heart your favorites to see them here!
            </p>
            <Button
              onClick={() => navigate("/home")}
              className="bg-appprimary hover:bg-appprimary/80 text-foreground"
            >
              Explore Matcha Spots
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
