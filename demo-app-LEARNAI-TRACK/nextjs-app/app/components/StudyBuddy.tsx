'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const StudyBuddy = ({ onQuestionAsked }: { onQuestionAsked: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    onQuestionAsked();

    try {
      const response = await fetch('/api/study-buddy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the study buddy.');
      }

      const data = await response.json();
      const botMessage: Message = { sender: 'bot', text: data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Study buddy error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glassmorphism border-white/20">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Bot className="mr-2" /> AI Study Buddy
        </h2>
        <div className="h-96 overflow-y-auto pr-4 mb-4 space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : ''
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-electric-purple to-neon-pink flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-xl max-w-md ${
                  msg.sender === 'user'
                    ? 'bg-slate-500 text-white'
                    : 'bg-white/10 text-white/90'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-electric-purple to-neon-pink flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-white/10 text-white/90">
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  Thinking...
                </motion.div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your career..."
            className="flex-grow glassmorphism-input border-white/30"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};