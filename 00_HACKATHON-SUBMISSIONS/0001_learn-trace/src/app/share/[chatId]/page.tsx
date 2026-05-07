import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import PublicChatView from "@/components/PublicChatView";

interface SharePageProps {
  params: { chatId: string };
}

export default async function SharePage({ params }: SharePageProps) {
  const { chatId } = params;

  const { data: chatData, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("is_public", true)
    .single();

  if (error || !chatData) {
    notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  return (
    <PublicChatView
      chat={chatData}
      messages={messages || []}
    />
  );
}
