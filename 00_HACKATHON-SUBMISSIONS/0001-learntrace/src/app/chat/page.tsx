"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatThread from "@/components/ChatThread";
import { supabase } from "@/lib/supabaseClient";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get("chatId"); // make sure param name matches your URL usage

  const [resolvedChatId, setResolvedChatId] = useState<string | null>(chatId);

  useEffect(() => {
    // If no chatId, fetch the newest chat and redirect
    if (!chatId) {
      const fetchNewestChat = async () => {
        const { data, error } = await supabase
          .from("chats")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Failed to fetch newest chat:", error);
          return;
        }
        if (data?.id) {
          setResolvedChatId(data.id);
          router.replace(`/chat?chatId=${data.id}`);
        }
      };
      fetchNewestChat();
    } else {
      setResolvedChatId(chatId);
    }
  }, [chatId, router]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        {resolvedChatId ? (
          <ChatThread chatId={resolvedChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            Loading latest chat...
          </div>
        )}
      </div>
    </div>
  );
}
