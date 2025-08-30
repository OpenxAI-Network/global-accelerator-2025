
import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  markerEnd?: string;
  data?: {
    type?: 'default' | 'strong' | 'dashed';
    label?: string;
  };
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: CustomEdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine edge styling based on the type
  const getEdgeStyle = () => {
    const baseStyle = { ...style };
    
    switch(data?.type) {
      case 'strong':
        return {
          ...baseStyle,
          strokeWidth: 3,
          stroke: style.stroke || '#333',
        };
      case 'dashed':
        return {
          ...baseStyle,
          strokeDasharray: '5,5',
          stroke: style.stroke || '#666',
        };
      default:
        return baseStyle;
    }
  };

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={getEdgeStyle()} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
        >
          {data?.label && (
            <div className="px-2 py-1 bg-background/80 rounded shadow text-xs">
              {data.label}
            </div>
          )}
          <button
            className="ml-1 h-5 w-5 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center shadow-sm hover:bg-gray-100"
            onClick={onEdgeClick}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
