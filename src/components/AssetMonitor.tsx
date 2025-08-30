import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Shield, AlertTriangle, Activity } from 'lucide-react';

interface Asset {
  name: string;
  symbol: string;
  value: string;
  usdValue: number;
  change24h: number;
  threat: 'none' | 'low' | 'medium' | 'high' | 'critical';
  chain: string;
  icon: any;
  color: string;
  lastUpdate: Date;
}

interface AssetMonitorProps {
  connectedWallet?: string;
}

const AssetMonitor: React.FC<AssetMonitorProps> = ({ connectedWallet }) => {
  const [assets, setAssets] = useState<Asset[]>([
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      value: '1.2 BTC',
      usdValue: 52400,
      change24h: 2.4,
      threat: 'low',
      chain: 'Bitcoin',
      icon: DollarSign,
      color: '#f7931a',
      lastUpdate: new Date()
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      value: '15 ETH',
      usdValue: 37500,
      change24h: -1.2,
      threat: 'medium',
      chain: 'Ethereum',
      icon: DollarSign,
      color: '#627eea',
      lastUpdate: new Date()
    },
    {
      name: 'USDC',
      symbol: 'USDC',
      value: '50,000 USDC',
      usdValue: 50000,
      change24h: 0.1,
      threat: 'none',
      chain: 'Ethereum',
      icon: DollarSign,
      color: '#4cc9f0',
      lastUpdate: new Date()
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      value: '200 SOL',
      usdValue: 18600,
      change24h: 5.8,
      threat: 'low',
      chain: 'Solana',
      icon: DollarSign,
      color: '#9945ff',
      lastUpdate: new Date()
    }
  ]);

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        setAssets(prev => prev.map(asset => ({
          ...asset,
          change24h: asset.change24h + (Math.random() - 0.5) * 0.5,
          usdValue: asset.usdValue * (1 + (Math.random() - 0.5) * 0.02),
          lastUpdate: new Date()
        })));
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      case 'none': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getThreatIcon = (threat: string) => {
    switch (threat) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return 'ℹ️';
      case 'none': return '✅';
      default: return '⚪';
    }
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.usdValue, 0);
  const totalChange = assets.reduce((sum, asset) => sum + (asset.usdValue * asset.change24h / 100), 0);
  const totalChangePercent = (totalChange / totalValue) * 100;

  return (
    <div className="glass-effect border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Asset Monitor</h2>
          <p className="text-sm text-gray-400">
            {connectedWallet ? `Monitoring ${connectedWallet.substring(0, 6)}...${connectedWallet.substring(38)}` : 'Real-time portfolio tracking'}
          </p>
        </div>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isMonitoring 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}
        >
          <Activity size={16} className={isMonitoring ? 'animate-pulse' : ''} />
          {isMonitoring ? 'Monitoring' : 'Start Monitor'}
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-green-400" />
            <span className="text-gray-400 text-sm">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
        
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {totalChangePercent >= 0 ? (
              <TrendingUp size={16} className="text-green-400" />
            ) : (
              <TrendingDown size={16} className="text-red-400" />
            )}
            <span className="text-gray-400 text-sm">24h Change</span>
          </div>
          <div className={`text-2xl font-bold ${totalChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
          </div>
        </div>
        
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-blue-400" />
            <span className="text-gray-400 text-sm">Protected</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {assets.filter(a => a.threat === 'none' || a.threat === 'low').length}/{assets.length}
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        {assets.map((asset, index) => (
          <div key={index} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                >
                  <asset.icon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{asset.name}</span>
                    <span className="text-gray-400 text-sm">({asset.symbol})</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(asset.threat)}`}>
                      {getThreatIcon(asset.threat)} {asset.threat}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{asset.chain}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-white">{asset.value}</div>
                <div className="text-sm text-gray-400">
                  ${asset.usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className={`text-sm font-medium ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            {isMonitoring && (
              <div className="mt-3 text-xs text-gray-500">
                Last updated: {asset.lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {!connectedWallet && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertTriangle size={16} />
            Connect your wallet for real-time monitoring of your actual assets
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetMonitor;
