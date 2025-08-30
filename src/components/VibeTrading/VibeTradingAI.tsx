'use client';

import React, { useState, useEffect } from 'react';

export default function VibeTradingAI() {
  const [mounted, setMounted] = useState(false);
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [currentPrice, setCurrentPrice] = useState(2500);
  const [priceChange, setPriceChange] = useState(2.5);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Generate random price data
      const interval = setInterval(() => {
        const change = (Math.random() - 0.5) * 10;
        setPriceChange(change);
        setCurrentPrice(2500 * (1 + change / 100));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200 text-lg">Loading Vibe Trading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200 text-lg">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🔥 Vibe Trading
          </h1>
          <p className="text-xl text-blue-200">
            Simple AI-powered trading insights
          </p>
        </div>

        {/* Main Trading Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              ${selectedToken} Price
            </h2>
            <p className="text-blue-200">Real-time market data</p>
          </div>
          
          {/* Price Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-white mb-2">
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`text-2xl font-medium ${
              priceChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>

          {/* Simple Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-lg"
            >
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
              <option value="SOL">SOL</option>
              <option value="AVAX">AVAX</option>
            </select>

            <button
              onClick={() => alert('Trade functionality coming soon!')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all"
            >
              Trade Now
            </button>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white mb-2">24h Volume</div>
            <div className="text-blue-300 text-lg">$2.4B</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-white mb-2">Market Sentiment</div>
            <div className="text-green-300 text-lg">Bullish</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-white mb-2">Active Trades</div>
            <div className="text-purple-300 text-lg">1,247</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.open('https://app.uniswap.org', '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              🦄 Open Uniswap
            </button>
            <button
              onClick={() => window.open('https://basescan.org', '_blank')}
              className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              🔍 View on Explorer
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>Vibe Trading - Simple, Fast, Reliable</p>
        </div>
      </div>
    </div>
  );
}
