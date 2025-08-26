'use client';

import React, { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import TradingChart from './TradingChart';
import TokenSelector from './TokenSelector';

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

export default function BaseMiniApp() {
  const { isFrameReady } = useMiniKit();
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

  // Navigation functions for social mentions
  const nextMention = () => {
    if (filteredMentions.length > 0) {
      const maxIndex = filteredMentions.length - 1;
      const newIndex = currentMentionIndex < maxIndex ? currentMentionIndex + 1 : 0;
      console.log(`🔄 Next mention: ${currentMentionIndex} → ${newIndex}, highlighting: ${newIndex}`);
      setCurrentMentionIndex(newIndex);
      setHighlightedMentionIndex(newIndex); // Update highlighted index when navigating
    }
  };

  const prevMention = () => {
    if (filteredMentions.length > 0) {
      const maxIndex = filteredMentions.length - 1;
      const newIndex = currentMentionIndex > 0 ? currentMentionIndex - 1 : maxIndex;
      console.log(`🔄 Prev mention: ${currentMentionIndex} → ${newIndex}, highlighting: ${newIndex}`);
      setCurrentMentionIndex(newIndex);
      setHighlightedMentionIndex(newIndex); // Update highlighted index when navigating
    }
  };

  // Function to handle mention selection from chart
  const handleMentionSelect = (index: number) => {
    console.log(`🎯 Chart dot clicked: setting mention ${index} as current and highlighted`);
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
      
      // Fetch actual mention data from our database
      const response = await fetch('/api/farcaster/local-mentions?token=ETH&days=7');
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          // Filter mentions based on the selected time range
          const hoursMap: Record<'1h' | '24h' | '7d' | '30d' | '90d', number> = { '1h': 1, '24h': 24, '7d': 24*7, '30d': 24*30, '90d': 24*90 };
          const hours = hoursMap[timeRange];
          const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
          
          const timeFilteredMentions = data.data.filter((item: any) => {
            const itemTime = new Date(item.timestamp || item.created_at);
            return itemTime >= cutoffTime;
          });
          
          console.log(`📊 Fetched ${data.data.length} total mentions, ${timeFilteredMentions.length} within ${timeRange}`);
          
          // Update filtered mentions state
          setFilteredMentions(timeFilteredMentions);
          
          // Transform the data to match our expected structure
          const transformedData = {
            analysis: {
              totalCasts: timeFilteredMentions.length,
              totalTokenMentions: timeFilteredMentions.length,
              channelsAnalyzed: 1
            },
            trendingTokens: {
              baseChain: [{
                token: 'ETH',
                mentionCount: timeFilteredMentions.length,
                casts: timeFilteredMentions.length,
                sampleText: timeFilteredMentions.map((item: any) => item.text || item.cast_text || 'No text available')
              }]
            }
          };
          
          setTrendingData(transformedData);
          
          // Reset mention index to 0 when new data is loaded
          setCurrentMentionIndex(0);
          setHighlightedMentionIndex(0);
          
          // Auto-select ETH for MVP testing
          setSelectedToken('ETH');
        } else {
          console.error('Invalid data structure from API:', data);
        }
      } else {
        console.error('Failed to fetch mentions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSelect = (token: string) => {
    setSelectedToken(token);
    // Here we would integrate with Base's trading tools
    // For now, just show the token selection
    // console.log(`Selected token for trading: ${token}`);
  };

  // Open Base Mini App trade interface
  const openBaseTrade = async (token: string) => {
    try {
      // Use Base Mini App trading functionality
      // This would integrate with Base's trading infrastructure
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
            <option value="1h">1h</option>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="90d">90d</option>
          </select>
          
          {/* Network Selector (Locked to Base) */}
          <select
            value="BASE"
            disabled
            className="bg-gray-600/20 border border-gray-400/20 rounded-lg px-3 py-2 text-gray-300 text-sm min-h-[40px] min-w-[80px] cursor-not-allowed"
          >
            <option value="BASE">Base</option>
          </select>
          
          {/* Token Selector (Locked to ETH) */}
          <select
            value="ETH"
            disabled
            className="bg-gray-600/20 border border-gray-400/20 rounded-lg px-3 py-2 text-gray-300 text-sm min-h-[40px] min-w-[60px] cursor-not-allowed"
          >
            <option value="ETH">ETH</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={fetchTrendingTokens}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] min-w-[70px]"
          >
            🔄
          </button>
        </div>
        
        {/* ETH Token Card - Compact */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-400/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <div>
                <div className="text-white font-bold text-lg">$ETH</div>
                <div className="text-green-200 text-sm">
                  {filteredMentions.length} mentions • {filteredMentions.length} posts
                </div>
              </div>
            </div>
            
            {/* Trade Button */}
            <button
              onClick={() => openBaseTrade('ETH')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] min-w-[80px]"
            >
              💰 Trade
            </button>
          </div>
          
          {/* Current Mention Display - Compact with Right-Side Navigation */}
          {filteredMentions.length > 0 ? (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-200 font-medium text-sm">📝 Current Mention:</div>
                <div className="text-green-300 text-xs">
                  {currentMentionIndex + 1} of {filteredMentions.length}
                </div>
              </div>
              
              {/* Navigation Controls - Right-Side Vertical Buttons */}
              <div className="flex items-start gap-2">
                {/* Main Content Area - Full Width */}
                <div className={`flex-1 rounded px-3 py-2 border transition-all duration-200 ${
                  highlightedMentionIndex === currentMentionIndex 
                    ? 'bg-yellow-500/20 border-yellow-400/50' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  {/* Author and Timestamp Info */}
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-300 font-medium">
                        @{filteredMentions[currentMentionIndex]?.author?.username || 'unknown'}
                      </span>
                      {filteredMentions[currentMentionIndex]?.author?.displayName && (
                        <span className="text-gray-300">
                          ({filteredMentions[currentMentionIndex]?.author?.displayName})
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400">
                      {filteredMentions[currentMentionIndex]?.timestamp ? 
                        new Date(filteredMentions[currentMentionIndex].timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }) : 'Unknown time'
                      }
                    </div>
                  </div>
                  
                  {/* Mention Text */}
                  <div className="text-white text-xs leading-relaxed pr-2">
                    "{filteredMentions[currentMentionIndex]?.text || filteredMentions[currentMentionIndex]?.cast_text || 'No text available'}"
                  </div>
                  
                  {/* Sentiment Indicator */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">Sentiment:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      filteredMentions[currentMentionIndex]?.sentiment === 'positive' 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                        : filteredMentions[currentMentionIndex]?.sentiment === 'negative'
                        ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                    }`}>
                      {filteredMentions[currentMentionIndex]?.sentiment === 'positive' ? '😊 Positive' :
                       filteredMentions[currentMentionIndex]?.sentiment === 'negative' ? '😞 Negative' : 
                       '😐 Neutral'}
                    </span>
                  </div>
                  
                  {highlightedMentionIndex === currentMentionIndex && (
                    <div className="text-yellow-300 text-xs mt-2 flex items-center gap-1">
                      ✨ Highlighted
                    </div>
                  )}
                </div>
                
                {/* Right-Side Navigation Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={prevMention}
                    className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-xs transition-colors min-h-[28px] min-w-[40px] flex items-center justify-center border border-white/20"
                    title="Previous mention"
                  >
                    <span className="text-blue-300">↑</span>
                  </button>
                  <button
                    onClick={nextMention}
                    className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded text-xs transition-colors min-h-[28px] min-w-[40px] flex items-center justify-center border border-white/20"
                    title="Next mention"
                  >
                    <span className="text-blue-300">↓</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="text-yellow-400 text-sm mb-1">📭 No mentions found</div>
              <div className="text-yellow-300 text-xs">
                No $ETH mentions for {timeRange}. Try a longer time range.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trading Chart Section - Always visible */}
      <TradingChart
        selectedToken="ETH"
        timeRange={timeRange}
        onMentionSelect={handleMentionSelect}
        currentMentionIndex={currentMentionIndex}
        highlightedMentionIndex={highlightedMentionIndex}
      />

      {/* Base Mini App Integration Info */}
      <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🔗 Base Mini App Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-200">
          <p>• This app integrates with Base's trading infrastructure</p>
          <p>• Click "Trade" to open Base's native trading interface</p>
          <p>• All trading happens within the Base ecosystem</p>
        </div>
      </div>
    </div>
  );
}
