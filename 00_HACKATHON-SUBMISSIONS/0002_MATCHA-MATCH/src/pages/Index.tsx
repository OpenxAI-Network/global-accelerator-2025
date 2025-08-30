import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ViewToggle from "@/components/ViewToggle";
import ListView from "@/components/ListView";
import MapView from "@/components/MapView"; // current MapView fetches its own data
import TopPlacesCarousel from "@/components/TopPlacesCarousel";
import { mockMatchaPlaces, MatchaPlace } from "@/data/mockMatcha";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import ChatWidget from "@/components/ChatWidget";

// CHANGED: keep a single place to define your API base
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// helpers
const toDollar = (n?: number | null) =>
  typeof n === "number" && n > 0 ? "$".repeat(Math.min(4, n)) : "—";
const fakeScore = () => Math.floor(80 + Math.random() * 20);

// CHANGED: read prefs from localStorage
const getPrefs = () => JSON.parse(localStorage.getItem("mm_prefs") || "null");
const derivePriceRange = (price?: number | string) => {
  if (typeof price === "number") return "$".repeat(Math.min(4, Math.max(1, price)));
  if (typeof price === "string" && /^\$+$/.test(price)) return price;
  return "$$"; // default average
};

// CHANGED: re-rank places using saved preferences
function applyPrefs(items: MatchaPlace[], p: any): MatchaPlace[] {
  if (!p) return items;

  return items
    .map((x) => {
      let s = x.matchScore ?? 50;

      // price nudge: compare by number of $ in priceRange
      const priceLen = (x.priceRange || "").length;
      if (p.price === "low") s += priceLen <= 1 ? 10 : priceLen >= 3 ? -10 : 0;
      if (p.price === "high") s += priceLen >= 3 ? 8 : 0;

      // iced/hot keyword nudge
      const n = (x.name || "").toLowerCase();
      if (p.temp === "iced" && n.includes("ice")) s += 5;
      if (p.temp === "hot" && (n.includes("hot") || n.includes("latte"))) s += 3;

      // sweetness nudge
      if (p.sweetness === "unsweet" && n.includes("dessert")) s -= 6;
      if (p.sweetness === "sweet" && n.includes("dessert")) s += 6;

      s = Math.max(0, Math.min(100, Math.round(s)));
      return { ...x, matchScore: s };
    })
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}

export default function Index() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"list" | "map">("list");
  const [places, setPlaces] = useState<MatchaPlace[]>(mockMatchaPlaces);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getHeartCount, isHearted } = useFavorites();

  useEffect(() => {
    initializePlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CHANGED (nice-to-have): if the user edits preferences and returns,
  // re-apply ranking on window focus so list order updates.
  useEffect(() => {
    const onFocus = () => setPlaces((prev) => applyPrefs(prev, getPrefs()));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const initializePlaces = async () => {
    setLoading(true);
    try {
      // get user location (fallback to Sydney)
      const getLoc = () =>
        new Promise<{ lat: number; lng: number }>((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
              () => resolve({ lat: -33.8688, lng: 151.2093 })
            );
          } else {
            resolve({ lat: -33.8688, lng: 151.2093 });
          }
        });

      const { lat, lng } = await getLoc();
      const res = await fetch(`${API_BASE}/places/?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();

      // Normalize backend -> MatchaPlace (so PlaceCard never gets undefined for strings)
      const mapped: MatchaPlace[] = (Array.isArray(raw) ? raw : raw.results || []).map((p: any) => ({
        id: p.id ?? p.place_id ?? crypto.randomUUID(),
        name: p.name ?? "Unknown",
        lat: p.lat ?? p.geometry?.location?.lat ?? -33.8688,
        lng: p.lng ?? p.geometry?.location?.lng ?? 151.2093,
        rating: typeof p.rating === "number" ? p.rating : 0,
        priceRange: derivePriceRange(p.price_range ?? p.price_level),
        distance: typeof p.distance === "number" ? p.distance : 0,
        matchScore: typeof p.match_score === "number" ? p.match_score : fakeScore(),
        address: (p.vicinity ?? p.address ?? "") as string,
        photos: Array.isArray(p.photos) && p.photos.length ? p.photos : [`http://localhost:8001/api/ai/placeholder/400/200/`],
        openNow: p.open_now ?? p.opening_hours?.open_now ?? undefined,
        heartsCount: getHeartCount(p.id ?? p.place_id ?? ""),
        isHearted: isHearted(p.id ?? p.place_id ?? ""),
      }));

      // CHANGED: apply preferences before setting places
      const ranked = applyPrefs(mapped, getPrefs());
      setPlaces(ranked);

      toast({
        title: "Loaded Places",
        description: `Found ${ranked.length} matcha places from backend.`,
      });
    } catch (err) {
      console.error("Failed to fetch places from backend:", err);

      // CHANGED: also apply preferences to demo data so the list is still personalized
      const rankedFallback = applyPrefs(mockMatchaPlaces, getPrefs()).map(place => ({
        ...place,
        heartsCount: getHeartCount(place.id),
        isHearted: isHearted(place.id),
      }));
      setPlaces(rankedFallback);

      toast({
        title: "Error Fetching Places",
        description: "Using demo data instead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Top Places Carousel */}
        <div className="mb-8">
          <TopPlacesCarousel />
        </div>
        <div className="flex justify-center mb-6 space-x-4">
          <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground font-cute">Loading matcha places...</p>
            </div>
          </div>
        ) : currentView === "list" ? (
          <ListView places={places} />
        ) : (
          <MapView />
        )}
      </div>
      
      {/* Chat Widget - Fixed at bottom-right corner */}
      <ChatWidget />
    </div>
  );
}
