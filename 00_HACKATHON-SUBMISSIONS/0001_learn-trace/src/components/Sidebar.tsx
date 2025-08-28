"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, MessageCircle, User, Settings, Menu, MoreHorizontal } from "lucide-react";

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
      router.push(`/chat?chatId=${data.id}`);
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
      .eq("user_id", testUserId);

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
      .eq("user_id", testUserId);

    if (!error) {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      router.push(`/chat`);
    } else {
      console.error("Error deleting chat:", error);
    }
    setContextMenu(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Show error if test user ID is not configured
  if (!testUserId) {
    return (
      <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-slate-50 flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${collapsed ? "w-14" : "w-72"}`}>
        <div className={`p-3 text-center ${collapsed ? "hidden" : "block"}`}>
          <p className="text-xs text-red-400 mb-3">Configuration Error</p>
          <p className="text-xs text-slate-400">Test user ID not found in .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-50 flex flex-col relative transition-all duration-300 ease-in-out shadow-2xl border-r border-slate-700 ${collapsed ? "w-14" : "w-72"}`}
      onClick={() => setContextMenu(null)}
    >
      {/* Header with Logo and Menu Toggle */}
      <div className={`p-4 border-b border-slate-700 ${collapsed ? "p-3" : ""}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">L</span>
              </div>
              <h1 className="text-lg font-semibold text-slate-50">
                LearnTrace
              </h1>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-50"
              title="Collapse sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-7 h-7 bg-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">L</span>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-50"
              title="Expand sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className={`p-3 ${collapsed ? "p-1.5" : ""}`}>
        <button
          onClick={handleNewChat}
          className={`w-full bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md ${collapsed ? "p-2.5" : "p-3"}`}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="font-medium text-sm">New Chat</span>}
        </button>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5">
        {chats.length === 0 && !collapsed ? (
          <div className="p-5 text-center text-slate-400 text-xs">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="mb-1">No conversations yet</p>
            <p className="text-xs opacity-75">Start your first chat to begin learning!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/chat?chatId=${chat.id}`)}
              onContextMenu={(e) => {
                if (collapsed) return;
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, chatId: chat.id });
              }}
              className={`relative group cursor-pointer rounded-lg transition-all duration-200 hover:bg-slate-700/30 ${collapsed ? "p-2.5 flex justify-center" : "p-3"}`}
              title={collapsed ? chat.title : ""}
            >
              {collapsed ? (
                <MessageCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-50" />
              ) : (
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-50 truncate group-hover:text-indigo-300 transition-colors text-sm">
                      {chat.title || "Untitled Chat"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(chat.created_at)}
                    </p>
                  </div>
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && !collapsed && (
        <div
          className="fixed bg-white text-gray-800 rounded-lg shadow-2xl z-50 border border-gray-200 overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => handleRename(contextMenu.chatId)}
            className="block w-full px-3 py-2.5 hover:bg-gray-50 text-left text-sm font-medium transition-colors"
          >
            Rename Chat
          </button>
          <button
            onClick={() => handleDelete(contextMenu.chatId)}
            className="block w-full px-3 py-2.5 hover:bg-red-50 hover:text-red-600 text-left text-sm font-medium transition-colors border-t border-gray-100"
          >
            Delete Chat
          </button>
        </div>
      )}

      {/* Profile Section (Bottom) */}
      <div className={`border-t border-slate-700 ${collapsed ? "p-1.5" : "p-3"}`}>
        {collapsed ? (
          <div className="space-y-2">
            <button 
              className="w-full flex justify-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Profile"
            >
              <User className="w-4 h-4 text-slate-400 hover:text-slate-50" />
            </button>
            <button 
              className="w-full flex justify-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-slate-50" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Profile Info */}
            <div className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/30 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-50 text-sm">Test User</p>
                <p className="text-xs text-slate-400 truncate">test@learntrace.com</p>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center justify-center">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-50">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
