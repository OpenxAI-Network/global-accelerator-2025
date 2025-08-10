"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchFromPerplexity } from "@/lib/perplexity";
import ChatBox from "./ChatBox";
import { useRouter, useSearchParams } from "next/navigation";

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
};

export default function ChatThread({ chatId }: { chatId: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();

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
            title: summary,
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
            {msg.content}
          </div>
        ))}

        {effectiveChatId && (
          <button
            className="fixed bottom-[100px] right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer"
            onClick={() => router.push(`/graph?chatId=${effectiveChatId}`)}
          >
            View Graph
          </button>
        )}
      </div>

      {/* Reply banner */}
      {replyingToNode && (
        <div className="bg-yellow-100 px-4 py-2 border-t border-yellow-300 text-sm flex justify-between items-center">
          <div>
            Replying to: <strong>{replyingToTitle || "Selected Node"}</strong>
          </div>
          <div>
            <button
              className="text-sm text-red-600 mr-4"
              onClick={() => {
                // clear reply state and remove parent params from URL
                setReplyingToNode(null);
                setReplyingToTitle(null);
                if (effectiveChatId) router.replace(`/chat?chatId=${effectiveChatId}`);
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
