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
        color: "#60A5FA",
        shape: "box",
      }));

      const parsedEdges = edgesData?.map((edge: any) => ({
        from: String(edge.from_node),
        to: String(edge.to_node),
        arrows: "to",
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

      const network = new Network(
        containerRef.current,
        { nodes: visNodes, edges: visEdges },
        {
          layout: {
            hierarchical: {
              direction: "UD",
              sortMethod: "directed",
              nodeSpacing: 100,
              levelSeparation: 150,
            },
          },
          nodes: {
            shape: "box",
            margin: { top: 10, bottom: 10, left: 10, right: 10 },
            font: { color: "#000" },
          },
          edges: {
            smooth: true,
            arrows: { to: { enabled: true, scaleFactor: 0.6 } },
          },
          physics: false,
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
    <div className="flex-1">
      {loading ? (
        <div className="p-4">Loading graph...</div>
      ) : (
        <div ref={containerRef} className="w-full h-[600px]" />
      )}
    </div>
  );
}
