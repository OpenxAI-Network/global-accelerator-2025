export interface UserProfile {
  id: number;
  name: string;
  school: string;
  email: string;
  verified: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  seller: UserProfile;
  school: string;
  createdAt: string;
  status: 'active' | 'pending' | 'sold' | 'rejected' | 'shipped' | 'delivered' | 'completed';
  moderationResult?: {
    approved: boolean;
    reason?: string;
  };
  images?: string[];
  averageRating?: number;
  reviewsCount?: number;
}







