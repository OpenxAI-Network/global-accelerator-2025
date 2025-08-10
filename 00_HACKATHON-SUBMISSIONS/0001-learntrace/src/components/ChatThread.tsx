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

  const [lastNodeId, setLastNodeId] = useState<string | null>(null);
  const [replyingToNode, setReplyingToNode] = useState<string | null>(null);

  const router = useRouter();

  // Load messages + lastNodeId from DB
  useEffect(() => {
    if (!chatId) return;
    const fetchMessagesAndLastNode = async () => {
      // Fetch messages
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("id, sender, content")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (!msgError && msgData) {
        setMessages(msgData as Message[]);
      }

      // Fetch lastNodeId
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("last_node_id")
        .eq("id", chatId)
        .single();

      if (!chatError && chatData) {
        setLastNodeId(chatData.last_node_id || null);
      }
    };
    fetchMessagesAndLastNode();
  }, [chatId]);

  const handleSend = async (text: string) => {
    if (!chatId) return;
    setLoading(true);

    try {
      const summary = generateSummary(text);

      // Insert user message
      const { data: userMsg, error: userError } = await supabase
        .from("messages")
        .insert([{ chat_id: chatId, sender: "user", content: text, summary }])
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
            chat_id: chatId,
            sender: "ai",
            content: aiResponse,
            summary: aiSummary,
          },
        ])
        .select()
        .single();

      if (aiError) throw aiError;

      // Determine parent node
      const parentId = replyingToNode || lastNodeId || null;

      // Insert node (answer node)
      const { data: nodeData, error: nodeError } = await supabase
        .from("nodes")
        .insert([
          {
            chat_id: chatId,
            message_id: aiMsg.id,
            title: summary,
            answer: aiResponse,
          },
        ])
        .select()
        .single();

      if (nodeError) throw nodeError;

      // If there’s a parent, also create an edge
      if (parentId) {
        const { error: edgeError } = await supabase.from("edges").insert([
          {
            chat_id: chatId,
            from_node: parentId,
            to_node: nodeData.id,
          },
        ]);
        if (edgeError) throw edgeError;
      }

      // Update last_node_id in DB so it's persistent
      await supabase
        .from("chats")
        .update({ last_node_id: nodeData.id })
        .eq("id", chatId);

      // Update local state
      setLastNodeId(nodeData.id);
      setReplyingToNode(null);

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
