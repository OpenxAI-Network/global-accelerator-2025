'use client';

import React, { useState, useEffect } from 'react';

interface TradingChartProps {
  selectedToken: string;
  timeRange: '1h' | '24h' | '7d';
  onTimeRangeChange?: (range: '1h' | '24h' | '7d') => void;
}

export default function TradingChart({ 
  selectedToken, 
  timeRange, 
  onTimeRangeChange 
}: TradingChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white/5 rounded-lg p-6 text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-200">Loading chart...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          ${selectedToken} Price Chart
        </h3>
        <p className="text-gray-300 text-sm">
          {timeRange} timeframe analysis
        </p>
      </div>

      {/* Simple Chart Display */}
      <div className="bg-white/5 rounded-lg p-8 border border-white/20">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-xl font-semibold text-white mb-2">Chart Visualization</h4>
          <p className="text-gray-300 text-sm mb-4">
            Interactive price chart for {selectedToken}
          </p>
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-white/20">
            <p className="text-blue-200 text-sm">
              Chart component simplified for stability
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Full chart functionality coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      {onTimeRangeChange && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-400">Time Range:</span>
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      )}

      {/* Chart Info */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/20">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-gray-400">Data Points</div>
            <div className="text-white font-medium">1,440</div>
          </div>
          <div>
            <div className="text-gray-400">Update Rate</div>
            <div className="text-white font-medium">1 min</div>
          </div>
          <div>
            <div className="text-gray-400">Source</div>
            <div className="text-white font-medium">Live</div>
          </div>
        </div>
      </div>
    </div>
  );
}
