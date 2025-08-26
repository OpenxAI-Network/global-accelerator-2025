'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface PriceData {
  price: number;
  timestamp: Date;
}

interface SentimentData {
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  text: string;
  author: {
    username: string;
    displayName: string;
  };
}

interface TradingChartProps {
  selectedToken: string;
  timeRange: '1h' | '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: '1h' | '24h' | '7d' | '30d' | '90d') => void;
  onMentionSelect?: (index: number) => void;
  currentMentionIndex?: number;
  highlightedMentionIndex?: number | null;
}

export default function TradingChart({ selectedToken, timeRange, onTimeRangeChange, onMentionSelect, currentMentionIndex, highlightedMentionIndex }: TradingChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [farcasterStatus, setFarcasterStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [displayToken, setDisplayToken] = useState<string>(selectedToken);
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    text: string;
    sentiment: string;
    author: string;
    x: number;
    y: number;
    timestamp?: Date; // Added timestamp to tooltip state
  } | null>(null);

  // Fix hydration error by only rendering time-based content on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchChartData();
    fetchSentimentData();
    
    // Refresh data every 2 minutes (respecting API rate limits)
    const interval = setInterval(() => {
      fetchChartData();
      fetchSentimentData();
      setLastUpdate(new Date());
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [selectedToken, timeRange]);

  const fetchChartData = async () => {
    try {
      // Try selected token first; map WETH→ETH for history/price
      let tokenToUse = selectedToken;
      if (tokenToUse === 'WETH') {
        tokenToUse = 'ETH';
      }
      let response = await fetch(`/api/base-price?token=${tokenToUse}`);
      if (!response.ok) {
        // final fallback to ETH
        tokenToUse = 'ETH';
        setDisplayToken('ETH');
        response = await fetch(`/api/base-price?token=ETH`);
      } else {
        setDisplayToken(tokenToUse);
      }
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.price) {
          // Fetch real price history from database
          const hoursMap: Record<'1h' | '24h' | '7d' | '30d' | '90d', number> = { '1h': 1, '24h': 24, '7d': 24*7, '30d': 24*30, '90d': 24*90 };
          const historyToken = tokenToUse === 'WETH' ? 'ETH' : tokenToUse;
          const historyResponse = await fetch(`/api/price-history?token=${historyToken}&hours=${hoursMap[timeRange]}`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData.success && historyData.data.length > 0) {
              const realPrices = historyData.data.map((item: any) => ({
                price: parseFloat(item.price),
                timestamp: new Date(item.timestamp)
              }));
              setPriceData(realPrices);
            } else {
              // If no history, create a flat line with two identical points using the live price
              const now = new Date();
              setPriceData([
                { price: data.data.price, timestamp: new Date(now.getTime() - 60 * 60 * 1000) },
                { price: data.data.price, timestamp: now }
              ]);
            }
          } else {
            const now = new Date();
            setPriceData([
              { price: data.data.price, timestamp: new Date(now.getTime() - 60 * 60 * 1000) },
              { price: data.data.price, timestamp: now }
            ]);
          }
          
          // Calculate price change from real data
          if (priceData.length > 1) {
            const firstPrice = priceData[0].price;
            const lastPrice = priceData[priceData.length - 1].price;
            if (firstPrice > 0 && isFinite(firstPrice) && isFinite(lastPrice)) {
              const change = ((lastPrice - firstPrice) / firstPrice) * 100;
              setPriceChange(change);
            } else {
              setPriceChange(0);
            }
          }
          
          // Set current price
          setCurrentPrice(data.data.price);
        }
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSentimentData = async () => {
    try {
      const hoursMap: Record<'1h' | '24h' | '7d' | '30d' | '90d', number> = { '1h': 1, '24h': 24, '7d': 24*7, '30d': 24*30, '90d': 24*90 };
      const hours = hoursMap[timeRange];
      
      // Fetch mentions with their exact timestamps - use same format as price API
      const response = await fetch(`/api/farcaster/local-mentions?token=ETH&hours=${hours}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          const transformedSentiments = data.data
            .filter((item: any) => {
              // Ensure we have valid timestamp and text
              const hasTimestamp = item.timestamp || item.created_at;
              const hasText = item.text || item.cast_text;
              return hasTimestamp && hasText;
            })
            .map((item: any) => {
              // Use the correct timestamp field
              const timestamp = item.timestamp || item.created_at;
              const text = item.text || item.cast_text;
              
              return {
                timestamp: new Date(timestamp),
                sentiment: item.sentiment || 'neutral',
                text: text,
                author: {
                  username: item.author?.username || item.username || 'unknown',
                  displayName: item.author?.displayName || item.display_name || 'Unknown User'
                }
              };
            });
          
          // Filter by time range
          const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
          
          const filteredSentiments = transformedSentiments
            .filter((item: any) => {
              const itemTime = item.timestamp;
              const isRecent = itemTime >= cutoffTime;
              return isRecent;
            });
          
          setSentimentData(filteredSentiments);
        } else {
          setSentimentData([]);
        }
      } else {
        setSentimentData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching sentiment data:', error);
      setSentimentData([]);
    }
  };

  const renderChart = () => {
    if (priceData.length === 0) {
      return (
        <div className="w-full h-64 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-lg border border-white/20 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-2xl mb-2">📊</div>
            <div>No price data available</div>
            <div className="text-sm">Select a token to view chart</div>
          </div>
        </div>
      );
    }

    // Validate data to prevent NaN values
    const validPriceData = priceData.filter(d => 
      d && 
      typeof d.price === 'number' && 
      !isNaN(d.price) && 
      d.timestamp instanceof Date && 
      !isNaN(d.timestamp.getTime()) &&
      d.timestamp.getTime() > 0 && // Ensure timestamp is positive
      d.timestamp.getTime() < Date.now() + (365 * 24 * 60 * 60 * 1000) // Ensure timestamp is not in the far future
    );

    if (validPriceData.length === 0) {
      return (
        <div className="w-full h-64 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-lg border border-white/20 flex items-center justify-center">
          <div className="text-center text-red-400">
            <div className="text-2xl mb-2">⚠️</div>
            <div>Invalid chart data</div>
            <div className="text-sm">Unable to generate chart path</div>
          </div>
        </div>
      );
    }

    // Use responsive chart dimensions
    const chartWidth = 800; // Base width
    const chartHeight = 300; // Reduced height for mobile
    const padding = 30; // Reduced padding for mobile
    const usableHeight = chartHeight - 2 * padding;
    const usableWidth = chartWidth - 2 * padding;

    // Find min/max prices for scaling with validation
    const prices = validPriceData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Prevent division by zero and ensure valid price range
    if (minPrice === maxPrice || !isFinite(minPrice) || !isFinite(maxPrice)) {
      return (
        <div className="w-full h-64 bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 rounded-lg border border-white/20 flex items-center justify-center">
          <div className="text-center text-yellow-400">
            <div className="text-2xl mb-2">📈</div>
            <div>Flat price data</div>
            <div className="text-sm">Price hasn't changed in this period</div>
          </div>
        </div>
      );
    }
    
    const priceRange = maxPrice - minPrice;

    // Create SVG path for price line (LINE CHART, not bars!)
    const pricePoints = validPriceData
      .map((data, index) => {
        const x = padding + (index / (validPriceData.length - 1)) * usableWidth;
        const y = padding + usableHeight - ((data.price - minPrice) / priceRange) * usableHeight;
        
        // Validate coordinates to prevent NaN
        if (!isFinite(x) || !isFinite(y)) {
          return null;
        }
        
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .filter(Boolean) // Remove null entries
      .join(' ');

    // Validate that we have a valid path
    if (!pricePoints || pricePoints.trim() === '') {
      return (
        <div className="w-full h-64 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-lg border border-white/20 flex items-center justify-center">
          <div className="text-center text-red-400">
            <div className="text-2xl mb-2">⚠️</div>
            <div>Invalid chart data</div>
            <div className="text-sm">Unable to generate chart path</div>
          </div>
        </div>
      );
    }

    // Create sentiment dots ON the price line at the same timestamps
    const sentimentDots = sentimentData.length > 0 ? sentimentData
      .filter(sentiment => 
        sentiment && 
        sentiment.timestamp instanceof Date && 
        !isNaN(sentiment.timestamp.getTime())
      )
      .map((sentiment, index) => {
        // FIXED APPROACH: Use same X-coordinate calculation as price line
        const sentimentTime = sentiment.timestamp.getTime();
        
        // Find the closest price data point to this sentiment timestamp
        let closestIndex = 0;
        let minTimeDiff = Infinity;
        
        for (let i = 0; i < validPriceData.length; i++) {
          const priceTime = validPriceData[i].timestamp.getTime();
          const timeDiff = Math.abs(sentimentTime - priceTime);
          
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestIndex = i;
          }
        }
        
        // Use the SAME X-coordinate calculation as the price line
        const x = padding + (closestIndex / (validPriceData.length - 1)) * usableWidth;
        
        // Y position: Use the price from the closest data point
        const closestPrice = validPriceData[closestIndex].price;
        const y = padding + usableHeight - ((closestPrice - minPrice) / priceRange) * usableHeight;
        
        // Validate coordinates to prevent NaN
        if (!isFinite(x) || !isFinite(y)) {
          return null; // Skip invalid coordinates
        }
        
        // Color based on sentiment
        const color = sentiment.sentiment === 'positive' ? '#10B981' : 
                     sentiment.sentiment === 'negative' ? '#EF4444' : '#6B7280';
        
        // Check if this dot should be highlighted
        const isHighlighted = highlightedMentionIndex === index;
        if (isHighlighted) {
          console.log(`✨ Highlighting sentiment dot ${index}: highlightedMentionIndex=${highlightedMentionIndex}, current index=${index}`);
        }
        const dotRadius = isHighlighted ? 8 : 5;
        const strokeWidth = isHighlighted ? 3 : 2;
        const strokeColor = isHighlighted ? '#FCD34D' : 'white'; // Gold highlight
        
        return (
          <g key={`sentiment-${index}`}>
            <circle
              cx={x}
              cy={y}
              r={dotRadius}
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:r-7 transition-all duration-200"
              onClick={() => {
                if (onMentionSelect) {
                  onMentionSelect(index);
                }
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const svgRect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                if (svgRect) {
                  setTooltip({
                    show: true,
                    text: sentiment.text,
                    sentiment: sentiment.sentiment,
                    author: sentiment.author.displayName || sentiment.author.username,
                    x: svgRect.left + x, // Use SVG-relative positioning
                    y: svgRect.top + y - 20, // Position above the dot
                    timestamp: sentiment.timestamp // Pass timestamp to tooltip
                  });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        );
      })
      .filter(Boolean) : []; // Return empty array if no sentiment data
    
    // Add Farcaster status indicator if unavailable
    const farcasterIndicator = farcasterStatus === 'unavailable' ? (
      <g>
        <circle
          cx={padding + 20}
          cy={padding + 20}
          r="6"
          fill="#EF4444"
          stroke="white"
          strokeWidth="2"
        />
        <text x={padding + 30} y={padding + 25} fill="#EF4444" fontSize="10" fontWeight="bold">
          Farcaster Down
        </text>
      </g>
    ) : null;

    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Price line (LINE CHART!) */}
          <path
            d={pricePoints}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Sentiment dots ON the price line */}
          {sentimentDots}
          
          {/* Farcaster status indicator */}
          {farcasterIndicator}
          
          {/* Y-axis labels */}
          <text x="10" y={padding + 10} fill="#9CA3AF" fontSize="12">${maxPrice.toFixed(6)}</text>
          <text x="10" y={padding + usableHeight/2} fill="#9CA3AF" fontSize="12">${((maxPrice + minPrice) / 2).toFixed(6)}</text>
          <text x="10" y={padding + usableHeight - 10} fill="#9CA3AF" fontSize="12">${minPrice.toFixed(6)}</text>
          
          {/* X-axis labels */}
          <text x={padding} y={chartHeight - 10} fill="#9CA3AF" fontSize="12">
            {timeRange === '1h' ? '1h ago' : timeRange === '24h' ? '24h ago' : `${timeRange} ago`}
          </text>
          <text x={padding + usableWidth/2} y={chartHeight - 10} fill="#9CA3AF" fontSize="12">
            {timeRange === '1h' ? '30m ago' : timeRange === '24h' ? '12h ago' : `${timeRange === '7d' ? '3.5d' : timeRange === '30d' ? '15d' : '45d'} ago`}
          </text>
          <text x={padding + usableWidth} y={chartHeight - 10} fill="#9CA3AF" fontSize="12">Now</text>
        </svg>
        
        {/* Custom Tooltip */}
        {tooltip && (
          <div 
            className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg border border-gray-700 max-w-xs"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%)'
            }}
          >
            {/* Author and Timestamp */}
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-blue-300 font-medium">
                  @{tooltip.author}
                </span>
              </div>
              <div className="text-gray-400">
                {tooltip.timestamp ? 
                  new Date(tooltip.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : 'Unknown time'
                }
              </div>
            </div>
            
            {/* Sentiment and Text */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block w-2 h-2 rounded-full ${
                tooltip.sentiment === 'positive' ? 'bg-green-500' : 
                tooltip.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
              }`}></span>
              <span className="font-semibold capitalize">{tooltip.sentiment}</span>
            </div>
            <div className="text-gray-200 text-xs leading-relaxed">{tooltip.text}</div>
          </div>
        )}
        
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Trading Chart Section - Always visible */}
      <div className="bg-gradient-to-br from-gray-600/20 to-gray-700/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">📊 $ETH Trading Data</h3>
            <p className="text-gray-300 text-xs">Price movement with Farcaster sentiment overlay</p>
          </div>
        </div>
        
        {/* Live Data Status - Compact */}
        <div className="flex items-center gap-3 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400">Live</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300">
            {mounted ? `Updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
          </span>
        </div>
        
        {/* Key Metrics - Compact Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-500/20 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">${currentPrice?.toFixed(2) || '0.00'}</div>
            <div className="text-blue-200 text-xs">Current</div>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</div>
            <div className="text-purple-200 text-xs">Change</div>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">{priceData.length}</div>
            <div className="text-purple-200 text-xs">Points</div>
          </div>
        </div>
          
        {/* Chart */}
        {renderChart()}
        
        {/* Legend - Compact */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-200">Price</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-200">Positive</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-200">Negative</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-gray-200">Neutral</span>
          </div>
          {highlightedMentionIndex !== null && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full border border-yellow-200"></div>
              <span className="text-yellow-200">Selected</span>
            </div>
          )}
          {farcasterStatus === 'unavailable' && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-200">Farcaster Down</span>
            </div>
          )}
        </div>
        
        {/* No sentiment data message - Compact */}
        {sentimentData.length === 0 && (
          <div className="mt-3 text-center text-yellow-400 text-xs">
            <div className="flex items-center justify-center gap-1">
              <span>📊</span>
              <span>No sentiment data for {timeRange}</span>
            </div>
            <div className="text-yellow-300 text-xs mt-1">
              Try longer time ranges (24h, 7d)
            </div>
          </div>
        )}
        
        {/* Update Status - Compact */}
        <div className="mt-3 text-center text-xs text-gray-400">
          {mounted ? `Updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
        </div>
      </div>
    </div>
  );
}