
import { Node } from "@xyflow/react";

export interface NodeData extends Record<string, unknown> {
  label: string;
  community: number;
  influence?: number;
  isCentral?: boolean;
  type?: string | number;
}

export type CustomNode = Node<NodeData>;

export interface CommunityInfo {
  color: string;
  count: number;
  name: string;
}

export interface CommunityStats {
  name: string;
  color: string;
  nodeCount: number;
  edgeCount: number;
  centralNode?: string;
}
