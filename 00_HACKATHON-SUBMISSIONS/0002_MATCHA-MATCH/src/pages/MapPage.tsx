import MapView from "@/components/MapView";
import Header from "@/components/Header";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold">Matcha Spots</h1>
        <p className="text-sm text-muted-foreground">
          Discover and explore matcha spots near you. We'll use your location (or Sydney as a fallback) to find nearby places.
        </p>
        <MapView />
      </div>
    </div>
  );
}
