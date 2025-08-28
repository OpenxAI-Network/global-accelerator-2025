"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchFromPerplexity } from "@/lib/perplexity";
import ChatBox from "./ChatBox";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Network, X, ArrowUpRight } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
};

export default function ChatThread({ chatId }: { chatId: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get test user ID from environment variable
  const testUserId = process.env.NEXT_PUBLIC_TEST_USER_ID;

  const [showPreview, setShowPreview] = useState(false);

  // Try to read chatId from prop first, then from URL
  const paramChatId = searchParams.get("chatId");
  const effectiveChatId = chatId ?? paramChatId ?? null;

  // Reply context from URL
  const parentIdParam = searchParams.get("parentId");
  const parentTitleParam = searchParams.get("parentTitle");

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [lastNodeId, setLastNodeId] = useState<string | null>(null);
  const [replyingToNode, setReplyingToNode] = useState<string | null>(null);
  const [replyingToTitle, setReplyingToTitle] = useState<string | null>(null);

  // Load messages + last_node_id when effectiveChatId is available
  useEffect(() => {
    if (!effectiveChatId || !testUserId) {
      setMessages([]);
      setLastNodeId(null);
      return;
    }

    const fetchMessagesAndLastNode = async () => {
      try {
        // First verify that the chat belongs to the authenticated user
        const { data: chatOwnerData, error: chatOwnerError } = await supabase
          .from("chats")
          .select("user_id, last_node_id")
          .eq("id", effectiveChatId)
          .single();

        if (chatOwnerError) {
          console.error("Error fetching chat ownership:", chatOwnerError);
          return;
        }

        // Check if the current user owns this chat
        if (chatOwnerData.user_id !== testUserId) {
          console.error("User does not own this chat");
          setMessages([]);
          setLastNodeId(null);
          return;
        }

        // Messages - only fetch if user owns the chat
        const { data: msgData, error: msgError } = await supabase
          .from("messages")
          .select("id, sender, content")
          .eq("chat_id", effectiveChatId)
          .order("created_at", { ascending: true });

        if (msgError) {
          console.error("Error fetching messages:", msgError);
        } else if (msgData) {
          setMessages(msgData as Message[]);
        }

        // Set last node ID
        setLastNodeId(chatOwnerData.last_node_id ?? null);

      } catch (err) {
        console.error("fetchMessagesAndLastNode failed:", err);
      }
    };

    fetchMessagesAndLastNode();
  }, [effectiveChatId, testUserId]);

  // Set reply context from URL params
  useEffect(() => {
    if (parentIdParam) {
      setReplyingToNode(parentIdParam);
      setReplyingToTitle(parentTitleParam ?? null);
    } else {
      // clear if no parent param in URL
      setReplyingToNode(null);
      setReplyingToTitle(null);
    }
  }, [parentIdParam, parentTitleParam]);

  const handleSend = async (text: string) => {
    const cid = effectiveChatId;
    if (!cid || !testUserId) {
      alert("No chat selected or user not authenticated.");
      console.error("handleSend called without effectiveChatId or testUserId");
      return;
    }

    // Verify chat ownership before sending
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("user_id")
      .eq("id", cid)
      .single();

    if (chatError || chatData.user_id !== testUserId) {
      alert("You don't have permission to send messages to this chat.");
      return;
    }

    setLoading(true);

    try {
      const summary = generateSummary(text);

      // Insert user message
      const { data: userMsg, error: userError } = await supabase
        .from("messages")
        .insert([{ chat_id: cid, sender: "user", content: text, summary }])
        .select()
        .single();

      if (userError) throw userError;

      // Get AI response
      const aiResponse = await fetchFromPerplexity(text);
      const aiSummary = generateSummary(aiResponse);

      // Insert AI message
      const { data: aiMsg, error: aiError } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: cid,
            sender: "ai",
            content: aiResponse,
            summary: aiSummary,
          },
        ])
        .select()
        .single();

      if (aiError) throw aiError;

      // Determine parent node (replyingToNode takes precedence)
      const parentId = replyingToNode || lastNodeId || null;

      // Insert new node for the AI answer
      const { data: nodeData, error: nodeError } = await supabase
        .from("nodes")
        .insert([
          {
            chat_id: cid,
            message_id: aiMsg.id,
            title: text,
            answer: aiResponse,
            summary: summary,
          },
        ])
        .select()
        .single();

      if (nodeError) throw nodeError;

      // If parent exists, create edge linking parent -> new node
      if (parentId) {
        const { error: edgeError } = await supabase.from("edges").insert([
          {
            chat_id: cid,
            from_node: parentId,
            to_node: nodeData.id,
          },
        ]);
        if (edgeError) throw edgeError;
      }

      // Persist last_node_id for the chat (so it survives navigation)
      const { error: updateChatError } = await supabase
        .from("chats")
        .update({ last_node_id: nodeData.id })
        .eq("id", cid)
        .eq("user_id", testUserId); // Ensure user owns the chat

      if (updateChatError) {
        console.error("Failed to update chats.last_node_id:", updateChatError);
      }

      // Update local state
      setLastNodeId(nodeData.id);
      setReplyingToNode(null);
      setReplyingToTitle(null);

      // Remove reply params from URL (keeps chatId)
      router.replace(`/chat?chatId=${cid}`);

      // Refresh messages list
      const { data: refreshedMessages, error: refreshErr } = await supabase
        .from("messages")
        .select("id, sender, content")
        .eq("chat_id", cid)
        .order("created_at", { ascending: true });

      if (refreshErr) {
        console.error("Failed to refresh messages:", refreshErr);
      } else if (refreshedMessages) {
        setMessages(refreshedMessages as Message[]);
      }
    } catch (err) {
      console.error("Error in handleSend:", err);
      alert("Error sending message — check console.");
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = (text: string) => {
    return (
      text.split(" ").slice(0, 4).join(" ") +
      (text.split(" ").length > 4 ? "..." : "")
    );
  };

  const handleCancelReply = () => {
    setReplyingToNode(null);
    setReplyingToTitle(null);
    if (effectiveChatId)
      router.replace(`/chat?chatId=${effectiveChatId}`);
  };

  // Show error if test user ID is not configured
  if (!testUserId) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-red-500 mb-2 font-medium">Configuration Error</p>
          <p className="text-slate-600 text-sm">Test user ID not found in .env.local</p>
        </div>
      </div>
    );
  }

  // Empty state when no chat selected
  if (!effectiveChatId) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md px-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            Welcome to LearnTrace
          </h2>
          <p className="text-slate-600 mb-6">
            Select a conversation from the sidebar or create a new one to start your learning journey.
          </p>
          <div className="text-sm text-slate-500">
            💡 Ask questions and visualize your learning path with our interactive knowledge graph
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Messages Area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Network className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">Start the conversation</p>
              <p className="text-sm text-slate-500">Ask your first question to begin learning</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-lg p-4 rounded-2xl shadow-sm ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-md"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                }`}
              >
                <div className="text-sm">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {msg.content.replace(/(\[\d+\])+/g, "")}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Graph Button - Positioned to avoid reply banner */}
      {effectiveChatId && (
        <div
          className={`fixed right-6 transition-all duration-300 ${
            replyingToNode ? "bottom-32" : "bottom-24"
          } flex flex-col items-center z-40`}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          {/* Preview Tooltip */}
          {showPreview && (
            <div className="absolute bottom-16 right-0 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
              View Knowledge Graph
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </div>
          )}

          {/* Graph Button */}
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-2 border-white cursor-pointer"
            onClick={() => router.push(`/graph?chatId=${effectiveChatId}`)}
          >
            <Network className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Reply Banner - Redesigned */}
      {replyingToNode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Extending from: <span className="font-semibold">{replyingToTitle || "Selected Node"}</span>
                </p>
                <p className="text-xs text-amber-600">Your question will branch from this topic</p>
              </div>
            </div>
            <button
              onClick={handleCancelReply}
              className="p-2 hover:bg-amber-100 rounded-full transition-colors text-amber-600 hover:text-amber-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <ChatBox onSend={handleSend} loading={loading} />
    </div>
  );
}
