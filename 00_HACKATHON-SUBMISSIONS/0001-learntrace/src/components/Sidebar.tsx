'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type ChatNode = {
  id: string
  title: string
  created_at: string
}

export default function Sidebar({
  currentNodeId,
  setCurrentNodeId,
}: {
  currentNodeId: string | null
  setCurrentNodeId: (id: string | null) => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [chats, setChats] = useState<ChatNode[]>([])

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('nodes')
      .select('id, title, created_at')
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading chats:', error)
    } else {
      setChats(data || [])
    }
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentNodeId(chatId)
    // Always include ?parent= to reload correct chat
    router.push(`/chat?parent=${chatId}`)
  }

  const handleNewChat = async () => {
    const { data: newChat, error } = await supabase
      .from('nodes')
      .insert({
        title: 'New Chat',
        full_content: '',
        created_at: new Date().toISOString(),
        parent_id: null,
      })
      .select()
      .single()

    if (error || !newChat) {
      console.error('Failed to create new chat:', error)
      return
    }

    setCurrentNodeId(newChat.id)
    setChats(prev => [newChat, ...prev])
    router.push(`/chat?parent=${newChat.id}`)
  }

  return (
    <div className="w-64 h-screen bg-white shadow-md border-r p-4 flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Your Chats</h2>
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => handleChatSelect(chat.id)}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              chat.id === currentNodeId ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
          >
            {chat.title || 'Untitled'}
          </button>
        ))}
      </div>
    </div>
  )
}
    