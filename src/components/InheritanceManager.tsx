import React, { useState } from 'react';

const InheritanceManager: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const handleConnect = () => {
    setIsConnected(true);
  };

  const processCommand = async () => {
    if (!naturalLanguageInput.trim()) return;
    
    // Simulate AI response
    const response = `🤖 Processing: "${naturalLanguageInput}". I'll help you set up cross-chain inheritance with proper security protocols.`;
    setAiResponse(response);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🏛️ Inheritance Manager</h1>
        
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-medium"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">🤖 AI Inheritance Assistant</h2>
              <input
                type="text"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="Describe your inheritance needs..."
                className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 mb-4"
              />
              <button
                onClick={processCommand}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
              >
                Process
              </button>
              
              {aiResponse && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InheritanceManager; 