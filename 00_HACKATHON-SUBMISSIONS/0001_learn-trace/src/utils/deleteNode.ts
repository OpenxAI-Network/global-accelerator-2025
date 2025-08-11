// utils/deleteNode.ts
import { supabase } from "@/lib/supabaseClient";

export async function deleteNodeAndMessage(nodeId: string) {
  // 1. Get the node and its answer's message_id + chat_id
  const { data: nodeData, error: fetchErr } = await supabase
    .from("nodes")
    .select("message_id, chat_id")
    .eq("id", nodeId)
    .single();

  if (fetchErr || !nodeData) {
    console.error("Error fetching node:", fetchErr);
    return fetchErr || new Error("Node not found");
  }

  let messageIdsToDelete: string[] = [];

  // Add AI's answer message
  if (nodeData.message_id) {
    messageIdsToDelete.push(nodeData.message_id);

    // 2. Find the user's question before this AI answer in same chat
if (nodeData.message_id) {
  const { data: msgData, error: msgFetchErr } = await supabase
    .from("messages")
    .select("created_at")
    .eq("id", nodeData.message_id)
    .single();

  if (!msgFetchErr && msgData) {
    const { data: prevMsg, error: prevErr } = await supabase
      .from("messages")
      .select("id")
      .eq("chat_id", nodeData.chat_id)
      .lt("created_at", msgData.created_at)
      .order("created_at", { ascending: false })
      .limit(1);

    if (prevErr) {
      console.error("Error finding question message:", prevErr);
    } else if (prevMsg?.length) {
      messageIdsToDelete.push(prevMsg[0].id);
    }
  }
}

  // 3. Delete messages (both question and answer if found)
  if (messageIdsToDelete.length > 0) {
    const { error: msgErr } = await supabase
      .from("messages")
      .delete()
      .in("id", messageIdsToDelete);
    if (msgErr) {
      console.error("Error deleting messages:", msgErr);
      return msgErr;
    }
  }

  // 4. Delete edges linked to this node
  const { error: edgeErr } = await supabase
    .from("edges")
    .delete()
    .or(`from_node.eq.${nodeId},to_node.eq.${nodeId}`);
  if (edgeErr) {
    console.error("Error deleting edges:", edgeErr);
    return edgeErr;
  }

  // 5. Delete the node
  const { error: nodeErr } = await supabase
    .from("nodes")
    .delete()
    .eq("id", nodeId);
  if (nodeErr) {
    console.error("Error deleting node:", nodeErr);
    return nodeErr;
  }

  return null; // success
}
}