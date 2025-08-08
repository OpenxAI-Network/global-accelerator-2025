'use client';

import GraphViewer from '@/components/graph/GraphViewer';

export default function GraphPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 bg-gray-800 text-white text-center text-xl font-bold">
        Thinking Tree 🌱
      </header>
      <div className="flex-1">
        <GraphViewer />
      </div>
    </div>
  );
}
