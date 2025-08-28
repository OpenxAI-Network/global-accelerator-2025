"use client";

import { useState } from "react";
import { Share2, Copy, Check, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ShareButtonProps {
  chatId: string;
  isPublic: boolean;
  onShareUpdate: (isPublic: boolean) => void;
}

export default function ShareButton({ chatId, isPublic, onShareUpdate }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const testUserId = process.env.NEXT_PUBLIC_TEST_USER_ID;

  const generateShareLink = (chatId: string) => {
    return `${window.location.origin}/share/${chatId}`;
  };

  const handleShare = async () => {
    if (isPublic) {
      // Already public, just show the link
      setShareLink(generateShareLink(chatId));
      setShowModal(true);
      return;
    }

    // Show confirmation modal first
    setShowModal(true);
  };

  const confirmShare = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("chats")
        .update({ is_public: true })
        .eq("id", chatId)
        .eq("user_id", testUserId);

      if (error) throw error;

      const link = generateShareLink(chatId);
      setShareLink(link);
      onShareUpdate(true);
      
    } catch (err) {
      console.error("Error sharing chat:", err);
      alert("Failed to share chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const unshare = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("chats")
        .update({ is_public: false })
        .eq("id", chatId)
        .eq("user_id", testUserId);

      if (error) throw error;

      onShareUpdate(false);
      setShowModal(false);
      setShareLink("");
      
    } catch (err) {
      console.error("Error unsharing chat:", err);
      alert("Failed to unshare chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isPublic 
            ? "bg-green-100 text-green-700 hover:bg-green-200" 
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
        title={isPublic ? "Already shared - click to view link" : "Share this chat"}
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">{isPublic ? "Shared" : "Share"}</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mt-[650px]">
            <div className="p-6">
              {!isPublic && !shareLink ? (
                // Confirmation step
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Share Chat & Graph</h3>
                  </div>
                  
                  <div className="mb-6 space-y-3">
                    <p className="text-slate-600">
                      Are you sure you want to make this chat public? This will:
                    </p>
                    <ul className="text-sm text-slate-500 space-y-1 ml-4">
                      <li>• Make both the chat conversation and knowledge graph publicly accessible</li>
                      <li>• Allow anyone with the link to view all messages and responses</li>
                      <li>• Create a permanent shareable URL</li>
                    </ul>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-700">
                        <strong>Warning:</strong> Once shared, anyone with the link can access this content.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmShare}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Sharing..." : "Share Chat"}
                    </button>
                  </div>
                </>
              ) : (
                // Share link display
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Share Link</h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1 hover:bg-slate-100 rounded-full"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-slate-600 text-sm mb-3">
                      Anyone with this link can view your chat and knowledge graph:
                    </p>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-slate-200 rounded-md transition-colors"
                        title="Copy link"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={unshare}
                      disabled={loading}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Unsharing..." : "Unshare"}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
