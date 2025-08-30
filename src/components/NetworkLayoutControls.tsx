
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export type LayoutType = "force" | "circular" | "grid" | "random";

interface NetworkLayoutControlsProps {
  onApplyLayout: (type: LayoutType, options: any) => void;
}

export const NetworkLayoutControls = ({ onApplyLayout }: NetworkLayoutControlsProps) => {
  const [layoutType, setLayoutType] = useState<LayoutType>("force");
  const [spacing, setSpacing] = useState([50]);

  const handleApplyLayout = () => {
    onApplyLayout(layoutType, { spacing: spacing[0] });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-medium">Layout Controls</h3>
      
      <div className="space-y-2">
        <Label htmlFor="layout-type">Layout Type</Label>
        <Select
          value={layoutType}
          onValueChange={(value) => setLayoutType(value as LayoutType)}
        >
          <SelectTrigger id="layout-type">
            <SelectValue placeholder="Select layout type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="force">Force-Directed</SelectItem>
            <SelectItem value="circular">Circular</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="random">Random</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="spacing">Node Spacing</Label>
          <span className="text-xs text-muted-foreground">{spacing[0]}</span>
        </div>
        <Slider
          id="spacing"
          min={10}
          max={200}
          step={5}
          value={spacing}
          onValueChange={setSpacing}
        />
      </div>
      
      <Button onClick={handleApplyLayout} className="w-full">
        Apply Layout
      </Button>
    </div>
  );
};
