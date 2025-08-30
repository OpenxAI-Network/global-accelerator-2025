
import { Edge } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { communities } from "@/constants/network";
import { CustomNode } from "@/types/network";

interface NetworkDataSidebarProps {
  nodes: CustomNode[];
  edges: Edge[];
}

export function NetworkDataSidebar({ nodes, edges }: NetworkDataSidebarProps) {
  const communityStats = communities.map((community, index) => {
    const communityNodes = nodes.filter(node => node.data.community === index);
    const communityEdges = edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      return sourceNode && sourceNode.data.community === index;
    });

    return {
      name: community.name,
      color: community.color,
      nodeCount: communityNodes.length,
      edgeCount: communityEdges.length,
      centralNode: communityNodes.find(node => node.data.isCentral)?.data.label,
    };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Network Overview</h3>
      <Card className="p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm">Total Nodes</span>
          <span className="font-medium">{nodes.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Total Edges</span>
          <span className="font-medium">{edges.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Communities</span>
          <span className="font-medium">{communities.length}</span>
        </div>
      </Card>

      <h3 className="text-sm font-medium text-muted-foreground mt-6">Communities</h3>
      <div className="space-y-2">
        {communityStats.map((stat, index) => (
          <Card key={index} className="p-3 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
              <span className="font-medium text-sm">{stat.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Nodes: {stat.nodeCount}</div>
              <div>Edges: {stat.edgeCount}</div>
              {stat.centralNode && (
                <div className="col-span-2">Central: {stat.centralNode}</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
