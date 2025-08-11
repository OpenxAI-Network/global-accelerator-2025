"use client";
import React, { useEffect, useRef } from "react";
import { Network, Options } from "vis-network/standalone";

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = [
      {
        id: 1,
        label: "what is machine learning",
        x: 0,
        y: 0,
        fixed: true,
        color: "#4F46E5",
        font: { color: "#fff" },
      },
      {
        id: 2,
        label: "why machine learning is...",
        x: -200,
        y: 150,
        fixed: true,
        color: "#6366F1",
        font: { color: "#fff" },
      },
      {
        id: 3,
        label: "what are types of...",
        x: -200,
        y: 300,
        fixed: true,
        color: "#6366F1",
        font: { color: "#fff" },
      },
      {
        id: 4,
        label: "explain supervised machine learning",
        x: -400,
        y: 450,
        fixed: true,
        color: "#8B5CF6",
        font: { color: "#fff" },
      },
      {
        id: 5,
        label: "explain unsupervised machine learning",
        x: 0,
        y: 450,
        fixed: true,
        color: "#8B5CF6",
        font: { color: "#fff" },
      },
      {
        id: 6,
        label: "significance of machine learning",
        x: 250,
        y: 150,
        fixed: true,
        color: "#8B5CF6",
        font: { color: "#fff" },
      },
    ];

    const edges = [
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
      { from: 1, to: 6 },
    ];

    const options: Options = {
      physics: false,
      layout: {
        hierarchical: {
          enabled: true,
          direction: "UD",
          sortMethod: "directed",
          levelSeparation: 200,
          nodeSpacing: 300,
        },
      },
      interaction: {
        dragNodes: false,
        zoomView: false,
        dragView: false,
      },
      edges: {
        color: "#8B5CF6",
        smooth: {
          enabled: true,
          type: "continuous",
          roundness: 0.5, // required by the type
        },
      },
      nodes: {
        shape: "box",
        borderWidth: 0,
        font: { size: 14, face: "Arial" },
        margin: { top: 10, bottom: 10, right: 10, left: 10 },
      },
    };

    const network = new Network(
      containerRef.current!,
      { nodes, edges },
      options
    );

    return () => network.destroy();
  }, []);

  return (
    <section className="bg-[#0B1623] py-16 px-6">
      <h2 className="text-3xl font-bold text-center text-white mb-6">
      </h2>
      <div
        ref={containerRef}
        className="mx-auto"
        style={{ height: "500px", width: "100%" }}
      />
    </section>
  );
}
