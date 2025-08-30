
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { 
  saveNetworkToLocalStorage, 
  loadNetworkFromLocalStorage,
  exportNetworkAsJson,
  importNetworkFromJson
} from "@/utils/persistence";
import { CustomNode } from "@/types/network";
import { Edge } from "@xyflow/react";
import { Save, Upload, Download, Database } from "lucide-react";

interface NetworkPersistenceControlsProps {
  nodes: CustomNode[];
  edges: Edge[];
  onLoadNetwork: (nodes: CustomNode[], edges: Edge[]) => void;
}

export const NetworkPersistenceControls = ({
  nodes,
  edges,
  onLoadNetwork,
}: NetworkPersistenceControlsProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveToLocalStorage = () => {
    saveNetworkToLocalStorage(nodes, edges);
    toast.success("Network saved to browser storage");
  };

  const handleLoadFromLocalStorage = () => {
    const data = loadNetworkFromLocalStorage();
    if (data) {
      onLoadNetwork(data.nodes, data.edges);
      toast.success("Network loaded from browser storage");
    } else {
      toast.error("No saved network found in browser storage");
    }
  };

  const handleExport = () => {
    exportNetworkAsJson(nodes, edges);
    toast.success("Network exported as JSON file");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const data = await importNetworkFromJson(file);
      onLoadNetwork(data.nodes, data.edges);
      toast.success("Network imported successfully");
    } catch (error) {
      toast.error("Failed to import network: Invalid file format");
      console.error(error);
    } finally {
      setIsImporting(false);
      // Reset file input value so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-medium">Network Persistence</h3>
      
      <div className="space-y-2">
        <Label>Browser Storage</Label>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSaveToLocalStorage}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleLoadFromLocalStorage}
          >
            <Database className="mr-2 h-4 w-4" />
            Load
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>File Export/Import</Label>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleImportClick}
            disabled={isImporting}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
        <Input
          type="file"
          accept=".json"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
