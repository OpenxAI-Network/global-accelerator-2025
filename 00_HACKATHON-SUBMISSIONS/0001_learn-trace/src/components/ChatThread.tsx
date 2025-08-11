"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchFromPerplexity } from "@/lib/perplexity";
import ChatBox from "./ChatBox";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { GitGraph, LineChart } from "lucide-react";
import { ChartLine } from "lucide-react";
import { ChartNetwork } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
};

export default function ChatThread({ chatId }: { chatId: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();

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
    if (!effectiveChatId) {
      setMessages([]);
      setLastNodeId(null);
      return;
    }

    const fetchMessagesAndLastNode = async () => {
      try {
        // Messages
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

        // Last node for this chat
        const { data: chatData, error: chatError } = await supabase
          .from("chats")
          .select("last_node_id")
          .eq("id", effectiveChatId)
          .single();

        if (chatError && chatError.code !== "PGRST116") {
          // ignore if no row found; otherwise log
          console.error("Error fetching chat meta:", chatError);
        } else if (chatData) {
          setLastNodeId(chatData.last_node_id ?? null);
        }
      } catch (err) {
        console.error("fetchMessagesAndLastNode failed:", err);
      }
    };

    fetchMessagesAndLastNode();
  }, [effectiveChatId]);

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
    if (!cid) {
      alert("No chat selected. Make sure the URL contains a chatId.");
      console.error("handleSend called without effectiveChatId");
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
        .eq("id", cid);

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-lg ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-black self-start mr-auto"
            }`}
          >
            <ReactMarkdown>
              {msg.content.replace(/(\[\d+\])+/g, "")}
            </ReactMarkdown>
          </div>
        ))}

        {effectiveChatId && (
          <div
            className="fixed bottom-25 right-6 flex flex-col items-center"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
          >
            {/* Button */}
            <button
              className="bg-blue-600 text-white h-16 w-16 rounded-full shadow-lg hover:bg-blue-700 transition-all cursor-pointer border border-black flex items-center justify-center"
              onClick={() => router.push(`/graph?chatId=${effectiveChatId}`)}
            >
              <ChartNetwork className="w-8 h-8" />
            </button>

            {/* Preview Popup */}
            {showPreview && (
              <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg border border-gray-300 p-2 w-15 h-10 z-50">
                {/* You can replace with actual GraphViewer mini version */}
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Graph</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reply banner */}
      {replyingToNode && (
        <div className="bg-gray-200 px-4 py-2 border-t border-gray-300 text-black text-sm flex justify-between items-center">
          <div>
            Extending to : <strong>{replyingToTitle || "Selected Node"}</strong>
          </div>
          <div>
            <button
              className="text-sm text-red-600 mr-4"
              onClick={() => {
                setReplyingToNode(null);
                setReplyingToTitle(null);
                if (effectiveChatId)
                  router.replace(`/chat?chatId=${effectiveChatId}`);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ChatBox onSend={handleSend} loading={loading} />
    </div>
  );
}
