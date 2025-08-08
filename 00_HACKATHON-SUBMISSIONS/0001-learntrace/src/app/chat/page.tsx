'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatBox from '@/components/chat/ChatBox'
import { supabase } from '@/lib/supabaseClient'

import Sidebar from '@/components/Sidebar';

type Message = {
  sender: 'user' | 'ai'
  text: string
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        const parentFromURL = searchParams.get('parent')
        if (parentFromURL) {
          // Coming from a graph click
          setCurrentNodeId(parentFromURL)
        }
        await loadChatHistory(session.user.id)
        setLoading(false)
      }
    }

    checkSession()
  }, [router, searchParams])

  // 🔁 Load last 5 nodes + their messages
  const loadChatHistory = async (userId: string) => {
    const { data: nodes } = await supabase
      .from('nodes')
      .select('id, title, full_content, created_at')
      .order('created_at', { ascending: true })
      .limit(5)

    if (!nodes) return

    let loadedMessages: Message[] = []

    for (const node of nodes) {
      const { data: nodeMessages } = await supabase
        .from('messages')
        .select('content, user_role, created_at')
        .eq('node_id', node.id)
        .order('created_at', { ascending: true })

      if (nodeMessages) {
        nodeMessages.forEach((msg: any) => {
          loadedMessages.push({
            sender: msg.user_role === 'user' ? 'user' : 'ai',
            text: msg.content,
          })
        })
      }

      // If we're not coming from a graph click, use the latest node as fallback
      if (!searchParams.get('parent')) {
        setCurrentNodeId(node.id)
      }
    }

    setMessages(loadedMessages)
  }

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    setMessages(prev => [...prev, { sender: 'user', text }])

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // Step 1: Create new node with parent_id
      const { data: newNode, error: nodeError } = await supabase
        .from('nodes')
        .insert({
          title: text.slice(0, 40),
          full_content: text,
          created_at: new Date().toISOString(),
          parent_id: currentNodeId,
        })
        .select()
        .single()

      if (nodeError || !newNode) throw new Error('Failed to insert node')
      const newNodeId = newNode.id

      // Step 2: Insert user message
      await supabase.from('messages').insert({
        node_id: newNodeId,
        user_role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      })

      // Step 3: Insert edge if parent exists
      if (currentNodeId) {
        await supabase.from('edges').insert({
          from_node: currentNodeId,
          to_node: newNodeId,
          relation_type: 'follow-up',
        })
      }

      // Step 4: Get AI response
      const res = await fetch('/api/perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      })

      if (!res.ok) throw new Error('Failed to fetch AI response')
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'No response received.'

      // Step 5: Insert AI message
      await supabase.from('messages').insert({
        node_id: newNodeId,
        user_role: 'ai',
        content: reply,
        created_at: new Date().toISOString(),
      })

      // Step 6: Update local UI and state
      setMessages(prev => [...prev, { sender: 'ai', text: reply }])
      setCurrentNodeId(newNodeId)
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error: Could not get a response.' }])
    }
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
     <div className="flex">
      <Sidebar currentNodeId={currentNodeId} setCurrentNodeId={setCurrentNodeId} />
      
      <div className="flex-1 min-h-screen bg-[#f5f7fb] flex flex-col">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-xl px-4 py-2 rounded-lg text-white ${
                msg.sender === 'user'
                  ? 'bg-blue-600 self-end ml-auto'
                  : 'bg-green-600 self-start mr-auto'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <ChatBox onSend={handleSend} isEmpty={messages.length === 0} />
      </div>
    </div>
  )
}
