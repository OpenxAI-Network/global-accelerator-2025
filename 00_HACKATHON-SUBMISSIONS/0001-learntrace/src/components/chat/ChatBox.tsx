// src/components/chat/ChatBox.tsx
'use client'

import { useState } from 'react'
import { SendHorizonal } from 'lucide-react'

type Props = {
  onSend: (text: string) => void
  isEmpty: boolean
}

export default function ChatBox({ onSend, isEmpty }: Props) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend(input)
    setInput('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${isEmpty ? 'flex flex-1 justify-center items-center' : 'p-4 border-t'} bg-white`}
    >
      <div className="flex w-full max-w-2xl items-center border rounded-full px-4 py-2 shadow-md bg-[#edf1f7]">
        <input
          className="flex-1 outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
        />
        <button type="submit" className="ml-2 text-blue-700 hover:text-blue-900">
          <SendHorizonal size={20} />
        </button>
      </div>
    </form>
  )
}
