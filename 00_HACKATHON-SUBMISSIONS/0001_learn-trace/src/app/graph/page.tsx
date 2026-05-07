"use client";

import GraphViewer from "@/components/graph/GraphViewer";
import DotGrid from "@/components/backgrounds/DotGrid/DotGrid";

export default function GraphPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="flex flex-col flex-1 h-full">
        <GraphViewer />
      </div>
    </div>
  );
}
