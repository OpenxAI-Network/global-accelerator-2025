'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Snippet, Textarea, Button, Spinner } from "@nextui-org/react";
import { MdCheck, MdContentCopy, MdFileUpload } from "react-icons/md";
import toast from 'react-hot-toast';

const Page = () => {
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }
  const handleCopy = (content:any, index:any) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }


  const handlePostSubmit = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setMessages(prev => [...prev, { type: 'user', content: prompt }])
    setPrompt("")

    try {
      const response = await fetch("http://localhost:1234/generate", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessages(prev => [...prev, { type: 'ai', content: data.response }])
    } catch (error) {
      console.error('Error:', error)
      toast.error("Error: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='section w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-100 to-purple-100'>

      <header className='bg-gradient-to-r from-blue-600 to-violet-600 text-white p-1 text-center text-xl  shadow-lg'>
        Your Personal AI Chatbot
      </header>
      <div className="bot-section w-full flex flex-col md:flex-row">
        <div className="left-bot-section w-full md:w-1/4 border-r-2 border-r-gray-200 p-6">
          <h1 className='text-2xl font-bold mb-6'>Suggested Prompts</h1>
          <div className="flex flex-col gap-4 font-bbManual">
            {["What is AI?", "Explain quantum computing", "How does blockchain work?", "Describe machine learning"].map((suggestion, index) => (
              <div key={index} className="history-bar p-4 rounded-lg bg-white bg-opacity-50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-opacity-70" onClick={()=>{
                console.log("Clciked");
                setPrompt(suggestion);
              }}>
                {suggestion}
              </div>
            ))}
          </div>
        </div>
        <div className="middle-bot-section w-full md:w-3/4 h-[calc(100vh-5rem)] flex flex-col p-6 overflow-x-hidden">
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-6 space-y-6">
            {messages.map((message:any, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div
  className={`font-bbManual flex items-center justify-center max-w-[50%] p-4 rounded-lg ${message.type === 'user' ? ' bg-opacity-50' : 'bg-blue-200 bg-opacity-50'} shadow-md`}
>
  <span className="flex items-center">
    <span>
      $ {message.content}
    </span>
    <button>
      <MdContentCopy className="ml-2 mt-2" onClick={() => handleCopy(message.content, index)} />
    </button>
  </span>
</div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="loading-animation">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-3xl">
            <Textarea
              variant="bordered"
              placeholder="Enter your prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow text-2xl p-4 font-bold"
              minRows={3}
              maxRows={6}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handlePostSubmit()
                }
              }}
            />
            <Button
              isIconOnly
              color="primary"
              aria-label="Send"
              onClick={handlePostSubmit}
              isLoading={isLoading}
              className="h-16 w-16"
            >
              {isLoading ? <Spinner color="current" size="lg" /> : <MdFileUpload size={24} />}
            </Button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .loading-animation {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .dot {
          width: 10px;
          height: 10px;
          margin: 0 5px;
          background-color: #4B5563;
          border-radius: 50%;
          animation: pulse 1.5s infinite ease-in-out;
        }
        .dot:nth-child(2) {
          animation-delay: 0.5s;
        }
        .dot:nth-child(3) {
          animation-delay: 1s;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Page

