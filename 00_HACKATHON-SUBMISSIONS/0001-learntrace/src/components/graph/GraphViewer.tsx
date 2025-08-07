"use client";

import { useEffect, useRef } from "react";
import { Node, Edge } from "vis-network";
import { DataSet, Network } from 'vis-network/standalone';

export default function GraphViewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nodes = new DataSet<Node>([
      { id: 1, label: "What is entropy?" },
      { id: 2, label: "Entropy is a measure of randomness" },
      { id: 3, label: "Give an example of entropy" },
    ]);

    const edges = new DataSet<Edge>([
      { from: 1, to: 2 },
      { from: 1, to: 3 },
    ]);

    const network = new Network(
      containerRef.current!,
      { nodes, edges },
      {
        layout: { hierarchical: { direction: "UD", sortMethod: "directed" } },
        nodes: {
          shape: "box",
          color: {
            background: "#fff",
            border: "#000",
          },
          font: { color: "#000" },
        },
        edges: { arrows: "to" },
        interaction: { hover: true },
      }
    );

    network.on("click", (params: any) => {
      const nodeId = params.nodes[0];
      if (nodeId) {
        alert(`You clicked node ${nodeId}`);
      }
    });
  }, []);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
