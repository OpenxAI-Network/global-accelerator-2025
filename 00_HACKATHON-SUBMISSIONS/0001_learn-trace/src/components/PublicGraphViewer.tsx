"use client";

import { useEffect, useRef, useState } from "react";
//@ts-ignore
import { Network, DataSet } from "vis-network/standalone";
import { supabase } from "@/lib/supabaseClient";
import { Network as NetworkIcon, ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface PublicGraphViewerProps {
  chatId: string;
  chatData: Chat;
}

export default function PublicGraphViewer({ chatId, chatData }: PublicGraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [isTree, setIsTree] = useState(false);

  // Helper functions (same as in your GraphViewer)
  const detectResourceType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("notion.so") || url.includes("notion.site")) return "notion";
    if (url.includes("github.com")) return "github";
    if (url.includes("docs.google.com")) return "google-docs";
    return "link";
  };

  const getResourceImageURI = (type: string) => {
    switch (type) {
      case 'youtube': return "/assets/yt-icon.png";
      case 'notion': return "/assets/notion-icon.png";
      case 'github': return "/assets/github-icon.png";
      case 'google-docs': return "/assets/docs-icon.png";
      default: return 'L';
    }
  };

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);

      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from("nodes")
        .select("*")
        .eq("chat_id", chatId);

      if (nodesError) {
        console.error("Error fetching nodes:", nodesError);
        setLoading(false);
        return;
      }

      // Fetch edges
      const { data: edgesData, error: edgesError } = await supabase
        .from("edges")
        .select("*")
        .eq("chat_id", chatId);

      if (edgesError) {
        console.error("Error fetching edges:", edgesError);
        setLoading(false);
        return;
      }

      // Fetch notes and resources (same logic as your GraphViewer)
      const nodeIds = nodesData?.map((node) => node.id) || [];
      let notesData: any[] = [];
      let resourcesData: any[] = [];

      if (nodeIds.length > 0) {
        try {
          const { data: fetchedNotes } = await supabase
            .from("notes")
            .select("*")
            .in("node_id", nodeIds);
          if (fetchedNotes) notesData = fetchedNotes;
        } catch (err) {
          console.log("Notes table not found");
        }

        try {
          const { data: fetchedResources } = await supabase
            .from("external_resources")
            .select("*")
            .in("node_id", nodeIds);
          if (fetchedResources) resourcesData = fetchedResources;
        } catch (err) {
          console.log("Resources table not found");
        }
      }

      // Process nodes (same logic as your GraphViewer)
      const parsedNodes = nodesData?.map((node: any) => ({
        id: String(node.id),
        label: node.summary ?? "[No title]",
        title: node.title,
        subtitle: node.title,
      }));

      // Create note nodes and edges (same logic)
      const noteNodes: any[] = [];
      const noteEdges: any[] = [];

      notesData.forEach((note) => {
        const parentNode = parsedNodes.find((n) => n.id === String(note.node_id));
        if (parentNode) {
          const noteNodeId = `note_${note.id}`;
          noteNodes.push({
            id: noteNodeId,
            label: note.content.length > 15 ? note.content.substring(0, 15) + "..." : note.content,
            title: `Note: ${note.content}`,
            color: {
              background: "#F59E0B",
              border: "#D97706",
              highlight: { background: "#FBBF24", border: "#F59E0B" },
              hover: { background: "#FCD34D", border: "#F59E0B" },
            },
            font: { color: "#0f0000ff", size: 14, align: "bottom", vadjust: 20 },
            shape: "dot",
            size: 14,
            borderWidth: 2,
            shadow: { enabled: true, color: "rgba(245, 158, 11, 0.3)", size: 10, x: 0, y: 4 },
          });

          noteEdges.push({
            from: String(note.node_id),
            to: noteNodeId,
            color: { color: "#F59E0B", opacity: 0.8 },
            dashes: [5, 5],
            width: 1,
            arrows: { to: false },
            physics: false,
          });
        }
      });

      // Create resource nodes and edges (same logic)
      const resourceNodes: any[] = [];
      const resourceEdges: any[] = [];

      resourcesData.forEach((resource) => {
        const parentNode = parsedNodes.find((n) => n.id === String(resource.node_id));
        if (parentNode) {
          const resourceNodeId = `resource_${resource.id}`;
          const resourceType = detectResourceType(resource.resource_link);

          resourceNodes.push({
            id: resourceNodeId,
            label: "",
            title: `${resource.title}`,
            shape: "image",
            image: getResourceImageURI(resourceType),
            color: {
              background: "#10B981",
              border: "#059669",
              highlight: { background: "#34D399", border: "#10B981" },
              hover: { background: "#6EE7B7", border: "#10B981" },
            },
            size: 20,
            borderWidth: 2,
            shadow: { enabled: true, color: "rgba(16, 185, 129, 0.3)", size: 10, x: 0, y: 4 },
          });

          resourceEdges.push({
            from: String(resource.node_id),
            to: resourceNodeId,
            color: { color: "#10B981", opacity: 0.8 },
            dashes: [5, 5],
            width: 1,
            arrows: { to: false },
            physics: false,
          });
        }
      });

      const parsedEdges = edgesData?.map((edge: any) => ({
        from: String(edge.from_node),
        to: String(edge.to_node),
        color: { color: "#8B5CF6", highlight: "#6D28D9", hover: "#A3BFFA", opacity: 0.8 },
      }));

      setNodes([...parsedNodes, ...noteNodes, ...resourceNodes]);
      setEdges([...parsedEdges, ...noteEdges, ...resourceEdges]);
      setLoading(false);
    };

    fetchGraphData();
  }, [chatId]);

  // Network initialization (same as your GraphViewer but without edit interactions)
  useEffect(() => {
    if (!loading && containerRef.current && nodes.length > 0) {
      const visNodes = new DataSet(nodes);
      const visEdges = new DataSet(edges);

      const network = new Network(
        containerRef.current,
        { nodes: visNodes, edges: visEdges },
        {
          layout: {
            improvedLayout: true,
            hierarchical: isTree ? { enabled: true, direction: "UD", sortMethod: "directed" } : false,
          },
          interaction: {
            zoomView: true,
            dragView: true,
            dragNodes: false, // Disabled for public view
            keyboard: false,
            multiselect: false,
            hover: true,
            navigationButtons: false,
          },
          physics: isTree ? false : {
            enabled: true,
            stabilization: { iterations: 200 },
            solver: "forceAtlas2Based",
            forceAtlas2Based: {
              gravitationalConstant: -50,
              centralGravity: 0.01,
              springLength: 350,
              springConstant: 0.005,
            },
          },
          manipulation: { enabled: false },
          // Same styling as your GraphViewer
          nodes: {
            shape: "dot",
            size: 14,
            font: { color: "#0f0000ff", size: 14, align: "bottom", vadjust: 20 },
            borderWidth: 2,
            color: {
              background: "#4F46E5",
              border: "#3730A3",
              highlight: { background: "#8B5CF6", border: "#6D28D9" },
              hover: { background: "#A3BFFA", border: "#4F46E5" },
            },
            shadow: { enabled: true, color: "rgba(79, 70, 229, 0.3)", size: 10, x: 0, y: 4 },
          },
          edges: {
            smooth: false,
            color: { color: "#8B5CF6", highlight: "#6D28D9", hover: "#A3BFFA", inherit: false, opacity: 0.8 },
            width: 2,
            arrows: { to: { enabled: true, type: "arrow", scaleFactor: 0.6 } },
          },
        }
      );

      networkRef.current = network;

      return () => {
        network?.destroy();
        networkRef.current = null;
      };
    }
  }, [loading, nodes, edges, isTree]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/share/${chatId}`}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Chat</span>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">LearnTrace</h1>
                  <p className="text-sm text-slate-500">Public Knowledge Graph</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">{chatData.title}</h2>
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(chatData.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Public</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTree((prev) => !prev)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
            >
              {isTree ? "Graph Mode" : "Tree Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="h-[calc(100vh-120px)] p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading knowledge graph...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <NetworkIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No knowledge graph available</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full rounded-lg border border-slate-200 bg-white shadow-sm" />
        )}
      </div>

      {/* Footer */}
      <div className="py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto text-center text-slate-500">
          <p>Powered by <strong className="text-indigo-600">LearnTrace</strong> - AI-powered learning visualization</p>
        </div>
      </div>
    </div>
  );
}
