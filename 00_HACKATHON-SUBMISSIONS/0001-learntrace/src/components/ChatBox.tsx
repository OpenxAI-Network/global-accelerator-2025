"use client";

import { useState } from "react";

export default function ChatBox({ onSend, loading }: { onSend: (message: string) => void; loading: boolean }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="p-4 flex text-black items-center space-x-2 border-t border-gray-300">
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 border rounded-lg px-4 py-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={loading}
      />
      <button
        onClick={handleSend}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white ${
          loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
}
