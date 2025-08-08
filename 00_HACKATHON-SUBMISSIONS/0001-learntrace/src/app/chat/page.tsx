'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

import Sidebar from '@/components/Sidebar'
import ChatThread from '@/components/chat/ChatThread'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        const parentFromURL = searchParams.get('parent')
        if (parentFromURL) {
          setCurrentNodeId(parentFromURL)
        } else {
          const { data: latestNode } = await supabase
            .from('nodes')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (latestNode) {
            setCurrentNodeId(latestNode.id)
          }
        }

        setLoading(false)
      }
    }

    checkSession()
  }, [router, searchParams])

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="flex">
      <Sidebar currentNodeId={currentNodeId} setCurrentNodeId={setCurrentNodeId} />
      <ChatThread currentNodeId={currentNodeId} setCurrentNodeId={setCurrentNodeId} chatId={null}/>
    </div>
  )
}
