'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { VoiceLearning } from './VoiceLearning'
import { AITutorMessage } from '@/types'
import { Mic, MicOff } from 'lucide-react'

export function AITutor() {
  const [messages, setMessages] = useState<AITutorMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVoice, setShowVoice] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: AITutorMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      if (response.status === 429) {
        // Handle quota exceeded error
        const errorMessage: AITutorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ **Demo Mode Active** - The OpenAI API quota has been exceeded. This is a demonstration of how SkillForge-XAI handles API limitations gracefully. In production, this would seamlessly switch to backup AI models or cached responses.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      } else if (data.response) {
        const aiMessage: AITutorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.isUsingFallback ? 
            `🤖 **Fallback Mode**: ${data.response}` : 
            data.response,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceTranscript = (text: string) => {
    setInput(text)
  }

  const handleVoiceResponse = (text: string) => {
    const aiMessage: AITutorMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, aiMessage])
  }

  if (showVoice) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">AI Voice Tutor</h3>
          <Button 
            onClick={() => setShowVoice(false)}
            variant="outline"
            size="sm"
          >
            Switch to Text
          </Button>
        </div>
        <VoiceLearning 
          onTranscript={handleVoiceTranscript}
          onResponse={handleVoiceResponse}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center space-y-2">
            <div className="text-gray-500">
              🏆 **SkillForge-XAI Demo** - OpenxAI Global Accelerator 2025
            </div>
            <div className="text-sm text-gray-400">
              Ask me anything! I'm your AI tutor powered by advanced language models.
            </div>
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ Note: Currently in demo mode due to API quota limits
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">AI Tutor</span>
          <Button 
            onClick={() => setShowVoice(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Mic className="w-4 h-4" />
            Voice Mode
          </Button>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button onClick={sendMessage} loading={loading} disabled={!input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}