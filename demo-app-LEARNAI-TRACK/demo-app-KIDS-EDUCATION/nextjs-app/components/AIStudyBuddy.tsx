'use client';

import { useState } from 'react';

export default function AIStudyBuddy() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const prompt = `You are a friendly AI study buddy helping a 5-year-old learn. The child says: "${message}". Give them a helpful, encouraging, and age-appropriate response. Keep it fun, educational, and under 100 words.`;

      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.response || 'Sorry, I couldn\'t respond right now. Try again!');
      } else {
        setResponse('Oops! Something went wrong. Please try again!');
      }
    } catch (error) {
      setResponse('Sorry, I\'m having trouble connecting. Please try again!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">AI Study Buddy</h3>
          <p className="text-gray-600">Ask me anything about learning!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to learn about today?"
              className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? '🤔 Thinking...' : '💬 Ask AI Buddy'}
          </button>
        </form>

        {response && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-2">🤖 AI Buddy says:</h4>
            <p className="text-blue-700">{response}</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🌟 Your friendly AI learning companion 🌟</p>
        </div>
      </div>
    </div>
  );
}
