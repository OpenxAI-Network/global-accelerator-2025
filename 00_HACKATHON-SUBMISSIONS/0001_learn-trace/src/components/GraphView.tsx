"use client";
import React, { useEffect, useRef } from "react";
import { Network, DataSet, Options } from "vis-network/standalone";

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = new DataSet([
      {
        id: 1,
        label: "what is machine learning",
        title: "what is machine learning",
      },
      {
        id: 2,
        label: "why machine learning is...",
        title: "why machine learning is...",
      },
      {
        id: 3,
        label: "what are types of...",
        title: "what are types of...",
      },
      {
        id: 4,
        label: "explain supervised machine learning",
        title: "explain supervised machine learning",
      },
      {
        id: 5,
        label: "explain unsupervised machine learning",
        title: "explain unsupervised machine learning",
      },
      {
        id: 6,
        label: "significance of machine learning",
        title: "significance of machine learning",
      },
    ]);

    const edges = new DataSet([
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
      { from: 1, to: 6 },
    ]);

    const options: Options = {
      physics: false, // keep static
      layout: {
        hierarchical: {
          enabled: true,
          direction: "UD", // top to bottom
          sortMethod: "directed",
          levelSeparation: 220,
          nodeSpacing: 300,
        },
      },
      interaction: {
        dragNodes: false,
        zoomView: false,
        dragView: false,
        hover: true,
      },
      nodes: {
        shape: "dot",
        size: 14,
        font: {
          color: "#0f0000ff",
          size: 14,
          align: "bottom",
          vadjust: 20, // moves label below node
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
          },
        },
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
      <h2 className="text-4xl font-bold text-gray-200 text-center mb-6">
        Mind Map
      </h2>
      <div
        ref={containerRef}
        className="mx-auto"
        style={{ height: "500px", width: "100%" }}
      />
    </section>
  );
}
