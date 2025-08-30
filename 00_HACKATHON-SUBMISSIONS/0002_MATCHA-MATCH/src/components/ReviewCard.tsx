import { Star } from "lucide-react";
import { Review } from "@/data/reviews";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="bg-background/50 border border-appprimary/20 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-foreground text-sm">
          {review.reviewerName}
        </h4>
        <span className="text-xs text-muted-foreground">
          {formatDate(review.date)}
        </span>
      </div>
      
      <div className="flex items-center mb-2">
        <div className="flex items-center space-x-1">
          {renderStars(review.rating)}
        </div>
        <span className="ml-2 text-sm text-muted-foreground">
          {review.rating}/5
        </span>
      </div>
      
      <p className="text-sm text-foreground/80 leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
}
