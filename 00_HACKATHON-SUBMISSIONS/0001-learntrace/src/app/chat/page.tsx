"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatThread from "@/components/ChatThread";
import { supabase } from "@/lib/supabaseClient";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // accept both `chatId` and legacy `id` so sidebar/url variations work
  const paramId = searchParams.get("chatId") ?? searchParams.get("id") ?? null;

  const firstLoad = useRef(true);
  const [resolvedChatId, setResolvedChatId] = useState<string | null>(paramId);

  // Update resolvedChatId whenever the URL search param changes (clicking sidebar)
  useEffect(() => {
    if (paramId) {
      firstLoad.current = false; // user explicitly selected a chat
      setResolvedChatId(paramId);
    }
  }, [paramId]);

  // On first mount only: if there's no chatId in the URL, fetch newest chat and redirect once.
  useEffect(() => {
    const fetchNewestAndRedirectIfNeeded = async () => {
      if (!firstLoad.current) return;
      firstLoad.current = false;

      // If a param appeared already, prefer that and bail out.
      const nowParam = searchParams.get("chatId") ?? searchParams.get("id");
      if (nowParam) {
        setResolvedChatId(nowParam);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("chats")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Failed to fetch newest chat:", error);
          return;
        }
        const newestId = data?.id;
        if (!newestId) return;

        // Check again just before redirecting (user might have clicked something meanwhile)
        const beforeRedirect = searchParams.get("chatId") ?? searchParams.get("id");
        if (beforeRedirect) {
          setResolvedChatId(beforeRedirect);
          return;
        }

        setResolvedChatId(newestId);
        // Use replace so user Back button doesn't go back to the empty /chat route
        router.replace(`/chat?chatId=${newestId}`);
      } catch (err) {
        console.error("Error while selecting newest chat:", err);
      }
    };

    fetchNewestAndRedirectIfNeeded();
    // Intentionally empty deps: run only on mount. searchParams is read inside the fn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        {resolvedChatId ? (
          <ChatThread chatId={resolvedChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            Loading latest chat...
          </div>
        )}
      </div>
    </div>
  );
}
