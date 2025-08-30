import { useState } from "react";
import { MessageSquare, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { useReviews } from "@/hooks/useReviews";
import { MatchaPlace } from "@/data/mockMatcha";

interface ReviewsSectionProps {
  place: MatchaPlace;
}

export default function ReviewsSection({ place }: ReviewsSectionProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { getReviewsForPlace, addReview, getAverageRating } = useReviews();
  
  const reviews = getReviewsForPlace(place.id);
  const averageRating = getAverageRating(place.id);
  const hasReviews = reviews.length > 0;

  const handleReviewSubmit = (review: { reviewerName: string; rating: number; comment: string }) => {
    addReview(place.id, review);
    setShowForm(false);
  };

  const toggleReviews = () => {
    setShowReviews(!showReviews);
    if (showForm) setShowForm(false);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="mt-4 pt-4 border-t border-appprimary/20">
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-appaccent" />
          <span className="text-sm font-medium text-foreground">
            Reviews ({reviews.length})
          </span>
          {hasReviews && (
            <span className="text-xs text-muted-foreground">
              • Avg: {averageRating}/5
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleForm();
            }}
            className="h-8 px-3 text-xs bg-background/80 hover:bg-background border-appprimary/30 hover:border-appprimary text-white"
          >
            {showForm ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            {showForm ? "Hide" : "Review"}
          </Button>
          
          {hasReviews && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleReviews();
              }}
              className="h-8 px-3 text-xs bg-background/80 hover:bg-background border-appprimary/30 hover:border-appprimary text-white"
            >
              {showReviews ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {showReviews ? "Hide" : "Show"}
            </Button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          placeId={place.id}
          placeName={place.name}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* Reviews List */}
      {showReviews && hasReviews && (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* No Reviews Message */}
      {!hasReviews && !showForm && (
        <div className="text-center py-6 text-white">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-white">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}
    </div>
  );
}
