import { useState, useEffect, useCallback } from 'react';
import { Review, ReviewsData, mockReviews } from '@/data/reviews';

const STORAGE_KEY = 'mm_reviews';

export const useReviews = () => {
  const [reviews, setReviews] = useState<ReviewsData>({});

  // Load reviews from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const parsedWithDates = Object.keys(parsed).reduce((acc, placeId) => {
          acc[placeId] = parsed[placeId].map((review: any) => ({
            ...review,
            date: new Date(review.date)
          }));
        }, {} as ReviewsData);
        setReviews(parsedWithDates);
      } catch (error) {
        console.error('Failed to parse stored reviews:', error);
        setReviews(mockReviews);
      }
    } else {
      setReviews(mockReviews);
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  // Add a new review
  const addReview = useCallback((placeId: string, review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: crypto.randomUUID(),
      date: new Date()
    };

    setReviews(prev => ({
      ...prev,
      [placeId]: [...(prev[placeId] || []), newReview]
    }));
  }, []);

  // Get reviews for a specific place
  const getReviewsForPlace = useCallback((placeId: string) => {
    return reviews[placeId] || [];
  }, [reviews]);

  // Get all reviews across all places
  const getAllReviews = useCallback(() => {
    return Object.values(reviews).flat();
  }, [reviews]);

  // Get total number of reviews
  const getTotalReviews = useCallback(() => {
    return Object.values(reviews).reduce((total, placeReviews) => total + placeReviews.length, 0);
  }, [reviews]);

  // Get average rating for a place
  const getAverageRating = useCallback((placeId: string) => {
    const placeReviews = reviews[placeId] || [];
    if (placeReviews.length === 0) return 0;
    
    const totalRating = placeReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / placeReviews.length) * 10) / 10; // Round to 1 decimal place
  }, [reviews]);

  // Get reviews sorted by date (newest first)
  const getReviewsSortedByDate = useCallback((placeId: string) => {
    const placeReviews = reviews[placeId] || [];
    return [...placeReviews].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [reviews]);

  return {
    reviews,
    addReview,
    getReviewsForPlace,
    getAllReviews,
    getTotalReviews,
    getAverageRating,
    getReviewsSortedByDate
  };
};
