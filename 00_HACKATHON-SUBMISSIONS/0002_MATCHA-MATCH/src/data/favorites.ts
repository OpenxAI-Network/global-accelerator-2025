export interface Favorite {
  placeId: string;
  placeName: string;
  heartsCount: number;
  lastHearted: Date;
}

export interface FavoritesData {
  [placeId: string]: Favorite;
}

// Start with empty favorites - will be populated with real places from API
export const mockFavorites: FavoritesData = {};
