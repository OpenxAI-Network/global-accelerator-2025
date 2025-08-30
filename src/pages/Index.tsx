import { useState, useCallback, useMemo, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { NetworkView } from "@/components/NetworkView";
import { generateNodes, generateEdges } from "@/utils/network";
import { toast } from "sonner";
import { CustomNode } from "@/types/network";
import { Connection, Edge, EdgeChange } from "@xyflow/react";
import { communities } from "@/constants/network";
import { LayoutType, applyLayout } from "@/utils/layouts";

const initialNodes = generateNodes();
const initialEdges = generateEdges(initialNodes);

const Index = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedCommunities, setSelectedCommunities] = useState<number[]>(
    communities.map((_, index) => index)
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter nodes based on selected communities and search query
  const filteredNodes = useMemo(() => {
    let filtered = nodes;
    
    // Filter by community
    if (selectedCommunities.length < communities.length) {
      filtered = filtered.filter(node => 
        selectedCommunities.includes(node.data.community)
      );
    }
    
    // Filter by search query if it exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(node => 
        node.data.label.toLowerCase().includes(query) || 
        (node.data.type && node.data.type.toString().toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [nodes, selectedCommunities, searchQuery]);

  // Filter edges to only include connections between visible nodes
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(node => node.id));
    
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleAddNode = (nodeData: { name: string; type: string; community: number }) => {
    const newNode: CustomNode = {
      id: `node-${nodes.length + 1}`,
      type: "default",
      data: {
        label: nodeData.name,
        type: nodeData.type,
        community: nodeData.community,
      },
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      style: {
        background: communities[nodeData.community].color,
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        opacity: 0.8,
      }
    };
    
    setNodes([...nodes, newNode]);
    toast.success("Node added successfully");
  };

  const handleUpdateNode = useCallback((nodeId: string, updates: { name: string; type: string; community: number }) => {
    setNodes(prevNodes => prevNodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            label: updates.name,
            type: updates.type,
            community: updates.community
          },
          style: {
            ...node.style,
            background: communities[updates.community].color,
          }
        };
      }
      return node;
    }));
    toast.success("Node updated successfully");
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    // Remove the node
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    
    // Remove all edges connected to this node
    setEdges(prevEdges => prevEdges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    ));
    
    toast.success("Node deleted successfully");
  }, []);

  const handleCreateEdge = useCallback((sourceId: string, targetId: string, edgeType: string) => {
    // Check if this edge already exists
    const edgeExists = edges.some(
      edge => edge.source === sourceId && edge.target === targetId
    );
    
    if (edgeExists) {
      toast.error("This connection already exists");
      return;
    }
    
    // Find the source node to get its style for the edge
    const sourceNode = nodes.find(node => node.id === sourceId);
    const targetNode = nodes.find(node => node.id === targetId);
    
    if (!sourceNode || !targetNode) {
      toast.error("Cannot create edge: node not found");
      return;
    }
    
    const sourceCommunity = sourceNode.data.community;
    const targetCommunity = targetNode.data.community;
    const isCrossConnection = sourceCommunity !== targetCommunity;
    
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'custom',
      data: {
        type: edgeType,
        label: isCrossConnection ? 'Cross-community' : undefined,
      },
      style: { 
        stroke: isCrossConnection ? '#rgba(160, 160, 160, 0.2)' : sourceNode.style?.background as string,
        opacity: isCrossConnection ? 0.15 : 0.25,
        strokeWidth: 1 + (edgeType === 'strong' ? 2 : 0),
      },
      animated: edgeType === 'strong',
    };
    
    setEdges(prevEdges => [...prevEdges, newEdge]);
    toast.success("Link created successfully");
  }, [edges, nodes]);

  const handleFilterChange = useCallback((newSelectedCommunities: number[]) => {
    setSelectedCommunities(newSelectedCommunities);
  }, []);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      // For EdgeRemove changes we need to remove the edge
      const edgesToRemove = changes
        .filter(change => change.type === 'remove')
        .map(change => change.id);
      
      if (edgesToRemove.length) {
        return eds.filter(edge => !edgesToRemove.includes(edge.id));
      }
      
      // For other changes, just return the current edges
      return eds;
    });
  }, []);

  const handleConnect = useCallback((connection: Connection | Edge) => {
    // If connection is already an Edge (from our custom implementation), use it directly
    if ('id' in connection && connection.id) {
      setEdges((eds) => [...eds, connection as Edge]);
    } else {
      // Otherwise, create a basic edge from the connection
      const params = connection as Connection;
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: params.source || "",
        target: params.target || "",
        type: 'custom',
        data: {
          type: 'default',
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  }, []);

  const handleApplyLayout = useCallback((layoutType: LayoutType, options: any) => {
    setNodes(prevNodes => {
      const newNodes = applyLayout([...prevNodes], layoutType, options);
      toast.success(`Applied ${layoutType} layout`);
      return newNodes;
    });
  }, []);

  const handleLoadNetwork = useCallback((newNodes: CustomNode[], newEdges: Edge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  return (
    <MainLayout>
      <NetworkView
        nodes={nodes}
        edges={filteredEdges}
        filteredNodes={filteredNodes}
        selectedCommunities={selectedCommunities}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onAddNode={handleAddNode}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onCreateEdge={handleCreateEdge}
        onApplyLayout={handleApplyLayout}
        onLoadNetwork={handleLoadNetwork}
      />
    </MainLayout>
  );
};

export default Index;
