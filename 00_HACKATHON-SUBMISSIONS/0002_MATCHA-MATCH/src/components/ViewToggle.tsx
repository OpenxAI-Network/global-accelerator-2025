import { List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  currentView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-secondary rounded-lg p-1 shadow-card">
      <Button
        variant={currentView === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="flex items-center space-x-2 transition-all duration-200"
      >
        <List className="h-4 w-4" />
        <span>List</span>
      </Button>
      <Button
        variant={currentView === "map" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("map")}
        className="flex items-center space-x-2 transition-all duration-200"
      >
        <Map className="h-4 w-4" />
        <span>Map</span>
      </Button>
    </div>
  );
}