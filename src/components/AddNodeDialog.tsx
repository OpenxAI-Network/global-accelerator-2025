
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
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { communities } from "@/constants/network";

interface AddNodeDialogProps {
  onAddNode: (node: { name: string; type: string; community: number }) => void;
}

export function AddNodeDialog({ onAddNode }: AddNodeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("");
  const [community, setCommunity] = React.useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && type && community) {
      onAddNode({ 
        name, 
        type, 
        community: parseInt(community, 10) 
      });
      setOpen(false);
      // Reset form
      setName("");
      setType("");
      setCommunity("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Node
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Node</DialogTitle>
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
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Add Node
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
