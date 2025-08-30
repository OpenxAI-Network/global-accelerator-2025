
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NetworkIcon, Menu } from "lucide-react";
import { NetworkSidebar } from "./NetworkSidebar";
import { useState } from "react";

export const MobileNavigation = () => {
  // Provide empty handlers for required props
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleAddNode = () => {
    console.log("Add node clicked in mobile navigation");
  };
  
  const handleCreateEdge = () => {
    console.log("Create edge clicked in mobile navigation");
  };
  
  const handleEditNode = () => {
    console.log("Edit node clicked in mobile navigation");
  };
  
  const handleDeleteSelection = () => {
    console.log("Delete selection clicked in mobile navigation");
  };

  return (
    <Sheet>
      <div className="flex md:hidden items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <NetworkIcon className="h-6 w-6 text-primary" />
          <span className="font-semibold">CollabGraph</span>
        </div>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="h-full flex flex-col">
          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-2">
              <NetworkIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">CollabGraph</h1>
            </div>
          </div>
          <NetworkSidebar 
            onAddNode={handleAddNode}
            onCreateEdge={handleCreateEdge}
            onEditNode={handleEditNode}
            onDeleteSelection={handleDeleteSelection}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
