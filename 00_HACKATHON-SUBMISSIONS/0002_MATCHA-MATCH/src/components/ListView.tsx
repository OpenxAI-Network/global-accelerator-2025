import { useState } from "react";
import PlaceCard from "./PlaceCard";
import { MatchaPlace } from "@/data/mockMatcha";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListViewProps {
  places: MatchaPlace[];
}

type SortOption = "matchScore" | "distance" | "rating" | "price";

export default function ListView({ places }: ListViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>("matchScore");

  const sortedPlaces = [...places].sort((a, b) => {
    switch (sortBy) {
      case "matchScore":
        return b.matchScore - a.matchScore;
      case "distance":
        return a.distance - b.distance;
      case "rating":
        return b.rating - a.rating;
      case "price":
        const priceOrder = { "$": 1, "$$": 2, "$$$": 3, "$$$$": 4 };
        return priceOrder[a.priceRange] - priceOrder[b.priceRange];
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-6">
        <h2 className="text-2xl font-bold text-foreground">
          {places.length} places found
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matchScore">Match Score</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {sortedPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}