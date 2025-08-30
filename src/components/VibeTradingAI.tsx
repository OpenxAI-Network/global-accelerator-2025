'use client';

import React, { useState, useEffect } from 'react';
import TradingChart from './VibeTrading/TradingChart';
import TokenSelector from './VibeTrading/TokenSelector';
import OllamaTradingAssistant from './VibeTrading/OllamaTradingAssistant';
import SystemStatusRow from './VibeTrading/SystemStatusRow';
import TradeForm from './VibeTrading/TradeForm';
import AegisSecurityDashboard from './VibeTrading/AegisSecurityDashboard';
import AIEnhancedTradingAssistant from './VibeTrading/AIEnhancedTradingAssistant';
import AIMarketAnalysisDashboard from './VibeTrading/AIMarketAnalysisDashboard';
import AIErrorBoundary from './VibeTrading/AIErrorBoundary';

interface TrendingData {
  analysis: {
    totalCasts: number;
    totalTokenMentions: number;
    channelsAnalyzed: number;
  };
  trendingTokens: {
    baseChain: Array<{
      token: string;
      mentionCount: number;
      casts: number;
      sampleText: string[];
    }>;
  };
}

export default function VibeTradingAI() {
  const [trendingData, setTrendingData] = useState<TrendingData>({
    analysis: { totalCasts: 0, totalTokenMentions: 0, channelsAnalyzed: 0 },
    trendingTokens: { baseChain: [] }
  });
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('1h');
  const [currentMentionIndex, setCurrentMentionIndex] = useState(0);
  const [highlightedMentionIndex, setHighlightedMentionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredMentions, setFilteredMentions] = useState<any[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Navigation functions for social mentions
  const nextMention = () => {
    if (filteredMentions.length > 0) {
      const maxIndex = filteredMentions.length - 1;
      const newIndex = currentMentionIndex < maxIndex ? currentMentionIndex + 1 : 0;
      setCurrentMentionIndex(newIndex);
      setHighlightedMentionIndex(newIndex);
    }
  };

  const prevMention = () => {
    if (filteredMentions.length > 0) {
      const maxIndex = filteredMentions.length - 1;
      const newIndex = currentMentionIndex > 0 ? currentMentionIndex - 1 : maxIndex;
      setCurrentMentionIndex(newIndex);
      setHighlightedMentionIndex(newIndex);
    }
  };

  // Function to handle mention selection from chart
  const handleMentionSelect = (index: number) => {
    setCurrentMentionIndex(index);
    setHighlightedMentionIndex(index);
  };

  useEffect(() => {
    fetchTrendingTokens();
  }, []);

  // Refetch data when time range changes
  useEffect(() => {
    if (trendingData.trendingTokens.baseChain.length > 0) {
      fetchTrendingTokens();
    }
  }, [timeRange]);

  const fetchTrendingTokens = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      // For now, we'll use mock data until the backend is set up
      // In production, this would fetch from your AEGIS backend
      const mockData = {
        analysis: {
          totalCasts: 150,
          totalTokenMentions: 89,
          channelsAnalyzed: 3
        },
        trendingTokens: {
          baseChain: [{
            token: 'ETH',
            mentionCount: 89,
            casts: 150,
            sampleText: [
              "ETH is looking bullish today! 🚀",
              "Great entry point for ETH right now",
              "ETH sentiment is very positive"
            ]
          }]
        }
      };
      
      setTrendingData(mockData);
      setSelectedToken('ETH');
      
      // Mock mentions data
      const mockMentions = Array.from({ length: 89 }, (_, i) => ({
        id: i,
        text: `ETH mention ${i + 1}`,
        timestamp: new Date(Date.now() - i * 60000),
        sentiment: ['positive', 'negative', 'neutral'][i % 3] as 'positive' | 'negative' | 'neutral'
      }));
      
      setFilteredMentions(mockMentions);
      setCurrentMentionIndex(0);
      setHighlightedMentionIndex(0);
      
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch trending tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
  };

  // Open Base Mini App trade interface
  const openBaseTrade = async (token: string) => {
    try {
      console.log(`Opening Base trade for ${token}`);
      
      // For now, redirect to a trading interface
      // In production, this would use Base's trading SDK
      const tradeUrl = `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${token}`;
      window.open(tradeUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error('Failed to open Base trade:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-blue-200">Analyzing Base chain for trending tokens...</p>
      </div>
    );
  }

  if (!trendingData) {
    return (
      <div className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <p className="text-center text-red-200">Failed to load trending data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unified Trending & Controls Panel - Mobile-First Design */}
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        {/* Compact Title */}
        <div className="text-center mb-3">
          <h2 className="text-lg md:text-xl font-bold text-white">🔥 Trending $ETH mentions on Farcaster</h2>
        </div>
        
        {/* Inline Controls - Single Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm min-h-[40px] min-w-[60px]"
          >
            <option value="1h">1H</option>
            <option value="24h">24H</option>
            <option value="7d">7D</option>
            <option value="30d">30D</option>
            <option value="90d">90D</option>
          </select>

          {/* Token Selector */}
          <TokenSelector
            selectedToken={selectedToken}
            onTokenSelect={handleTokenSelect}
            trendingTokens={trendingData.trendingTokens.baseChain}
          />

          {/* Trade Button */}
          <button
            onClick={() => selectedToken && openBaseTrade(selectedToken)}
            disabled={!selectedToken}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:cursor-not-allowed"
          >
            Trade {selectedToken || 'Token'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-300">{trendingData.analysis.totalCasts}</div>
            <div className="text-xs text-blue-200">Total Casts</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-300">{trendingData.analysis.totalTokenMentions}</div>
            <div className="text-xs text-green-200">Mentions</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-300">{trendingData.analysis.channelsAnalyzed}</div>
            <div className="text-xs text-purple-200">Channels</div>
          </div>
        </div>
      </div>

      {/* Trading Chart */}
      <div className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <TradingChart
          selectedToken={selectedToken || 'ETH'}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onMentionSelect={handleMentionSelect}
          currentMentionIndex={currentMentionIndex}
          highlightedMentionIndex={highlightedMentionIndex}
        />
      </div>

      {/* Social Mentions Panel */}
      {filteredMentions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Social Sentiment Analysis</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMention}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
              >
                ←
              </button>
              <span className="text-white text-sm">
                {currentMentionIndex + 1} / {filteredMentions.length}
              </span>
              <button
                onClick={nextMention}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>

          {filteredMentions[currentMentionIndex] && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  filteredMentions[currentMentionIndex].sentiment === 'positive' ? 'bg-green-400' :
                  filteredMentions[currentMentionIndex].sentiment === 'negative' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-white text-sm capitalize">
                  {filteredMentions[currentMentionIndex].sentiment} sentiment
                </span>
                <span className="text-gray-400 text-xs">
                  {filteredMentions[currentMentionIndex].timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-white text-lg">
                "{filteredMentions[currentMentionIndex].text}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced AI Trading Assistant */}
      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <AIErrorBoundary>
          <AIEnhancedTradingAssistant 
            selectedToken={selectedToken || 'ETH'} 
            currentPrice={2500}
          />
        </AIErrorBoundary>
      </div>

      {/* AI Market Analysis Dashboard */}
      <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <AIErrorBoundary>
          <AIMarketAnalysisDashboard 
            selectedToken={selectedToken || 'ETH'} 
            currentPrice={2500}
          />
        </AIErrorBoundary>
      </div>

      {/* Security-Integrated Trading Form */}
      <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <AIErrorBoundary>
          <TradeForm 
            selectedToken={selectedToken || 'ETH'} 
            onTradeExecute={(trade) => {
              console.log('Trade executed with AEGIS security:', trade);
              // Here you would integrate with Base chain trading
            }}
          />
        </AIErrorBoundary>
      </div>

      {/* AEGIS Security Dashboard */}
      <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <AegisSecurityDashboard />
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-br from-gray-700/20 to-gray-800/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <SystemStatusRow />
      </div>
    </div>
  );
}
