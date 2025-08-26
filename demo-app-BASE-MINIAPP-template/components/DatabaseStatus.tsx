'use client';

import { useState, useEffect } from 'react';

interface DatabaseStatus {
  connected: boolean;
  host: string;
  port: string;
  database: string;
  user: string;
  lastCheck: Date;
  error?: string;
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkDatabaseStatus = async () => {
    try {
      setIsLoading(true);
      
      // Test the price API endpoint to check database connectivity
      const response = await fetch('/api/base-price?token=ETH');
      const data = await response.json();
      
      if (data.success) {
        setStatus({
          connected: true,
          host: 'localhost',
          port: '5432',
          database: 'vibe_trading',
          user: 'postgres',
          lastCheck: new Date()
        });
      } else {
        setStatus({
          connected: false,
          host: 'localhost',
          port: '5432',
          database: 'vibe_trading',
          user: 'postgres',
          lastCheck: new Date(),
          error: data.error || 'Unknown error'
        });
      }
    } catch (error) {
      setStatus({
        connected: false,
        host: 'localhost',
        port: '5432',
        database: 'vibe_trading',
        user: 'postgres',
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkDatabaseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-blue-200 text-sm">Checking database...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">🗄️ PostgreSQL Database</h4>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status.connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
          <span className={`text-xs font-medium ${status.connected ? 'text-green-300' : 'text-red-300'}`}>
            {status.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {status.connected ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-200">Host:</span>
              <span className="text-white font-mono">{status.host}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-200">Port:</span>
              <span className="text-white font-mono">{status.port}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-200">Database:</span>
              <span className="text-white font-mono">{status.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-200">User:</span>
              <span className="text-white font-mono">{status.user}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-br from-green-500/20 to-green-600/20 px-3 py-1 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-300 text-xs">Database Healthy</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-red-300 text-xs">
            <strong>Error:</strong> {status.error}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-br from-red-500/20 to-red-600/20 px-3 py-1 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-300 text-xs">Connection Failed</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-white/10">
        <div className="text-center">
          <span className="text-xs text-blue-300">
            Last checked: {status.lastCheck.toLocaleTimeString()}
          </span>
        </div>
        <div className="mt-2 text-center">
          <button
            onClick={checkDatabaseStatus}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
          >
            🔄 Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}
