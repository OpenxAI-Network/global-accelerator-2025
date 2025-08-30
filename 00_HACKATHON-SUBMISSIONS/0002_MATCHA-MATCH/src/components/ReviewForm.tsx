import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  placeId: string;
  placeName: string;
  onSubmit: (review: { reviewerName: string; rating: number; comment: string }) => void;
}

export default function ReviewForm({ placeId, placeName, onSubmit }: ReviewFormProps) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewerName.trim() || !comment.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both your name and comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmit({
        reviewerName: reviewerName.trim(),
        rating,
        comment: comment.trim()
      });
      
      // Reset form
      setReviewerName("");
      setRating(5);
      setComment("");
      
      toast({
        title: "Review Submitted!",
        description: `Thank you for reviewing ${placeName}!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setRating(index + 1);
        }}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <Star
          className={`h-6 w-6 ${
            index < currentRating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      </button>
    ));
  };

  return (
    <div className="bg-background/80 border border-appprimary/30 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-foreground mb-3">Write a Review</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reviewerName" className="block text-sm font-medium text-foreground mb-2">
            Your Name
          </label>
          <Input
            id="reviewerName"
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Enter your name"
            className="bg-background border-appprimary/30 focus:border-appprimary"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Rating
          </label>
          <div className="flex items-center space-x-2">
            {renderStars(rating)}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating}/5
            </span>
          </div>
        </div>
        
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
            Comment
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this matcha spot..."
            rows={3}
            className="bg-background border-appprimary/30 focus:border-appprimary resize-none"
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-appprimary hover:bg-appprimary/80 text-foreground"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}
