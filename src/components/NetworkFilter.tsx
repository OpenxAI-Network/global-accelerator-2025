
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { communities } from "@/constants/network";

interface NetworkFilterProps {
  selectedCommunities: number[];
  onFilterChange: (selectedCommunities: number[]) => void;
}

export function NetworkFilter({ selectedCommunities, onFilterChange }: NetworkFilterProps) {
  const [open, setOpen] = useState(false);

  const handleCommunityToggle = (communityIndex: number) => {
    const newSelectedCommunities = selectedCommunities.includes(communityIndex)
      ? selectedCommunities.filter((i) => i !== communityIndex)
      : [...selectedCommunities, communityIndex];
    
    onFilterChange(newSelectedCommunities);
  };

  const handleSelectAll = () => {
    onFilterChange(communities.map((_, index) => index));
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter View
          {selectedCommunities.length < communities.length && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCommunities.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter by Community</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {communities.map((community, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`community-${index}`}
                  checked={selectedCommunities.includes(index)}
                  onCheckedChange={() => handleCommunityToggle(index)}
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: community.color }}
                  />
                  <label
                    htmlFor={`community-${index}`}
                    className="text-sm cursor-pointer"
                  >
                    {community.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
