
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { NetworkSidebar } from "@/components/layout/NetworkSidebar";
import { ReactNode, useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // This should be handled by the parent component to actually filter nodes
    // We just implement the handler here to satisfy the prop requirements
  };
  
  const handleAddNode = () => {
    console.log("Add node clicked in main layout");
    // This should be handled by the parent component
  };
  
  const handleCreateEdge = () => {
    console.log("Create edge clicked in main layout");
    // This should be handled by the parent component
  };
  
  const handleEditNode = () => {
    console.log("Edit node clicked in main layout");
    // This should be handled by the parent component
  };
  
  const handleDeleteSelection = () => {
    console.log("Delete selection clicked in main layout");
    // This should be handled by the parent component
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex">
        <NetworkSidebar 
          onAddNode={handleAddNode}
          onCreateEdge={handleCreateEdge}
          onEditNode={handleEditNode} 
          onDeleteSelection={handleDeleteSelection}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
      <MobileNavigation />
    </div>
  );
};
