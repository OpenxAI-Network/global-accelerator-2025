"use client";

import { Network, Calendar, User, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface PublicChatViewProps {
  chat: Chat;
  messages: Message[];
}

export default function PublicChatView({ chat, messages }: PublicChatViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">LearnTrace</h1>
              <p className="text-sm text-slate-500">Shared Knowledge Graph</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">{chat.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(chat.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Shared publicly</span>
              </div>
            </div>
          </div>
          
          <Link
            href={`/share/${chat.id}/graph`}
            className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Network className="w-4 h-4" />
            <span>View Knowledge Graph</span>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-md"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm"
              }`}
            >
              <ReactMarkdown 
                // className="prose prose-sm max-w-none"
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
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-12 py-8 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto text-center text-slate-500">
          <p>Powered by <strong className="text-indigo-600">LearnTrace</strong> - AI-powered learning visualization</p>
        </div>
      </div>
    </div>
  );
}
