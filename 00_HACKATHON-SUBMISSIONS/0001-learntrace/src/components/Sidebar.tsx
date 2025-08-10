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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chatId: string } | null>(null);

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
  }, []);

  const handleNewChat = async () => {
    const { data, error } = await supabase
      .from("chats")
      .insert([{ title: "New Chat" }])
      .select()
      .single();

    if (!error && data) {
      setChats((prev) => [data, ...prev]);
      router.push(`/chat?id=${data.id}`);
    }
  };

  const handleRename = async (chatId: string) => {
    const newTitle = prompt("Enter new chat title:");
    if (!newTitle) return;

    const { error } = await supabase
      .from("chats")
      .update({ title: newTitle })
      .eq("id", chatId);

    if (!error) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      );
    }
    setContextMenu(null);
  };

  const handleDelete = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;

    const { error } = await supabase.from("chats").delete().eq("id", chatId);
    if (!error) {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      router.push(`/chat`);
    }
    setContextMenu(null);
  };

  return (
    <div
      className="w-64 bg-gray-900 text-white flex flex-col relative"
      onClick={() => setContextMenu(null)}
    >
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
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, chatId: chat.id });
            }}
            className="p-3 cursor-pointer hover:bg-gray-800 truncate"
          >
            {chat.title || "Untitled Chat"}
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="absolute bg-white text-black rounded shadow-lg z-50 cursor-pointer"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => handleRename(contextMenu.chatId)}
            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
          >
            Rename
          </button>
          <button
            onClick={() => handleDelete(contextMenu.chatId)}
            className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
