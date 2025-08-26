'use client';

import { useState, useEffect } from 'react';

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

export default function OllamaDemo() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    // Check Ollama status on component mount
    checkOllamaStatus();
    // Get current context data
    getContextData();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('/api/ollama');
      if (response.ok) {
        setOllamaStatus('available');
      } else {
        setOllamaStatus('unavailable');
      }
    } catch (error) {
      setOllamaStatus('unavailable');
    }
  };

  const getContextData = async () => {
    try {
      const response = await fetch('/api/ollama-context');
      if (response.ok) {
        const data = await response.json();
        setContext(data.data);
      }
    } catch (error) {
      console.error('Failed to get context data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ollama-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const result: OllamaContextResponse = await response.json();
      
      if (result.success) {
        setResponse(result.data.response);
        setContext(result.data.context);
      } else {
        setResponse(result.data.response || 'Failed to get response');
      }
    } catch (error) {
      setResponse('Error: Failed to connect to Ollama');
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
        const modelName = context?.model || 'llama3.2:3b';
        // Shorten the model name for display
        const shortName = modelName === 'llama3.2:3b' ? 'llama3.2' : modelName;
        return `${shortName} available`;
      case 'unavailable': return 'Unavailable';
      default: return 'Checking...';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">🤖 AI Trading Assistant</h3>
      
      {/* Current Context Display */}
      {context && (
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-white/20">
          <h4 className="text-sm font-medium text-blue-200 mb-3">Current Market Context:</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-blue-300">💰</span>
              <span className="text-white">{context.price}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-300">📊</span>
              <span className="text-white">{context.history}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-300">📱</span>
              <span className="text-white">{context.social}</span>
            </div>
          </div>
        </div>
      )}

      {/* Question Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-2">
                    Ask me about Base chain trading:
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., Should I buy WETH now? What's the current sentiment? Is this a good entry point?"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '🤔 Thinking...' : '🚀 Ask AI Assistant'}
        </button>
      </form>

      {/* Ollama Status */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center space-x-2 bg-gradient-to-br from-purple-500/10 to-purple-600/10 px-4 py-2 rounded-full border border-white/20`}>
          <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'available' ? 'bg-green-400' : ollamaStatus === 'unavailable' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
          <span className={`text-sm ${getStatusColor()}`}>
            Ollama: {getStatusText()}
          </span>
        </div>
        {ollamaStatus === 'available' && context?.model && (
          <p className="text-xs text-purple-200 mt-2">
            Running {context.model} locally
          </p>
        )}
        {ollamaStatus === 'unavailable' && (
          <p className="text-xs text-purple-200 mt-2">
            Install Ollama and run "ollama serve" to enable local AI
          </p>
        )}
      </div>

      {/* AI Response */}
      {response && (
        <div className="mt-6 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-white/20">
          <h4 className="text-sm font-medium text-green-200 mb-3">AI Response:</h4>
          <div className="text-white text-sm leading-relaxed">
            {response}
          </div>
          <div className="mt-3 text-xs text-green-300">
            Model: {context?.model || 'Unknown'} • {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
