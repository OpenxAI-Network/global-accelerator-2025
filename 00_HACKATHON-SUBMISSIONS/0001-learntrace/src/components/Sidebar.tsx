"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Chat = {
  id: string;
  title: string;
};

export default function Sidebar() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setChats(data);
      }
    };

    fetchChats();

    // ✅ Subscribe to chats table updates
    const channel = supabase
      .channel("chats-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats" },
        (payload) => {
          console.log("Chat table change:", payload);
          fetchChats(); // refresh on any insert/update/delete
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNewChat = async () => {
    const { data, error } = await supabase
      .from("chats")
      .insert([{ title: "New Chat" }])
      .select()
      .single();

    if (!error && data) {
      router.push(`/chat?id=${data.id}`);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <button
        onClick={handleNewChat}
        className="p-4 hover:bg-gray-800 border-b border-gray-700"
      >
        + New Chat
      </button>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => router.push(`/chat?id=${chat.id}`)}
            className="p-3 cursor-pointer hover:bg-gray-800"
          >
            {chat.title || "Untitled Chat"}
          </div>
        ))}
      </div>
    </div>
  );
}
