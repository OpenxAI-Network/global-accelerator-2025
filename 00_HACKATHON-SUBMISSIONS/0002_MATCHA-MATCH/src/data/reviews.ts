export interface Review {
  id: string;
  placeId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
}

export interface ReviewsData {
  [placeId: string]: Review[];
}

// Mock initial reviews data
export const mockReviews: ReviewsData = {
  "1": [
    {
      id: "1",
      placeId: "1",
      reviewerName: "Sarah M.",
      rating: 5,
      comment: "Amazing ceremonial grade matcha! The atmosphere is so peaceful and the staff is incredibly knowledgeable.",
      date: new Date("2024-01-20")
    },
    {
      id: "2",
      placeId: "1",
      reviewerName: "Alex K.",
      rating: 4,
      comment: "Great quality matcha, love the organic options. A bit pricey but worth it for the quality.",
      date: new Date("2024-01-18")
    }
  ],
  "2": [
    {
      id: "3",
      placeId: "2",
      reviewerName: "Emma L.",
      rating: 5,
      comment: "Premium matcha experience! The desserts are divine and the atmosphere is perfect for a quiet afternoon.",
      date: new Date("2024-01-19")
    }
  ],
  "3": [
    {
      id: "4",
      placeId: "3",
      reviewerName: "Mike R.",
      rating: 4,
      comment: "Affordable and delicious! Great for casual meetups. The takeout service is super fast.",
      date: new Date("2024-01-17")
    },
    {
      id: "5",
      placeId: "3",
      reviewerName: "Lisa T.",
      rating: 3,
      comment: "Good matcha, but the atmosphere is a bit noisy. Perfect for quick stops though.",
      date: new Date("2024-01-16")
    }
  ],
  "4": [
    {
      id: "6",
      placeId: "4",
      reviewerName: "David W.",
      rating: 5,
      comment: "Authentic tea ceremony experience! The premium matcha is absolutely worth the price. Staff is incredibly respectful of tradition.",
      date: new Date("2024-01-21")
    }
  ],
  "5": [
    {
      id: "7",
      placeId: "5",
      reviewerName: "Jenny H.",
      rating: 4,
      comment: "Modern twist on traditional matcha! Instagram-worthy presentation and unique flavor combinations.",
      date: new Date("2024-01-15")
    }
  ]
};
