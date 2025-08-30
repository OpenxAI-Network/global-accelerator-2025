
import { CustomNode } from "@/types/network";
import { communities } from "@/constants/network";

export type LayoutType = "force" | "circular" | "grid" | "random";

interface LayoutOptions {
  spacing?: number;
  centerX?: number;
  centerY?: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  spacing: 50,
  centerX: 500,
  centerY: 400
};

// Position nodes in a circle
export const applyCircularLayout = (nodes: CustomNode[], options: LayoutOptions = DEFAULT_OPTIONS): CustomNode[] => {
  const { centerX = 500, centerY = 400, spacing = 50 } = options;
  const nodeCount = nodes.length;
  const radius = spacing * (nodeCount / (2 * Math.PI));
  
  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodeCount;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    return {
      ...node,
      position: { x, y }
    };
  });
};

// Position nodes in a grid
export const applyGridLayout = (nodes: CustomNode[], options: LayoutOptions = DEFAULT_OPTIONS): CustomNode[] => {
  const { centerX = 500, centerY = 400, spacing = 50 } = options;
  const nodeCount = nodes.length;
  const cols = Math.ceil(Math.sqrt(nodeCount));
  
  return nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = centerX + (col - cols/2) * spacing * 2;
    const y = centerY + (row - Math.floor(nodeCount/cols)/2) * spacing * 2;
    
    return {
      ...node,
      position: { x, y }
    };
  });
};

// Position nodes randomly
export const applyRandomLayout = (nodes: CustomNode[], options: LayoutOptions = DEFAULT_OPTIONS): CustomNode[] => {
  const { centerX = 500, centerY = 400, spacing = 50 } = options;
  const area = nodes.length * spacing * spacing;
  const side = Math.sqrt(area);
  
  return nodes.map(node => {
    const x = centerX + (Math.random() - 0.5) * side;
    const y = centerY + (Math.random() - 0.5) * side;
    
    return {
      ...node,
      position: { x, y }
    };
  });
};

// Basic force-directed layout simulation (simplified)
export const applyForceDirectedLayout = (nodes: CustomNode[], options: LayoutOptions = DEFAULT_OPTIONS): CustomNode[] => {
  const { centerX = 500, centerY = 400, spacing = 50 } = options;
  
  // Group nodes by community
  const communityCenters: Record<number, {x: number, y: number}> = {};
  
  // Calculate initial positions around community centers
  communities.forEach((community, index) => {
    const angle = (2 * Math.PI * index) / communities.length;
    const radius = spacing * 5;
    communityCenters[index] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  return nodes.map(node => {
    const community = node.data.community;
    const center = communityCenters[community] || { x: centerX, y: centerY };
    
    // Add some randomness around the community center
    const angleOffset = Math.random() * Math.PI * 2;
    const radiusOffset = Math.random() * spacing * 2;
    
    const x = center.x + radiusOffset * Math.cos(angleOffset);
    const y = center.y + radiusOffset * Math.sin(angleOffset);
    
    return {
      ...node,
      position: { x, y }
    };
  });
};

// Apply the selected layout algorithm
export const applyLayout = (
  nodes: CustomNode[], 
  layoutType: LayoutType, 
  options: LayoutOptions = DEFAULT_OPTIONS
): CustomNode[] => {
  switch (layoutType) {
    case "circular":
      return applyCircularLayout(nodes, options);
    case "grid":
      return applyGridLayout(nodes, options);
    case "random":
      return applyRandomLayout(nodes, options);
    case "force":
    default:
      return applyForceDirectedLayout(nodes, options);
  }
};
