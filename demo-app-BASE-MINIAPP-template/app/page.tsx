'use client';

import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import BaseMiniApp from '../components/BaseMiniApp';
import OllamaDemo from '../components/OllamaDemo';
import SystemStatusRow from '../components/SystemStatusRow';

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
      // Remove console.log for production
    }
  }, [isFrameReady, setFrameReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Main Content - Mobile-First Layout */}
      <div className="container mx-auto px-4 py-6">
        {/* Header - Horizontal Layout with Equal Spacing */}
        <div className="mb-3">
          {/* Mobile: Equal spacing between all elements */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
              <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold text-white">
                🔥 Vibe Trade AI
              </h1>
              <p className="text-xs sm:text-sm text-blue-200">
                Base Mini App for Trading
              </p>
            </div>
            {isFrameReady && (
              <div className="inline-flex items-center gap-1 bg-green-900/30 border border-green-500/50 rounded-full px-2 py-0.5 self-start sm:self-auto">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-xs">Ready</span>
              </div>
            )}
          </div>
        </div>

        {/* 1. MAIN CONTENT - Trending Analysis & Chart First */}
        <div className="max-w-7xl mx-auto mb-8">
          <BaseMiniApp />
        </div>

        {/* Divider */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="border-t border-white/10"></div>
        </div>

        {/* 2. AI Trading Assistant (Chat) */}
        <div className="max-w-4xl mx-auto mb-8">
          <OllamaDemo />
        </div>

        {/* Divider */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="border-t border-white/10"></div>
        </div>

        {/* 3. System Status Row */}
        <div className="max-w-4xl mx-auto mb-8">
          <SystemStatusRow />
        </div>
      </div>

      {/* 4. Disclaimer Footer */}
      <div className="w-full bg-black/20 border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm leading-relaxed max-w-4xl mx-auto">
            <strong>DISCLAIMER:</strong> This is a Base Mini App demo for the OpenxAI Global Accelerator 2025 Hackathon. 
            All data is sourced from Base chain and public APIs. 
            <span className="text-red-300 font-semibold"> This is NOT financial advice.</span> 
            Trading happens through Base's built-in tools. Use at your own risk.
          </p>
        </div>
      </div>
    </div>
  );
}

