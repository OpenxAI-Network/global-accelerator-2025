'use client';

import { useState } from 'react';

interface TokenInfo {
  symbol: string;
  name: string;
  isStable: boolean;
  basePrice?: number;
  description: string;
}

interface TokenSelectorProps {
  selectedToken: string;
  onTokenChange: (token: string) => void;
  tokens: TokenInfo[];
}

export default function TokenSelector({ selectedToken, onTokenChange, tokens }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTokenInfo = tokens.find(t => t.symbol === selectedToken);

  return (
    <div className="relative">
      {/* Token Display */}
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Base L2 Trading Pair</h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-blue-300 hover:text-white transition-colors"
          >
            {isOpen ? '▼' : '▶'}
          </button>
        </div>
        
        {/* Selected Token Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {selectedToken.charAt(0)}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">
                ${selectedToken}
              </div>
              <div className="text-blue-200 text-sm">
                {selectedTokenInfo?.name}
              </div>
            </div>
            {selectedTokenInfo?.isStable && (
              <div className="ml-auto">
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                  Stable
                </span>
              </div>
            )}
          </div>
          
          <div className="text-blue-200 text-sm">
            {selectedTokenInfo?.description}
          </div>
        </div>

        {/* Token Selector Dropdown */}
        {isOpen && (
          <div className="mt-4 space-y-2">
            {tokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  onTokenChange(token.symbol);
                  setIsOpen(false);
                }}
                className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                  selectedToken === token.symbol
                    ? 'bg-blue-500/20 border-blue-400/50 text-white'
                    : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">${token.symbol}</div>
                      <div className="text-xs opacity-80">{token.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {token.isStable && (
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                        Stable
                      </span>
                    )}
                    {selectedToken === token.symbol && (
                      <span className="text-blue-400">✓</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
