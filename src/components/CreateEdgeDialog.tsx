
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomNode } from "@/types/network";

interface CreateEdgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: CustomNode[];
  onCreateEdge: (sourceId: string, targetId: string, edgeType: string) => void;
}

export function CreateEdgeDialog({ open, onOpenChange, nodes, onCreateEdge }: CreateEdgeDialogProps) {
  const [sourceId, setSourceId] = React.useState<string>("");
  const [targetId, setTargetId] = React.useState<string>("");
  const [edgeType, setEdgeType] = React.useState<string>("default");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId && targetId) {
      onCreateEdge(sourceId, targetId, edgeType);
      onOpenChange(false);
      // Reset form
      setSourceId("");
      setTargetId("");
      setEdgeType("default");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source Node</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger id="source" className="w-full">
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.data.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target">Target Node</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger id="target" className="w-full">
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter((node) => node.id !== sourceId)
                    .map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.data.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edgeType">Connection Type</Label>
              <Select value={edgeType} onValueChange={setEdgeType}>
                <SelectTrigger id="edgeType" className="w-full">
                  <SelectValue placeholder="Select connection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Regular</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={!sourceId || !targetId}
            >
              Create Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
