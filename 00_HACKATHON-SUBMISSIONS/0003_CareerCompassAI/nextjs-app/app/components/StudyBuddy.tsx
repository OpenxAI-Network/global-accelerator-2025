'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageCircle, 
  RefreshCw,
  Zap,
  Brain,
  ArrowDown,
  Trash2,
  Maximize2
} from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  id: string;
}

export const StudyBuddy = ({ onQuestionAsked }: { onQuestionAsked: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      sender: 'user', 
      text: input.trim(),
      timestamp: new Date(),
      id: `user_${Date.now()}`
    };
    
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
        body: JSON.stringify({ question: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the study buddy.');
      }

      const data = await response.json();
      const botMessage: Message = { 
        sender: 'bot', 
        text: data.answer,
        timestamp: new Date(),
        id: `bot_${Date.now()}`
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Study buddy error:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: "I'm experiencing some technical difficulties. Please try asking your question again, or check your connection.",
        timestamp: new Date(),
        id: `error_${Date.now()}`
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto"> {/* Increased from max-w-4xl to max-w-7xl */}
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-violet-600/5 rounded-3xl -z-10" />
      
      {/* Main Container */}
      <motion.div
        className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 border-b border-white/10 p-8"> {/* Increased padding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6"> {/* Increased gap */}
              <motion.div
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-cyan-600/20 border border-purple-400/30 flex items-center justify-center"> {/* Increased size */}
                  <Bot className="w-9 h-9 text-purple-400" /> {/* Increased icon size */}
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
              </motion.div>
              
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"> {/* Increased from text-2xl to text-4xl */}
                  AI Study Buddy
                </h2>
                <p className="text-gray-300 text-lg mt-2"> {/* Increased text size and added margin */}
                  Your personal learning assistant for career growth
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <Maximize2 className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300 text-sm">Enhanced View</span>
              </div>
              
              {messages.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearChat}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-300" // Increased padding
                  title="Clear chat"
                >
                  <Trash2 className="w-6 h-6" /> {/* Increased icon size */}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container - SIGNIFICANTLY INCREASED HEIGHT */}
        <div className="relative">
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-[600px] overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" // Increased from h-96 to h-[600px], increased padding and spacing
          >
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-8" // Increased spacing
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400/10 to-cyan-600/10 border border-purple-400/20 flex items-center justify-center"> {/* Increased size */}
                      <MessageCircle className="w-12 h-12 text-purple-400" /> {/* Increased icon size */}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"> {/* Increased size */}
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-4"> {/* Increased spacing */}
                    <h3 className="text-2xl font-semibold text-white"> {/* Increased font size */}
                      Welcome to your AI Study Buddy!
                    </h3>
                    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed"> {/* Increased max-width and font size */}
                      Ask me anything about your career, learning goals, or professional development. 
                      I'm here to help you grow and provide detailed explanations for complex topics!
                    </p>
                  </div>

                  {/* Suggested Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl"> {/* Increased gap and max-width */}
                    {[
                      "How can I improve my development skills?",
                      "What are the latest Web3 trends?",
                      "How to prepare for technical interviews?",
                      "Best practices for Data Structes and Algorithms?"
                    ].map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInput(suggestion)}
                        className="p-4 text-base text-left rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300" // Increased padding and font size
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex items-start gap-6 ${  // Increased gap
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 flex items-center justify-center"> {/* Increased size */}
                          <Bot className="w-6 h-6 text-purple-400" /> {/* Increased icon size */}
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] ${  // Increased from max-w-[70%] to max-w-[80%]
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30'
                          : 'bg-white/10 border border-white/20'
                      } rounded-2xl p-6 backdrop-blur-sm`}  // Increased padding
                    >
                      <p className="text-white text-lg leading-relaxed whitespace-pre-wrap"> {/* Increased font size and line height */}
                        {msg.text}
                      </p>
                      <div className="mt-3 text-sm text-gray-400"> {/* Increased margin and font size */}
                        {msg.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-500/30 flex items-center justify-center"> {/* Increased size */}
                          <User className="w-6 h-6 text-gray-400" /> {/* Increased icon size */}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Loading Message */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="flex items-start gap-6" // Increased gap
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 flex items-center justify-center"> {/* Increased size */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="w-6 h-6 text-purple-400" /> {/* Increased icon size */}
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm"> {/* Increased padding */}
                    <motion.div
                      className="flex items-center gap-3 text-white text-lg" // Increased gap and font size
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="flex gap-2"> {/* Increased gap */}
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-3 h-3 bg-purple-400 rounded-full" // Increased dot size
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                      <span>Generating detailed response...</span> {/* Updated text */}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToBottom}
                className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 backdrop-blur-sm flex items-center justify-center text-purple-400 hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300" // Increased size and positioning
              >
                <ArrowDown className="w-6 h-6" /> {/* Increased icon size */}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input Form */}
        <div className="border-t border-white/10 p-8 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5"> {/* Increased padding */}
          <form onSubmit={handleSendMessage} className="flex gap-6"> {/* Increased gap */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your career journey..."
                disabled={isLoading}
                className="w-full px-8 py-5 text-lg text-white placeholder-gray-400 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50" // Increased padding and font size
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-cyan-500/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: isLoading || !input.trim() ? 1 : 1.05 }}
              whileTap={{ scale: isLoading || !input.trim() ? 1 : 0.95 }}
              className={`relative group px-8 py-5 rounded-2xl font-semibold text-white text-lg transition-all duration-300 ${ // Increased padding and font size
                isLoading || !input.trim()
                  ? 'bg-gray-600/50 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-400 hover:to-cyan-500 shadow-lg hover:shadow-purple-500/25'
              }`}
            >
              <div className="flex items-center gap-3"> {/* Increased gap */}
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <Send className="w-6 h-6" /> 
                )}
              </div>
              {!isLoading && input.trim() && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </motion.button>
          </form>

          {/* Tips */}
          <div className="mt-6 text-center"> {/* Increased margin */}
            <p className="text-sm text-gray-400"> {/* Increased font size */}
              💡 Press Enter to send • Shift + Enter for new line • Optimized for detailed AI responses
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
