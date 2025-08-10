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
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    chatId: string;
  } | null>(null);

  const [collapsed, setCollapsed] = useState(false);

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
      className={`bg-gray-900 text-white flex flex-col relative transition-all duration-300 ease-in-out
      ${collapsed ? "w-16" : "w-64"}`}
      onClick={() => setContextMenu(null)}
    >
      <button
        onClick={handleNewChat}
        className={`p-4 hover:bg-gray-800 border-b border-gray-700
        ${collapsed ? "hidden" : "block"}`}
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
            title={chat.title} // tooltip when collapsed
          >
            {collapsed ? chat.title?.[0] || "U" : chat.title || "Untitled Chat"}
          </div>
        ))}
      </div>

      {contextMenu && !collapsed && (
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

      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 border-t border-gray-700 hover:bg-gray-800 text-sm rounded-xl"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "▶" : "◀"}
      </button>
    </div>
  );
}
