
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { communities } from "@/constants/network";
import { CustomNode } from "@/types/network";

interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: CustomNode | null;
  onUpdateNode: (nodeId: string, updates: { name: string; type: string; community: number }) => void;
}

export function EditNodeDialog({ open, onOpenChange, node, onUpdateNode }: EditNodeDialogProps) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("");
  const [community, setCommunity] = React.useState<string>("");

  // When node changes, update the form values
  React.useEffect(() => {
    if (node) {
      setName(node.data.label || "");
      setType(node.data.type?.toString() || "");
      setCommunity(node.data.community.toString());
    }
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (node && name && type && community) {
      onUpdateNode(node.id, { 
        name, 
        type, 
        community: parseInt(community, 10) 
      });
      onOpenChange(false);
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Node: {node.data.label}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Node Name</Label>
              <Input
                id="name"
                placeholder="Enter node name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Node Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select node type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Person</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger id="community" className="w-full">
                  <SelectValue placeholder="Select community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {community.name}
                    </SelectItem>
                  ))}
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
            <Button type="submit" className="w-full sm:w-auto">
              Update Node
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
