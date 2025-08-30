import React from 'react';
import VibeTradingAI from '../components/VibeTradingAI';

export default function VibeTradingAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🔥 Vibe Trading AI
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            AI-powered trading signals powered by Base chain, Farcaster sentiment analysis, and Ollama AI
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-500/50 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm">Base Mini App Ready</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/50 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm">AI Sentiment Analysis</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/50 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-300 text-sm">Real-time Trading</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <VibeTradingAI />
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            🚀 What Makes Vibe Trading AI Special
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">AI Sentiment Analysis</h3>
              <p className="text-gray-300">
                Ollama AI analyzes Farcaster social posts to provide real-time sentiment insights for trading decisions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Charts</h3>
              <p className="text-gray-300">
                Interactive price charts with sentiment dots showing social sentiment correlation with price movements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-white mb-3">Base Chain Integration</h3>
              <p className="text-gray-300">
                Seamless integration with Base chain for real trading functionality and price feeds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Database</h3>
              <p className="text-gray-300">
                PostgreSQL database stores price history, sentiment data, and social mentions for comprehensive analysis.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-white mb-3">Mobile-First Design</h3>
              <p className="text-gray-300">
                Responsive design optimized for mobile devices and Base Mini App integration.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Updates</h3>
              <p className="text-gray-300">
                Live data updates every few minutes with WebSocket connections for instant notifications.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            🔄 How Vibe Trading AI Works
          </h2>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex-1">
                <h3 className="text-xl font-bold text-white mb-3">Data Collection</h3>
                <p className="text-gray-300">
                  The system automatically collects social posts from Farcaster about $ETH and other tokens, 
                  fetches real-time price data from Chainlink feeds, and stores everything in a PostgreSQL database.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex-1">
                <h3 className="text-xl font-bold text-white mb-3">AI Analysis</h3>
                <p className="text-gray-300">
                  Ollama AI analyzes each social post to determine sentiment (positive, negative, or neutral) 
                  and provides trading insights based on market data and social sentiment correlation.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex-1">
                <h3 className="text-xl font-bold text-white mb-3">Trading Interface</h3>
                <p className="text-gray-300">
                  Users can view interactive charts, analyze sentiment trends, ask AI questions, 
                  and execute trades directly through Base chain integration with MiniKit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="w-full bg-black/20 border-t border-white/10 py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-white/60 text-sm leading-relaxed max-w-4xl mx-auto">
              <strong>DISCLAIMER:</strong> This is a Vibe Trading AI integration for the AEGIS AI Liquid Vault platform. 
              All data is sourced from Base chain and public APIs. 
              <span className="text-red-300 font-semibold"> This is NOT financial advice.</span> 
              Trading involves risk and should be done responsibly. Use at your own risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
