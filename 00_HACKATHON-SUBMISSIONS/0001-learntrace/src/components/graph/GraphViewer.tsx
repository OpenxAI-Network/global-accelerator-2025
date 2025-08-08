"use client";

import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network/standalone";
import { DataSet } from "vis-network/standalone";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { deleteNodeById } from "@/utils/deleteNode";

export default function GraphViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);

      const { data: nodesData, error: nodesError } = await supabase
        .from("nodes")
        .select("*");
      console.log("📦 nodesData:", nodesData, "error:", nodesError);

      const { data: edgesData, error: edgesError } = await supabase
        .from("edges")
        .select("*");
      console.log("📦 edgesData:", edgesData, "error:", edgesError);

      if (nodesError || edgesError) {
        console.error("Error fetching graph data:", nodesError || edgesError);
        setLoading(false);
        return;
      }

      // render nodes
      const parsedNodes = nodesData?.map((node: any) => ({
        id: String(node.id),
        label: node.title ?? "[No title]",
        color: node.sender === "user" ? "#60A5FA" : "#34D399",
        shape: "box",
      }));

      // render edges
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
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current && nodes.length > 0) {
      const visNodes = new DataSet(nodes);
      const visEdges = new DataSet(edges);

      const network = new Network(
        containerRef.current,
        {
          nodes: visNodes,
          edges: visEdges,
        },
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

      // Handle delete on right click
      network.on("oncontext", async (params) => {
        const nodeId = params.nodes?.[0];
        if (!nodeId) return;

        const confirmDelete = window.confirm(
          "Are you sure you want to delete this node and its messages?"
        );
        if (!confirmDelete) return;

        const error = await deleteNodeById(nodeId);
        if (error) {
          alert("Error deleting node");
          return;
        }

        // Remove from graph
        visNodes.remove({ id: nodeId });

        const connectedEdges = visEdges.get({
          filter: (edge: any) => edge.from === nodeId || edge.to === nodeId,
        });
        visEdges.remove(connectedEdges);
      });

      network.on("click", function (params) {
        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];
          console.log("Clicked node:", clickedNodeId);
          router.push(`/chat?parent=${clickedNodeId}`);
        }
      });

      return () => network.destroy();
    }
  }, [loading, nodes, edges]);

  return (
    <div className="flex-1">
      {loading ? (
        <div className="p-4">Loading graph...</div>
      ) : (
        <div ref={containerRef} className="w-full h-[600px] " />
      )}
    </div>
  );
}
