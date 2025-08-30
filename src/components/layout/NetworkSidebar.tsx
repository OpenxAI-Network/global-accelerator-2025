
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AddNodeDialog } from "@/components/AddNodeDialog";
import {
  NetworkIcon,
  Search,
  Users,
  Calendar,
  MessageCircle,
  Link as LinkIcon,
  Settings,
  Trash2,
} from "lucide-react";

interface NetworkSidebarProps {
  onAddNode: (nodeData: { name: string; type: string; community: number }) => void;
  onCreateEdge: () => void;
  onEditNode: () => void;
  onDeleteSelection: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const NetworkSidebar = ({
  onAddNode,
  onCreateEdge,
  onEditNode,
  onDeleteSelection,
  searchQuery,
  onSearchChange,
}: NetworkSidebarProps) => {
  return (
    <div className="hidden md:flex w-64 border-r bg-background flex-col">
      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <NetworkIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">CollabGraph</h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search nodes..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Network Controls */}
        <div className="px-4 py-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Network Controls</h3>
          <AddNodeDialog onAddNode={onAddNode} />
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={onCreateEdge}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Create Link
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={onEditNode}>
            <Settings className="mr-2 h-4 w-4" />
            Edit Node
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive" size="sm" onClick={onDeleteSelection}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selection
          </Button>
        </div>
        
        <Separator />
        
        {/* Quick Actions */}
        <div className="px-4 py-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Users className="mr-2 h-4 w-4" />
            All Stakeholders
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Recent Activity
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Engagements
          </Button>
        </div>
      </div>
    </div>
  );
};
