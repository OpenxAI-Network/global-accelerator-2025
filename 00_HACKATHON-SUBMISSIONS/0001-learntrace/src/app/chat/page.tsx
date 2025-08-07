// src/app/chat/page.tsx
"use client";

import { useState } from "react";
import ChatBox from "@/components/chat/ChatBox";

export default function ChatPage() {
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >([]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: "user" as const, text }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      });

      if (!res.ok) throw new Error("Failed to fetch AI response");

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content || "No response received.";

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error: Could not get a response." },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col">
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
