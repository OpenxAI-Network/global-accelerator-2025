
import { CustomNode } from "@/types/network";
import { Button } from "@/components/ui/button";

interface NodeDetailPanelProps {
  node: CustomNode;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const NodeDetailPanel = ({ node, onClose, onEdit, onDelete }: NodeDetailPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Node Details</h3>
        <button 
          onClick={onClose} 
          className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          ×
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full" 
          style={{ backgroundColor: node.style?.background as string }}
        ></div>
        <div>
          <h4 className="font-medium">{node.data.label}</h4>
          <span className="text-sm text-muted-foreground">ID: {node.id}</span>
        </div>
      </div>
      
      <div className="space-y-2 pt-2">
        <DetailItem label="Community" value={`Community ${node.data.community}`} />
        <DetailItem label="Type" value={node.data.type?.toString() || "Default"} />
        {node.data.influence !== undefined && (
          <DetailItem label="Influence" value={node.data.influence.toString()} />
        )}
        {node.data.isCentral !== undefined && (
          <DetailItem label="Central Node" value={node.data.isCentral ? "Yes" : "No"} />
        )}
        <DetailItem 
          label="Position" 
          value={`X: ${Math.round(node.position.x)}, Y: ${Math.round(node.position.y)}`}
        />
      </div>
      
      <div className="flex space-x-2 pt-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
          Edit Node
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-destructive" onClick={onDelete}>
          Delete Node
        </Button>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-2">Connected Nodes</h4>
        <div className="text-sm text-muted-foreground">
          Click on the graph to see connected nodes
        </div>
      </div>
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem = ({ label, value }: DetailItemProps) => (
  <div className="flex justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);
