"use client";
import Globe from "@/components/Globe";

export default function HomePage() {
  return (
    <main className="h-screen w-screen flex items-center justify-center bg-black">
      <div className="w-full h-full max-w-[1024px] max-h-[1024px] aspect-square">
        <Globe />
      </div>
    </main>
  );
}


