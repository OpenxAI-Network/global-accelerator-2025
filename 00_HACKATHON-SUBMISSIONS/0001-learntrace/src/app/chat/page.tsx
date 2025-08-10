"use client";

import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatThread from "@/components/ChatThread";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <ChatThread chatId={chatId} />
      </div>
    </div>
  );
}

