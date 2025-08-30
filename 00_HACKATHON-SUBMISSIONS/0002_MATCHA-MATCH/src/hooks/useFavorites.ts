import { useState, useEffect, useCallback } from 'react';
import { Favorite, FavoritesData, mockFavorites } from '@/data/favorites';
import { mockMatchaPlaces } from '@/data/mockMatcha';

const STORAGE_KEY = 'mm_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoritesData>({});
  const [userHearts, setUserHearts] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      } catch (error) {
        console.error('Failed to parse stored favorites:', error);
        setFavorites(mockFavorites);
      }
    } else {
      // Initialize with mock favorites data
      setFavorites(mockFavorites);
    }

    // Load user's personal heart status
    const storedHearts = localStorage.getItem('mm_user_hearts');
    if (storedHearts) {
      try {
        const parsed = JSON.parse(storedHearts);
        setUserHearts(new Set(parsed));
      } catch (error) {
        console.error('Failed to parse stored user hearts:', error);
        setUserHearts(new Set());
      }
    }
  }, []);

  // Populate favorites with real places from API if none exist
  useEffect(() => {
    if (!isInitialized && Object.keys(favorites).length === 0) {
      populateWithRealPlaces();
    }
  }, [favorites, isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to populate favorites with real places from API
  const populateWithRealPlaces = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api";
      const res = await fetch(`${API_BASE}/places/?lat=-33.8688&lng=151.2093`);
      
      if (res.ok) {
        const data = await res.json();
        const places = Array.isArray(data) ? data : data.results || [];
        
        if (places.length > 0) {
          // Take the first 5 places and give them some initial hearts
          const initialFavorites: FavoritesData = {};
          const heartCounts = [67, 42, 35, 28, 19]; // Different heart counts for variety
          
          places.slice(0, 5).forEach((place, index) => {
            const placeId = place.place_id || place.id || `real_${index}`;
            const placeName = place.name || `Matcha Place ${index + 1}`;
            
            initialFavorites[placeId] = {
              placeId,
              placeName,
              heartsCount: heartCounts[index] || 20,
              lastHearted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
            };
          });
          
          console.log('🎯 Populated favorites with real places:', initialFavorites);
          setFavorites(initialFavorites);
          setIsInitialized(true);
        }
      }
    } catch (error) {
      console.error('Failed to populate favorites with real places:', error);
      setIsInitialized(true);
    }
  };

  // Function to reset favorites (useful for testing)
  const resetFavorites = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('mm_user_hearts');
    setFavorites({});
    setUserHearts(new Set());
    setIsInitialized(false);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Save user hearts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mm_user_hearts', JSON.stringify(Array.from(userHearts)));
  }, [userHearts]);

  // Toggle heart for a place
  const toggleHeart = useCallback((placeId: string, placeName: string) => {
    setFavorites(prev => {
      const current = prev[placeId];
      const currentHearts = current?.heartsCount || 0;
      
      if (userHearts.has(placeId)) {
        // User is unhearting - decrease count
        const newHeartsCount = Math.max(0, currentHearts - 1);
        
        if (newHeartsCount === 0) {
          // Remove the place from favorites if no hearts left
          const { [placeId]: removed, ...rest } = prev;
          return rest;
        }
        
        return {
          ...prev,
          [placeId]: {
            ...current!,
            heartsCount: newHeartsCount,
            lastHearted: new Date()
          }
        };
      } else {
        // User is hearting - increase count
        return {
          ...prev,
          [placeId]: {
            placeId,
            placeName,
            heartsCount: currentHearts + 1,
            lastHearted: new Date()
          }
        };
      }
    });

    // Toggle user's personal heart status
    setUserHearts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(placeId)) {
        newSet.delete(placeId);
      } else {
        newSet.add(placeId);
      }
      return newSet;
    });
  }, [userHearts]);

  // Check if a place is hearted by current user
  const isHearted = useCallback((placeId: string) => {
    return userHearts.has(placeId);
  }, [userHearts]);

  // Get heart count for a place
  const getHeartCount = useCallback((placeId: string) => {
    // Get heart count from favorites
    return favorites[placeId]?.heartsCount || 0;
  }, [favorites]);

  // Get all favorited places sorted by heart count
  const getFavoritedPlaces = useCallback(() => {
    // Convert favorites object to array and sort by heart count
    return Object.values(favorites)
      .sort((a, b) => b.heartsCount - a.heartsCount);
  }, [favorites]);

  // Get total number of places with hearts
  const getTotalFavoritedPlaces = useCallback(() => {
    return Object.keys(favorites).length;
  }, [favorites]);

  // Get total heart count across all places
  const getTotalHeartCount = useCallback(() => {
    return Object.values(favorites).reduce((total, favorite) => {
      return total + favorite.heartsCount;
    }, 0);
  }, [favorites]);

  return {
    favorites,
    userHearts,
    toggleHeart,
    isHearted,
    getHeartCount,
    getFavoritedPlaces,
    getTotalFavoritedPlaces,
    getTotalHeartCount,
    resetFavorites
  };
};
