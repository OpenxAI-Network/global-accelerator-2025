import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Mic } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: string;
}

interface AegisAIProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
}

export default function AegisAI({ messages, onSendMessage, onVoiceInput }: AegisAIProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-primary/20 border-primary/30 self-end rounded-br-sm max-w-[90%]';
      case 'assistant':
        return 'glass-effect border-white/5 self-start rounded-bl-sm max-w-[90%]';
      case 'system':
        return 'bg-secondary/15 border-secondary/30 self-center text-center text-sm max-w-[80%]';
      default:
        return '';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <CardTitle>AEGIS AI Copilot</CardTitle>
            <p className="text-sm text-muted-foreground">How can I assist you?</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-2xl border ${getMessageStyle(message.type)}`}
            >
              {message.text}
            </div>
          ))}
          {isTyping && (
            <div className="glass-effect border-white/5 self-start rounded-bl-sm p-3 rounded-2xl flex items-center gap-2 max-w-[90%]">
              <span>AEGIS is thinking</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-white/10 flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AEGIS a question or give a command..."
            className="flex-1 rounded-full"
          />
          <Button onClick={handleSend} size="icon" className="rounded-full">
            <Send size={16} />
          </Button>
          <Button onClick={onVoiceInput} size="icon" variant="outline" className="rounded-full">
            <Mic size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}