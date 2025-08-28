"use client";

import { useState } from "react";
import { Send, Loader } from "lucide-react";

export default function ChatBox({ onSend, loading }: { onSend: (message: string) => void; loading: boolean }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 pr-12 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            {input.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                {input.length}/1000
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`p-3 rounded-xl text-white transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center min-w-[48px] ${
              loading || !input.trim() 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
