"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchFromPerplexity } from "@/lib/perplexity";
import ChatBox from "./ChatBox";

type Message = {
  id: string;
  sender: "user" | "ai";
  content: string;
};

export default function ChatThread({ chatId }: { chatId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

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
      // Insert user message
      const { error: userError } = await supabase
        .from("messages")
        .insert([{ chat_id: chatId, sender: "user", content: text, summary: generateSummary(text) }]);

      if (userError) throw userError;

      // Get AI response
      const aiResponse = await fetchFromPerplexity(text);

      // Insert AI message
      const { error: aiError } = await supabase
        .from("messages")
        .insert([{ chat_id: chatId, sender: "ai", content: aiResponse, summary: generateSummary(aiResponse) }]);

      if (aiError) throw aiError;

      // Refresh messages
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

  const generateSummary = (text: string) => {
    return text.split(" ").slice(0, 4).join(" ") + (text.split(" ").length > 4 ? "..." : "");
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
            className="fixed bottom-[100px] right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
            onClick={() => alert("Graph view coming soon!")}
          >
            View Graph
          </button>
        )}
      </div>
      <ChatBox onSend={handleSend} loading={loading} />
    </div>
  );
}
