import { Card } from "@/components/ui/card";
import { ReactFlowProvider } from "@xyflow/react";
import NetworkGraph from "@/components/NetworkGraph";
import { NetworkDataSidebar } from "@/components/NetworkDataSidebar";
import { NetworkFilter } from "@/components/NetworkFilter";
import { NetworkLayoutControls, LayoutType } from "@/components/NetworkLayoutControls";
import { NetworkPersistenceControls } from "@/components/NetworkPersistenceControls";
import { CustomNode } from "@/types/network";
import { Connection, Edge, NodeMouseHandler, EdgeChange } from "@xyflow/react";
import { useState } from "react";
import { EditNodeDialog } from "@/components/EditNodeDialog";
import { CreateEdgeDialog } from "@/components/CreateEdgeDialog";
import { NetworkSidebar } from "./layout/NetworkSidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NodeDetailPanel } from "@/components/NodeDetailPanel";

interface NetworkViewProps {
  nodes: CustomNode[];
  edges: Edge[];
  filteredNodes: CustomNode[];
  selectedCommunities: number[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (selectedCommunities: number[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection | Edge) => void;
  onAddNode: (nodeData: { name: string; type: string; community: number }) => void;
  onUpdateNode: (nodeId: string, updates: { name: string; type: string; community: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onCreateEdge: (sourceId: string, targetId: string, edgeType: string) => void;
  onApplyLayout: (type: LayoutType, options: any) => void;
  onLoadNetwork: (nodes: CustomNode[], edges: Edge[]) => void;
}

export const NetworkView = ({ 
  nodes, 
  edges, 
  filteredNodes,
  selectedCommunities,
  searchQuery,
  onSearchChange,
  onFilterChange,
  onEdgesChange, 
  onConnect,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onCreateEdge,
  onApplyLayout,
  onLoadNetwork
}: NetworkViewProps) => {
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateEdgeDialogOpen, setIsCreateEdgeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleNodeClick: NodeMouseHandler<CustomNode> = (_, node) => {
    setSelectedNode(node);
  };
  
  const handleEditNode = () => {
    if (selectedNode) {
      setIsEditDialogOpen(true);
    } else {
      console.log("Please select a node to edit");
    }
  };
  
  const handleDeleteSelection = () => {
    if (selectedNode) {
      onDeleteNode(selectedNode.id);
      setSelectedNode(null);
    } else {
      console.log("Please select a node to delete");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b px-4 md:px-6 py-3 flex justify-between items-center">
        <h2 className="text-lg font-medium">Network Visualization</h2>
        <NetworkFilter 
          selectedCommunities={selectedCommunities}
          onFilterChange={onFilterChange}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="lg:hidden">
          <NetworkSidebar 
            onAddNode={onAddNode}
            onCreateEdge={() => setIsCreateEdgeDialogOpen(true)}
            onEditNode={handleEditNode}
            onDeleteSelection={handleDeleteSelection}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
        
        <div className="flex-1 p-4 md:p-6">
          <Card className="h-full">
            <ReactFlowProvider>
              <NetworkGraph 
                nodes={filteredNodes}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
              />
            </ReactFlowProvider>
          </Card>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l w-full lg:w-80 p-4 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
              {selectedNode && (
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="overview">
              <NetworkDataSidebar nodes={nodes} edges={edges} />
            </TabsContent>
            
            <TabsContent value="tools" className="space-y-6">
              <NetworkLayoutControls onApplyLayout={onApplyLayout} />
              <NetworkPersistenceControls
                nodes={nodes}
                edges={edges}
                onLoadNetwork={onLoadNetwork}
              />
            </TabsContent>
            
            <TabsContent value="details">
              {selectedNode && (
                <NodeDetailPanel 
                  node={selectedNode} 
                  onClose={() => setSelectedNode(null)}
                  onEdit={() => setIsEditDialogOpen(true)}
                  onDelete={() => {
                    onDeleteNode(selectedNode.id);
                    setSelectedNode(null);
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <EditNodeDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        node={selectedNode}
        onUpdateNode={onUpdateNode}
      />
      
      <CreateEdgeDialog
        open={isCreateEdgeDialogOpen}
        onOpenChange={setIsCreateEdgeDialogOpen}
        nodes={nodes}
        onCreateEdge={onCreateEdge}
      />
    </div>
  );
};
