"use client";

import { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import { supabase } from "@/lib/supabaseClient";

type Message = {
  sender: "user" | "ai";
  text: string;
};

type Props = {
  currentNodeId: string | null;
  setCurrentNodeId: (id: string) => void;
  chatId: string | null; 
};
export default function ChatThread({ currentNodeId, setCurrentNodeId,chatId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
  const loadMessagesFromPath = async () => {
    if (!currentNodeId) return

    let pathNodeIds: string[] = []

    // Step 1: Walk UP to find root
    let currentId = currentNodeId
    while (currentId) {
      pathNodeIds.unshift(currentId)
      const { data: node } = await supabase
        .from('nodes')
        .select('parent_id')
        .eq('id', currentId)
        .single()
      if (!node?.parent_id) break
      currentId = node.parent_id
    }

    // Step 2: Walk DOWN using edges (if you want strict path from root to current)
    let fullPath = [pathNodeIds[0]]
    for (let i = 0; i < pathNodeIds.length - 1; i++) {
      const from = pathNodeIds[i]
      const to = pathNodeIds[i + 1]
      const { data: edge } = await supabase
        .from('edges')
        .select('*')
        .eq('from_node', from)
        .eq('to_node', to)
      if (!edge?.length) break
      fullPath.push(to)
    }

    // Step 3: Fetch messages from nodes in path
    let loaded: Message[] = []

    for (const nodeId of fullPath) {
      const { data: msgs } = await supabase
        .from('messages')
        .select('content, user_role, created_at')
        .eq('node_id', nodeId)
        .order('created_at', { ascending: true })

      if (msgs) {
        loaded.push(
          ...msgs.map(msg => ({
            sender: msg.user_role === 'user' ? 'user' : 'ai',
            text: msg.content,
          }as Message))
        )
      }
    }

    setMessages(loaded)
  }

  loadMessagesFromPath()
}, [currentNodeId])


  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: newNode, error: nodeError } = await supabase
        .from("nodes")
        .insert({
          title: text.slice(0, 40),
          full_content: text,
          created_at: new Date().toISOString(),
          parent_id: currentNodeId,
        })
        .select()
        .single();

      if (nodeError || !newNode) throw new Error("Failed to insert node");
      const newNodeId = newNode.id;

      await supabase.from("messages").insert({
        node_id: newNodeId,
        user_role: "user",
        content: text,
        created_at: new Date().toISOString(),
      });

      if (currentNodeId) {
        await supabase.from("edges").insert({
          from_node: currentNodeId,
          to_node: newNodeId,
          relation_type: "follow-up",
        });
      }

      const res = await fetch("/api/perplexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!res.ok) throw new Error("Failed to fetch AI response");
      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content || "No response received.";

      await supabase.from("messages").insert({
        node_id: newNodeId,
        user_role: "ai",
        content: reply,
        created_at: new Date().toISOString(),
      });

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setCurrentNodeId(newNodeId);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error: Could not get a response." },
      ]);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#f5f7fb] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xl px-4 py-2 rounded-lg text-white ${
              msg.sender === "user"
                ? "bg-blue-600 self-end ml-auto"
                : "bg-green-600 self-start mr-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <ChatBox onSend={handleSend} isEmpty={messages.length === 0} />
    </div>
  );
}
