export type PlaceDTO = {
  id: string;
  name: string;
  rating?: number | null;
  price_level?: number | null;
  vicinity?: string;
  lat: number;
  lng: number;
  match_score?: number;
  distance?: number;
  price_range?: string;
  photos?: string[];
};

export async function fetchPlaces(lat: number, lng: number, radius = 3000) {
  const url = `http://localhost:8000/api/places/?lat=${lat}&lng=${lng}&radius=${radius}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend ${res.status}`);
  return (await res.json()) as PlaceDTO[];
}
