"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchFromPerplexity } from "@/lib/perplexity";
import ChatBox from "./ChatBox";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
};

export default function ChatThread({ chatId }: { chatId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  // Load messages
  useEffect(() => {
    if (!chatId) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender, content")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      }
    };
    fetchMessages();
  }, [chatId]);

  // Send message and get AI response
  const handleSend = async (text: string) => {
    if (!chatId) return;
    setLoading(true);

    try {
      // 1️⃣ Insert user message
      const userSummary = generateSummary(text);
      const { data: userMsgData, error: userError } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: chatId,
            sender: "user",
            content: text,
            summary: userSummary,
          },
        ])
        .select("id");

      if (userError) throw userError;
      const userMessageId = userMsgData?.[0]?.id;

      // 2️⃣ Find last node in this chat to link as parent
      const { data: lastNode } = await supabase
        .from("nodes")
        .select("id")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(1);

      const parentId = lastNode?.[0]?.id || null;

      // 3️⃣ Insert node for user message
      const { error: userNodeError } = await supabase.from("nodes").insert([
        {
          chat_id: chatId,
          message_id: userMessageId,
          parent_id: parentId,
          summary: userSummary,
          title: text,
          label: userSummary, // keep label same as summary
        },
      ]);

      if (userNodeError) throw userNodeError;

      // 4️⃣ Get AI response
      const aiResponse = await fetchFromPerplexity(text);
      const aiSummary = generateSummary(aiResponse);

      const { data: aiMsgData, error: aiError } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: chatId,
            sender: "ai",
            content: aiResponse,
            summary: aiSummary,
          },
        ])
        .select("id");

      if (aiError) throw aiError;
      const aiMessageId = aiMsgData?.[0]?.id;

      // 5️⃣ Insert node for AI message (child of user's node)
      const { error: aiNodeError } = await supabase.from("nodes").insert([
        {
          chat_id: chatId,
          message_id: aiMessageId,
          parent_id: userMessageId
            ? await getNodeIdByMessageId(userMessageId)
            : null,
          summary: aiSummary,
          title: aiResponse,
          label: aiSummary,
        },
      ]);

      if (aiNodeError) throw aiNodeError;

      // 6️⃣ Refresh messages
      const { data } = await supabase
        .from("messages")
        .select("id, sender, content")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      setMessages(data as Message[]);
    } catch (err) {
      console.error("Error in handleSend:", err);
      alert("Error sending message. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get node ID from message ID
  async function getNodeIdByMessageId(messageId: string) {
    const { data, error } = await supabase
      .from("nodes")
      .select("id")
      .eq("message_id", messageId)
      .single();

    if (error) {
      console.error("Error fetching node for message:", error);
      return null;
    }
    return data?.id || null;
  }

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
        {chatId && (
          <button
            className="fixed bottom-[100px] right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer"
            onClick={() => router.push(`/graph?chatId=${chatId}`)}
          >
            View Graph
          </button>
        )}
      </div>
      <ChatBox onSend={handleSend} loading={loading} />
    </div>
  );
}
