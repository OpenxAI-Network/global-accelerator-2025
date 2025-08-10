"use client";

import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";
import { DataSet } from "vis-network/standalone";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteNodeById } from "@/utils/deleteNode";

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

      const { data: nodesData, error: nodesError } = await supabase
        .from("nodes")
        .select("*")
        .eq("chat_id", chatId);

      if (nodesError) {
        console.error("Error fetching nodes:", nodesError);
        setLoading(false);
        return;
      }

      const parsedNodes = nodesData?.map((node: any) => ({
        id: String(node.id),
        label: node.summary ?? "[No summary]",
        color: node.sender === "user" ? "#60A5FA" : "#34D399",
        shape: "box",
      }));

      const parsedEdges = nodesData
        .filter((node: any) => node.parent_id)
        .map((node: any) => ({
          from: String(node.parent_id),
          to: String(node.id),
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

      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];
          router.push(`/chat?id=${chatId}&parent=${clickedNodeId}`);
        }
      });

      return () => network.destroy();
    }
  }, [loading, nodes, edges, chatId]);

  return (
    <div className="flex-1">
      {loading ? <div className="p-4">Loading graph...</div> : <div ref={containerRef} className="w-full h-[600px]" />}
    </div>
  );
}
