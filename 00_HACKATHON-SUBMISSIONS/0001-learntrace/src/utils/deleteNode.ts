// utils/deleteNode.ts
import { supabase } from '@/lib/supabaseClient'

export async function deleteNodeById(nodeId: string) {
  // Delete messages
  await supabase.from('messages').delete().eq('node_id', nodeId)

  // Delete edges where this node is involved
  await supabase.from('edges').delete().or(`from_node.eq.${nodeId},to_node.eq.${nodeId}`)

  // Delete the node
  const { error } = await supabase.from('nodes').delete().eq('id', nodeId)
  return error
}
