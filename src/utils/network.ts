
import { Edge } from "@xyflow/react";
import { communities } from "@/constants/network";
import { CustomNode } from "@/types/network";

export const generateNodes = () => {
  const nodes: CustomNode[] = [];
  let nodeId = 1;

  communities.forEach((community, communityIndex) => {
    const angleStep = (2 * Math.PI) / communities.length;
    const communityAngle = angleStep * communityIndex;
    const communityRadius = 400;
    const centerX = 500 + communityRadius * Math.cos(communityAngle);
    const centerY = 400 + communityRadius * Math.sin(communityAngle);

    nodes.push({
      id: `${nodeId}`,
      data: { 
        label: community.name,
        community: communityIndex,
        isCentral: true,
      },
      position: { x: centerX, y: centerY },
      style: {
        background: community.color,
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        opacity: 0.9,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    });
    nodeId++;

    for (let i = 0; i < community.count; i++) {
      const angle = (2 * Math.PI * i) / community.count;
      const radius = 120 + Math.random() * 80;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const nodeSize = Math.random() * 15 + 20;
      const influence = Math.random();

      nodes.push({
        id: `${nodeId}`,
        data: { 
          label: `Node ${nodeId}`,
          community: communityIndex,
          influence,
        },
        position: { x, y },
        style: {
          background: community.color,
          width: nodeSize,
          height: nodeSize,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          opacity: 0.7 + (influence * 0.3),
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
      });
      nodeId++;
    }
  });

  return nodes;
};

export const generateEdges = (nodes: CustomNode[]) => {
  const edges: Edge[] = [];
  let edgeId = 1;

  nodes.forEach((source) => {
    nodes.forEach((target) => {
      if (source.id !== target.id) {
        const sourceCommunity = source.data.community;
        const targetCommunity = target.data.community;
        
        let probability = sourceCommunity === targetCommunity ? 0.35 : 0.03;
        if (source.data.isCentral || target.data.isCentral) {
          probability *= 1.5;
        }
        
        if (Math.random() < probability) {
          const isCrossConnection = sourceCommunity !== targetCommunity;
          const sourceInfluence = source.data.influence || 0.5;
          const targetInfluence = target.data.influence || 0.5;
          const edgeStrength = (sourceInfluence + targetInfluence) / 2;
          
          // Determine edge type based on connection type
          let edgeType: 'default' | 'strong' | 'dashed' = 'default';
          if (isCrossConnection) {
            edgeType = 'dashed';
          } else if (source.data.isCentral || target.data.isCentral) {
            edgeType = 'strong';
          }

          edges.push({
            id: `e${edgeId}`,
            source: source.id,
            target: target.id,
            type: 'custom',
            data: {
              type: edgeType,
              label: isCrossConnection ? 'Cross-community' : undefined,
            },
            style: { 
              stroke: isCrossConnection ? '#rgba(160, 160, 160, 0.2)' : source.style?.background as string,
              opacity: isCrossConnection ? 0.15 : 0.25,
              strokeWidth: 1 + edgeStrength * 2,
            },
            animated: edgeType === 'strong',
          });
          edgeId++;
        }
      }
    });
  });

  return edges;
};
