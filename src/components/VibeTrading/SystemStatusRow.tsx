'use client';

import React, { useState, useEffect } from 'react';

interface SystemStatus {
  database: 'online' | 'offline' | 'checking';
  ai: 'online' | 'offline' | 'checking';
  priceFeeds: 'online' | 'offline' | 'checking';
  farcaster: 'online' | 'offline' | 'checking';
  baseChain: 'online' | 'offline' | 'checking';
}

export default function SystemStatusRow() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'checking',
    ai: 'checking',
    priceFeeds: 'checking',
    farcaster: 'checking',
    baseChain: 'checking'
  });

  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(() => {
      checkSystemStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      // For now, simulate system status checks
      // In production, this would check your AEGIS backend
      const mockStatus: SystemStatus = {
        database: 'online',
        ai: 'online',
        priceFeeds: 'online',
        farcaster: 'online',
        baseChain: 'online'
      };

      setSystemStatus(mockStatus);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      default: return '🟡';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      default: return 'Checking...';
    }
  };

  const getComponentDescription = (component: keyof SystemStatus) => {
    const descriptions = {
      database: 'PostgreSQL database for storing price history and sentiment data',
      ai: 'Ollama AI for sentiment analysis and trading insights',
      priceFeeds: 'Chainlink price feeds for real-time token prices',
      farcaster: 'Farcaster API for social sentiment data collection',
      baseChain: 'Base chain connection for trading and transactions'
    };
    return descriptions[component];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">🔧 System Status</h3>
        <div className="text-sm text-gray-400">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(systemStatus).map(([component, status]) => (
          <div
            key={component}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getStatusIcon(status)}</span>
              <div>
                <div className="text-white font-medium capitalize">
                  {component.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {getStatusText(status)}
                </div>
              </div>
            </div>
            
            <div className="text-gray-400 text-xs">
              {getComponentDescription(component as keyof SystemStatus)}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={checkSystemStatus}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            🔄 Refresh Status
          </button>
          <button
            onClick={() => window.open('https://status.base.org', '_blank')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            📊 Base Status
          </button>
          <button
            onClick={() => window.open('https://chainlinkprice.com', '_blank')}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            💰 Price Feeds
          </button>
          <button
            onClick={() => window.open('https://farcaster.xyz', '_blank')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            📱 Farcaster
          </button>
        </div>
      </div>

      {/* System Health Summary */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">System Health</h4>
            <div className="text-sm text-gray-400">
              Overall system status and performance metrics
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {Object.values(systemStatus).filter(s => s === 'online').length}/{Object.keys(systemStatus).length}
            </div>
            <div className="text-sm text-gray-400">Components Online</div>
          </div>
        </div>
        
        {/* Health Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(Object.values(systemStatus).filter(s => s === 'online').length / Object.keys(systemStatus).length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
