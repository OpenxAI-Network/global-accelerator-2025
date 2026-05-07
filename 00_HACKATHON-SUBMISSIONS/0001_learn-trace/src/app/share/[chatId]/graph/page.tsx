import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import PublicGraphViewer from "@/components/PublicGraphViewer";

interface ShareGraphPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ShareGraphPage({ params }: ShareGraphPageProps) {
  const { chatId } = await params;

  const { data: chatData, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("is_public", true)
    .single();

  if (error || !chatData) {
    notFound();
  }

  return <PublicGraphViewer chatId={chatId} chatData={chatData} />;
}
