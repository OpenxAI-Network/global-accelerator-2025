'use client';

import React, { useState, useEffect } from 'react';

interface OllamaContextResponse {
  success: boolean;
  data: {
    response: string;
    context: {
      price: string;
      history: string;
      social: string;
    };
    model: string;
    timestamp: string;
  };
  error?: string;
}

export default function OllamaTradingAssistant() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [chatHistory, setChatHistory] = useState<Array<{ question: string; response: string; timestamp: Date }>>([]);

  useEffect(() => {
    // Check Ollama status on component mount
    checkOllamaStatus();
    // Get current context data
    getContextData();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      // For now, simulate Ollama availability
      // In production, this would check your AEGIS backend
      setOllamaStatus('available');
    } catch (error) {
      setOllamaStatus('unavailable');
    }
  };

  const getContextData = async () => {
    try {
      // For now, use mock context data
      // In production, this would fetch from your AEGIS backend
      const mockContext = {
        price: "ETH: $3,245.67 (+2.34%)",
        history: "24h volume: $2.1B, 7d change: +8.7%",
        social: "89 mentions, 67% positive sentiment"
      };
      setContext(mockContext);
    } catch (error) {
      console.error('Failed to get context data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      // For now, simulate AI response
      // In production, this would call your AEGIS backend with Ollama
      const mockResponse = `Based on the current market data for ETH:
      
💰 **Price Analysis**: ETH is currently at $3,245.67 with a 2.34% increase in the last 24 hours.

📊 **Technical Indicators**: The token shows bullish momentum with strong support at $3,200.

🤖 **AI Sentiment**: Social sentiment is 67% positive, indicating strong community confidence.

💡 **Trading Recommendation**: Consider a long position with stop-loss at $3,150. The positive social sentiment and price momentum suggest continued upward movement.`;

      setResponse(mockResponse);
      
      // Add to chat history
      setChatHistory(prev => [...prev, {
        question: question.trim(),
        response: mockResponse,
        timestamp: new Date()
      }]);
      
      setQuestion('');
    } catch (error) {
      setResponse('Error: Failed to connect to AI assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (ollamaStatus) {
      case 'available': return 'text-green-300';
      case 'unavailable': return 'text-red-300';
      default: return 'text-yellow-300';
    }
  };

  const getStatusText = () => {
    switch (ollamaStatus) {
      case 'available': 
        return 'AI Assistant Ready';
      case 'unavailable': 
        return 'AI Assistant Unavailable';
      default: 
        return 'Checking AI Status...';
    }
  };

  const getStatusIcon = () => {
    switch (ollamaStatus) {
      case 'available': 
        return '🤖';
      case 'unavailable': 
        return '❌';
      default: 
        return '⏳';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">🤖 AI Trading Assistant</h3>
        <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
          <span>{getStatusIcon()}</span>
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Context Information */}
      {context && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-blue-300 font-medium">Current Price</div>
            <div className="text-white">{context.price}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-green-300 font-medium">Market History</div>
            <div className="text-white">{context.history}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-purple-300 font-medium">Social Sentiment</div>
            <div className="text-white">{context.social}</div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white/5 rounded-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about market analysis, trading strategies, or token insights..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={ollamaStatus !== 'available'}
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading || ollamaStatus !== 'available'}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Ask AI'
              )}
            </button>
          </div>
        </form>

        {/* Response Display */}
        {response && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-sm text-gray-400 mb-2">AI Response:</div>
            <div className="text-white whitespace-pre-line">{response}</div>
          </div>
        )}
      </div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Recent Conversations</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {chatHistory.slice(-5).reverse().map((chat, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">
                  {chat.timestamp.toLocaleTimeString()}
                </div>
                <div className="text-white font-medium mb-2">Q: {chat.question}</div>
                <div className="text-gray-300 text-sm line-clamp-2">
                  {chat.response.substring(0, 150)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Questions */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Quick Questions</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            "What's the current ETH sentiment?",
            "Should I buy ETH now?",
            "What's the market outlook?",
            "Any trading signals?"
          ].map((quickQ, index) => (
            <button
              key={index}
              onClick={() => setQuestion(quickQ)}
              className="bg-white/10 hover:bg-white/20 text-white text-sm p-2 rounded-lg transition-colors text-left"
            >
              {quickQ}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
