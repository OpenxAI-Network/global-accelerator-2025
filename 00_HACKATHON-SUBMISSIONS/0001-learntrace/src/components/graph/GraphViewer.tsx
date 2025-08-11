"use client";

import { useEffect, useRef, useState } from "react";
import { Network, DataSet } from "vis-network/standalone";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteNodeAndMessage } from "@/utils/deleteNode";

export default function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  useEffect(() => {
    if (!chatId) return;

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

      const parsedNodes = nodesData?.map((node: any) => ({
        id: String(node.id),
        label: node.title ?? "[No title]",
        title: node.title,
        subtitle: node.title,
      }));

      const parsedEdges = edgesData?.map((edge: any) => ({
        from: String(edge.from_node),
        to: String(edge.to_node),
        color: {
          color: "#8B5CF6", // Purple 500
          highlight: "#6D28D9", // Purple 700
          hover: "#A3BFFA", // Indigo 300
          opacity: 0.8,
        },
      }));

      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setLoading(false);
    };

    fetchGraphData();
  }, [chatId]);

  useEffect(() => {
    if (!loading && containerRef.current && nodes.length > 0) {
      const visNodes = new DataSet(nodes);
      const visEdges = new DataSet(edges);

      let network: Network | null = null;

      network = new Network(
        containerRef.current,
        { nodes: visNodes, edges: visEdges },
        {
          layout: {
            improvedLayout: true,
          },
          interaction: {
            zoomView: true,
            dragView: true,
            dragNodes: true,
            keyboard: false,
            multiselect: false,
            hover: true,
            navigationButtons: false,
          },
          physics: {
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
          manipulation: { enabled: true },
          nodes: {
            shape: "dot",
            size: 14,
            font: {
              color: "#0f0000ff",
              size: 14,
              align: "bottom",
              vadjust: 20, // move label below node
            },
            borderWidth: 2,
            color: {
              background: "#4F46E5",
              border: "#3730A3",
              highlight: {
                background: "#8B5CF6",
                border: "#6D28D9",
              },
              hover: {
                background: "#A3BFFA",
                border: "#4F46E5",
              },
            },
            shadow: {
              enabled: true,
              color: "rgba(79, 70, 229, 0.3)",
              size: 10,
              x: 0,
              y: 4,
            },
          },
          edges: {
            smooth: false,
            color: {
              color: "#8B5CF6",
              highlight: "#6D28D9",
              hover: "#A3BFFA",
              inherit: false,
              opacity: 0.8,
            },
            width: 2,
            arrows: {
              to: {
                enabled: false,
                type: "arrow",
                scaleFactor: 0.6,
              },
            },
          },
        }
      );
      // Left-click → open chat
      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];
          const clickedNode = nodes.find((n) => n.id === clickedNodeId);
          if (clickedNode) {
            router.push(
              `/chat?chatId=${chatId}&parentId=${clickedNodeId}&parentTitle=${encodeURIComponent(
                clickedNode.title
              )}`
            );
          }
        }
      });

      // Right-click → delete node
      network.on("oncontext", async (params) => {
        params.event.preventDefault();
        const pointer = network.getNodeAt(params.pointer.DOM);
        if (pointer) {
          const nodeId = pointer;
          const confirmDelete = window.confirm(
            "Delete this node and its message?"
          );
          if (confirmDelete) {
            const err = await deleteNodeAndMessage(nodeId.toString());
            if (!err) {
              setNodes((prev) => prev.filter((n) => n.id !== nodeId));
              setEdges((prev) =>
                prev.filter((e) => e.from !== nodeId && e.to !== nodeId)
              );
            } else {
              alert("Error deleting node. See console for details.");
            }
          }
        }
      });

      return () => network.destroy();
    }
  }, [loading, nodes, edges, chatId, router]);

  return (
    <div className="flex-1 w-full h-full">
      {loading ? (
        <div className="p-4">Loading graph...</div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
}
