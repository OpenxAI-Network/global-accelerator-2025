"use client";

import GraphViewer from "@/components/graph/GraphViewer";
import DotGrid from "@/components/backgrounds/DotGrid/DotGrid";

export default function GraphPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 broder-black">
        <GraphViewer/>
      </div>
    </div>
  );
}
