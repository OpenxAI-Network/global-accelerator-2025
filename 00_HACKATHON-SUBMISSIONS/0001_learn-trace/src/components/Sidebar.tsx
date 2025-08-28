"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Chat = {
  id: string;
  title: string;
  created_at: string;
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

  // Get test user ID from environment variable
  const testUserId = process.env.NEXT_PUBLIC_TEST_USER_ID;

  useEffect(() => {
    const fetchChats = async () => {
      if (!testUserId) {
        console.error("Test user ID not found in environment variables");
        return;
      }

      const { data, error } = await supabase
        .from("chats")
        .select("id, title, created_at")
        .eq("user_id", testUserId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setChats(data);
      } else if (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [testUserId]);

  const handleNewChat = async () => {
    if (!testUserId) {
      console.error("Test user ID not found");
      return;
    }

    const { data, error } = await supabase
      .from("chats")
      .insert([{ 
        title: "New Chat",
        user_id: testUserId,
        is_public: false
      }])
      .select("id, title, created_at")
      .single();

    if (!error && data) {
      setChats((prev) => [data, ...prev]);
      router.push(`/chat?id=${data.id}`);
    } else if (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleRename = async (chatId: string) => {
    if (!testUserId) return;

    const newTitle = prompt("Enter new chat title:");
    if (!newTitle) return;

    const { error } = await supabase
      .from("chats")
      .update({ title: newTitle })
      .eq("id", chatId)
      .eq("user_id", testUserId); // Ensure user owns the chat

    if (!error) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      );
    } else {
      console.error("Error renaming chat:", error);
    }
    setContextMenu(null);
  };

  const handleDelete = async (chatId: string) => {
    if (!testUserId) return;
    if (!confirm("Are you sure you want to delete this chat?")) return;

    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", chatId)
      .eq("user_id", testUserId); // Ensure user owns the chat

    if (!error) {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      router.push(`/chat`);
    } else {
      console.error("Error deleting chat:", error);
    }
    setContextMenu(null);
  };

  // Show error if test user ID is not configured
  if (!testUserId) {
    return (
      <div className={`bg-[#0B1623] text-white flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-64"}`}>
        <div className={`p-4 text-center ${collapsed ? "hidden" : "block"}`}>
          <p className="text-sm text-red-400 mb-2">Configuration Error</p>
          <p className="text-xs text-gray-400">Test user ID not found in .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0B1623] text-white flex flex-col relative transition-all duration-300 ease-in-out
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
        {chats.length === 0 && !collapsed ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No chats yet. Create your first chat!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/chat?id=${chat.id}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, chatId: chat.id });
              }}
              className="p-3 cursor-pointer hover:bg-gray-800 truncate rounded-xl m-2"
              title={chat.title} // tooltip when collapsed
            >
              {collapsed ? "" : chat.title || "Untitled Chat"}
            </div>
          ))
        )}
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
