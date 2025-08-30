'use client';

import React, { useState } from 'react';

interface TrendingToken {
  token: string;
  mentionCount: number;
  casts: number;
  sampleText: string[];
}

interface TokenSelectorProps {
  selectedToken: string | null;
  onTokenSelect: (token: string) => void;
  trendingTokens: TrendingToken[];
}

export default function TokenSelector({ selectedToken, onTokenSelect, trendingTokens }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Default tokens available for trading
  const defaultTokens = [
    { symbol: 'ETH', name: 'Ethereum', color: 'from-blue-500 to-blue-600' },
    { symbol: 'WETH', name: 'Wrapped ETH', color: 'from-purple-500 to-purple-600' },
    { symbol: 'USDC', name: 'USD Coin', color: 'from-green-500 to-green-600' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', color: 'from-orange-500 to-orange-600' },
    { symbol: 'DAI', name: 'Dai Stablecoin', color: 'from-yellow-500 to-yellow-600' },
  ];

  // Combine default tokens with trending tokens
  const allTokens = [
    ...defaultTokens,
    ...trendingTokens
      .filter(tt => !defaultTokens.find(dt => dt.symbol === tt.token))
      .map(tt => ({
        symbol: tt.token,
        name: tt.token,
        color: 'from-gray-500 to-gray-600',
        mentionCount: tt.mentionCount
      }))
  ];

  const selectedTokenInfo = allTokens.find(t => t.symbol === selectedToken);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-white text-sm min-h-[40px] transition-colors"
      >
        {selectedTokenInfo ? (
          <>
            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${selectedTokenInfo.color}`}></div>
            <span className="font-medium">{selectedTokenInfo.symbol}</span>
            {selectedTokenInfo.mentionCount && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedTokenInfo.mentionCount}
              </span>
            )}
          </>
        ) : (
          <span>Select Token</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-white/20 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-white/10">
            <h3 className="text-white font-medium text-sm">Select Token</h3>
          </div>
          
          <div className="p-2">
            {allTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  onTokenSelect(token.symbol);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedToken === token.symbol
                    ? 'bg-blue-600/20 border border-blue-500/50'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${token.color}`}></div>
                <div className="flex-1">
                  <div className="text-white font-medium">{token.symbol}</div>
                  <div className="text-gray-400 text-xs">{token.name}</div>
                </div>
                {token.mentionCount && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {token.mentionCount}
                  </div>
                )}
                {selectedToken === token.symbol && (
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
