
import { Edge } from "@xyflow/react";
import { CustomNode } from "@/types/network";

const STORAGE_KEY = "collab-graph-network";

// Store current network state to localStorage
export const saveNetworkToLocalStorage = (
  nodes: CustomNode[],
  edges: Edge[]
): void => {
  try {
    const data = {
      nodes,
      edges,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save network to localStorage:", error);
  }
};

// Load network state from localStorage
export const loadNetworkFromLocalStorage = (): {
  nodes: CustomNode[];
  edges: Edge[];
} | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return {
      nodes: parsed.nodes,
      edges: parsed.edges,
    };
  } catch (error) {
    console.error("Failed to load network from localStorage:", error);
    return null;
  }
};

// Export network as JSON file
export const exportNetworkAsJson = (
  nodes: CustomNode[],
  edges: Edge[]
): void => {
  try {
    const data = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `collab-graph-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to export network:", error);
  }
};

// Import network from JSON file
export const importNetworkFromJson = (
  file: File
): Promise<{ nodes: CustomNode[]; edges: Edge[] }> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            reject(new Error("Failed to read file"));
            return;
          }
          
          const data = JSON.parse(event.target.result as string);
          
          if (!data.nodes || !data.edges) {
            reject(new Error("Invalid network data format"));
            return;
          }
          
          resolve({
            nodes: data.nodes,
            edges: data.edges,
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      reader.readAsText(file);
    } catch (error) {
      reject(error);
    }
  });
};
