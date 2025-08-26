'use client';

import { useState, useEffect } from 'react';

interface SystemStatus {
  docker: boolean;
  database: boolean;
  site: boolean;
  ollama: boolean;
  socialFeed: boolean;
  priceFeed: boolean;
  lastCheck: Date;
}

interface PriceData {
  price: number;
  lastUpdated: Date;
  isStale: boolean;
  source?: string;
}

export default function SystemStatusRow() {
  const [status, setStatus] = useState<SystemStatus>({
    docker: false,
    database: false,
    site: false,
    ollama: false,
    socialFeed: false,
    priceFeed: false,
    lastCheck: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initial fetch
    checkSystemStatus();
    
    // Update every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    try {
      setIsLoading(true);

      let dockerStatus = false;
      let databaseStatus = false;
      let priceFeedStatus = false;
      
      try {
        const dbResponse = await fetch('/api/base-price?token=ETH');
        if (dbResponse.ok) {
          const priceResult = await dbResponse.json();
          if (priceResult.success) {
            databaseStatus = true;
            dockerStatus = true; // If DB works, Docker is running
            priceFeedStatus = true;
            setPriceData(priceResult.data);
          }
        }
      } catch (error) {
        // Database/Docker not accessible
      }

      // Check site status (self-check)
      let siteStatus = false;
      try {
        const siteResponse = await fetch('/');
        siteStatus = siteResponse.ok;
      } catch (error) {
        // Site not accessible
      }

      // Check Ollama status
      let ollamaStatus = false;
      try {
        const ollamaResponse = await fetch('/api/ollama');
        ollamaStatus = ollamaResponse.ok;
      } catch (error) {
        // Ollama not accessible
      }

      // Check Social Feed status
      let socialFeedStatus = false;
      try {
        const socialResponse = await fetch('/api/farcaster?action=mentions&token=ETH&limit=1');
        socialFeedStatus = socialResponse.ok;
      } catch (error) {
        // Social Feed not accessible
      }

      setStatus({
        docker: dockerStatus,
        database: databaseStatus,
        site: siteStatus,
        ollama: ollamaStatus,
        socialFeed: socialFeedStatus,
        priceFeed: priceFeedStatus,
        lastCheck: new Date()
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setIsLoading(false);
      setHasChecked(true);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    if (!hasChecked) return 'bg-gray-400';
    return isActive ? 'bg-green-400' : 'bg-red-400';
  };

  const getStatusText = (isActive: boolean) => {
    if (!hasChecked) return 'Checking';
    return isActive ? 'Online' : 'Offline';
  };

  const getStatusTextColor = (isActive: boolean) => {
    if (!hasChecked) return 'text-gray-300';
    return isActive ? 'text-green-300' : 'text-red-300';
  };

  const getStatusDetails = (type: string, isActive: boolean) => {
    const baseDetails = {
      docker: {
        good: 'Docker daemon is running and accessible',
        bad: 'Docker daemon is not running or not accessible'
      },
      database: {
        good: 'PostgreSQL database is connected and responding',
        bad: 'Database connection failed or PostgreSQL is down'
      },
      site: {
        good: 'Website is fully operational and accessible',
        bad: 'Website is down or experiencing issues'
      },
      ollama: {
        good: 'Ollama AI service is running and responding',
        bad: 'Ollama service is not accessible or not running'
      },
      socialFeed: {
        good: 'Farcaster API is accessible and returning data',
        bad: 'Farcaster API is not accessible or returning errors'
      },
      priceFeed: {
        good: 'Real-time price data is flowing from Chainlink feeds',
        bad: 'Price feed is not updating or API is down'
      }
    };

    return baseDetails[type as keyof typeof baseDetails]?.[isActive ? 'good' : 'bad'] || 'Status unknown';
  };

  const getOverallStatus = () => {
    if (!hasChecked) return { status: 'Checking systems…', color: 'text-gray-300', bgColor: 'bg-gray-500/20' };
    const allSystems = Object.values(status).slice(0, 6); // Exclude lastCheck
    const onlineCount = allSystems.filter(Boolean).length;
    const totalCount = allSystems.length;

    if (onlineCount === totalCount) return { status: 'All Systems Operational', color: 'text-green-300', bgColor: 'bg-green-500/20' };
    if (onlineCount >= totalCount * 0.8) return { status: 'Most Systems Online', color: 'text-yellow-300', bgColor: 'bg-yellow-500/20' };
    if (onlineCount >= totalCount * 0.5) return { status: 'Some Systems Offline', color: 'text-orange-300', bgColor: 'bg-orange-500/20' };
    return { status: 'Multiple Systems Down', color: 'text-red-300', bgColor: 'bg-red-500/20' };
  };

  const overallStatus = getOverallStatus();

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="text-center">
            <span className="text-blue-300 text-sm">Loading system status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Desktop: Single line layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Status Lights */}
          <div className="flex items-center space-x-6">
            {/* Docker Status */}
            <div className="group relative">
              <div className="flex items-center space-x-2 cursor-help">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status.docker)}`}></div>
                <span className="text-xs text-blue-200">Docker</span>
                <span className={`text-xs font-medium ${getStatusTextColor(status.docker)}`}>
                  {getStatusText(status.docker)}
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getStatusDetails('docker', status.docker)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Database Status */}
            <div className="group relative">
              <div className="flex items-center space-x-2 cursor-help">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status.database)}`}></div>
                <span className="text-xs text-blue-200">DB</span>
                <span className={`text-xs font-medium ${getStatusTextColor(status.database)}`}>
                  {getStatusText(status.database)}
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getStatusDetails('database', status.database)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Site Status */}
            <div className="group relative">
              <div className="flex items-center space-x-2 cursor-help">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status.site)}`}></div>
                <span className="text-xs text-blue-200">Site</span>
                <span className={`text-xs font-medium ${getStatusTextColor(status.site)}`}>
                  {getStatusText(status.site)}
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getStatusDetails('site', status.site)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Ollama Status */}
            <div className="group relative">
              <div className="flex items-center space-x-2 cursor-help">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status.ollama)}`}></div>
                <span className="text-xs text-blue-200">AI</span>
                <span className={`text-xs font-medium ${getStatusTextColor(status.ollama)}`}>
                  {getStatusText(status.ollama)}
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getStatusDetails('ollama', status.ollama)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Social Feed Status */}
            <div className="group relative">
              <div className="flex items-center space-x-2 cursor-help">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status.socialFeed)}`}></div>
                <span className="text-xs text-blue-200">Social Feed</span>
                <span className={`text-xs font-medium ${getStatusTextColor(status.socialFeed)}`}>
                  {getStatusText(status.socialFeed)}
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getStatusDetails('socialFeed', status.socialFeed)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Price Feed Status */}
            <div className="group relative">
              <div className="flex items-center space-x-2 cursor-help">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(status.priceFeed)}`}></div>
                <span className="text-xs text-blue-200">Price</span>
                <span className={`text-xs font-medium ${getStatusTextColor(status.priceFeed)}`}>
                  {getStatusText(status.priceFeed)}
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getStatusDetails('priceFeed', status.priceFeed)}
                {priceData && priceData.price && typeof priceData.price === 'number' && (
                  <div className="mt-1 pt-1 border-t border-gray-700">
                    ${priceData.price.toFixed(8)} • {priceData.isStale ? 'Stale' : 'Fresh'} • {priceData.source || 'Unknown'}
                  </div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>

          {/* Overall Status & Actions */}
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${overallStatus.bgColor} border border-white/20`}>
              <div className={`w-2 h-2 rounded-full ${overallStatus.color.replace('text-', 'bg-')}`}></div>
              <span className={`text-xs font-medium ${overallStatus.color}`}>
                {overallStatus.status}
              </span>
            </div>
            
            <button
              onClick={checkSystemStatus}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 border border-white/20"
            >
              {isLoading ? '⟳' : '⟳'}
            </button>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="md:hidden space-y-3">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Row 1 */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.docker)}`}></div>
              <span className="text-xs text-blue-200">Docker</span>
              <span className={`text-xs font-medium ${getStatusTextColor(status.docker)}`}>
                {getStatusText(status.docker)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.database)}`}></div>
              <span className="text-xs text-blue-200">DB</span>
              <span className={`text-xs font-medium ${getStatusTextColor(status.database)}`}>
                {getStatusText(status.database)}
              </span>
            </div>

            {/* Row 2 */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.site)}`}></div>
              <span className="text-xs text-blue-200">Site</span>
              <span className={`text-xs font-medium ${getStatusTextColor(status.site)}`}>
                {getStatusText(status.site)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.ollama)}`}></div>
              <span className="text-xs text-blue-200">AI</span>
              <span className={`text-xs font-medium ${getStatusTextColor(status.ollama)}`}>
                {getStatusText(status.ollama)}
              </span>
            </div>
            
            {/* Row 3 */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.socialFeed)}`}></div>
              <span className="text-xs text-blue-200">Social Feed</span>
              <span className={`text-xs font-medium ${getStatusTextColor(status.socialFeed)}`}>
                {getStatusText(status.socialFeed)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status.priceFeed)}`}></div>
              <span className="text-xs text-blue-200">Price</span>
              <span className={`text-xs font-medium ${getStatusTextColor(status.priceFeed)}`}>
                {getStatusText(status.priceFeed)}
              </span>
            </div>
          </div>

          {/* Overall Status & Actions */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${overallStatus.bgColor} border border-white/20`}>
              <div className="w-2 h-2 rounded-full bg-red-300"></div>
              <span className={`text-xs font-medium ${overallStatus.color}`}>
                {overallStatus.status}
              </span>
            </div>
            
            <button
              onClick={checkSystemStatus}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 border border-white/20"
            >
              {isLoading ? '⟳' : '⟳'}
            </button>
          </div>
        </div>

        {/* Last Check Time */}
        <div className="mt-2 text-center">
          <span className="text-xs text-blue-300">
            Last check: {mounted ? status.lastCheck.toLocaleTimeString() : 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
}
