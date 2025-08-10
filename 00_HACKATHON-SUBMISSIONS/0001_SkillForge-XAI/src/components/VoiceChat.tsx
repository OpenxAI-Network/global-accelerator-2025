"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, VolumeX } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import { useVoice } from '@/hooks/useVoice';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceChatProps {
  onSendMessage?: (message: string) => Promise<string>;
  className?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ 
  onSendMessage,
  className = ""
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isPlaying } = useVoice();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let response = "I'm here to help you learn! How can I assist you today?";
      
      if (onSendMessage) {
        response = await onSendMessage(text.trim());
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak AI response
      speak(response);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript);
    handleSendMessage(transcript);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const toggleSpeech = (text: string) => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <h3 className="text-lg font-semibold">AI Voice Tutor</h3>
        <p className="text-sm opacity-90">Speak or type to interact</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Start a conversation by typing or using voice input!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">{message.content}</p>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => toggleSpeech(message.content)}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                    title={isPlaying ? "Stop speaking" : "Read aloud"}
                  >
                    {isPlaying ? (
                      <VolumeX size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          
          <VoiceRecorder 
            onTranscript={handleVoiceInput}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;