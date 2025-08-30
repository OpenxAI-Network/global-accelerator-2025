'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import TradeSecurityStatus from './TradeSecurityStatus';

interface TradeFormProps {
  selectedToken: string;
  onTradeExecute?: (trade: any) => void;
}

interface Trade {
  token: string;
  amount: number;
  side: 'buy' | 'sell';
  user?: any;
}

interface SecurityStatus {
  block: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  recommendations: string[];
  securityScore: number;
  timestamp: string;
}

export default function TradeForm({ selectedToken, onTradeExecute }: TradeFormProps) {
  const [trade, setTrade] = useState<Trade>({
    token: selectedToken,
    amount: 0,
    side: 'buy'
  });
  
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  useEffect(() => {
    setTrade(prev => ({ ...prev, token: selectedToken }));
  }, [selectedToken]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setTrade(prev => ({ ...prev, amount }));
  };

  const handleSideChange = (side: 'buy' | 'sell') => {
    setTrade(prev => ({ ...prev, side }));
  };

  const handleSecurityChange = (status: SecurityStatus) => {
    setSecurityStatus(status);
  };

  const handleTradeExecute = async () => {
    if (!securityStatus || securityStatus.block) {
      alert('Trade cannot proceed due to security concerns. Please review the security status.');
      return;
    }

    if (trade.amount <= 0) {
      alert('Please enter a valid trade amount.');
      return;
    }

    setIsExecuting(true);
    
    try {
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const executedTrade = {
        ...trade,
        id: 'trade_' + Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        status: 'executed',
        securityScore: securityStatus.securityScore,
        gasUsed: Math.random() * 0.01,
        gasPrice: Math.random() * 50 + 20
      };

      console.log('🚀 Trade executed:', executedTrade);
      
      if (onTradeExecute) {
        onTradeExecute(executedTrade);
      }

      // Reset form
      setTrade(prev => ({ ...prev, amount: 0 }));
      setSecurityStatus(null);
      
      alert(`Trade ${trade.side === 'buy' ? 'purchased' : 'sold'} ${trade.amount} ${trade.token} successfully!`);
      
    } catch (error) {
      console.error('Trade execution failed:', error);
      alert('Trade execution failed. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  const getSecurityStatusColor = () => {
    if (!securityStatus) return 'text-gray-400';
    
    switch (securityStatus.threatLevel) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSecurityStatusIcon = () => {
    if (!securityStatus) return <Shield className="w-5 h-5" />;
    
    if (securityStatus.block) return <XCircle className="w-5 h-5" />;
    if (securityStatus.threatLevel === 'low') return <CheckCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Trade Form Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Execute Trade</h3>
        <div className="flex items-center gap-2">
          {getSecurityStatusIcon()}
          <span className={`text-sm font-medium ${getSecurityStatusColor()}`}>
            {securityStatus ? securityStatus.threatLevel.toUpperCase() : 'CHECKING'}
          </span>
        </div>
      </div>

      {/* Trade Form */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/20">
        {/* Token Selection */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Token</label>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-white font-medium">
            {selectedToken}
          </div>
        </div>

        {/* Trade Side Selection */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Trade Side</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSideChange('buy')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                trade.side === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Buy
            </button>
            <button
              onClick={() => handleSideChange('sell')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                trade.side === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Sell
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Amount (USD)</label>
          <input
            type="number"
            value={trade.amount || ''}
            onChange={handleAmountChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Trade Summary */}
        {trade.amount > 0 && (
          <div className="bg-white/5 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-300 mb-2">Trade Summary</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Action:</span>
                <span className={`font-medium ${
                  trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trade.side === 'buy' ? 'Buy' : 'Sell'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">${trade.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token:</span>
                <span className="text-white">{trade.token}</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Status Toggle */}
        <button
          onClick={() => setShowSecurityDetails(!showSecurityDetails)}
          className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" />
          {showSecurityDetails ? 'Hide' : 'Show'} Security Details
        </button>
      </div>

      {/* Security Status Details */}
      {showSecurityDetails && (
        <TradeSecurityStatus
          trade={trade}
          onSecurityChange={handleSecurityChange}
        />
      )}

      {/* Execute Trade Button */}
      <button
        onClick={handleTradeExecute}
        disabled={!securityStatus || securityStatus.block || trade.amount <= 0 || isExecuting}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          !securityStatus || securityStatus.block || trade.amount <= 0
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isExecuting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Executing Trade...
          </div>
        ) : (
          `${trade.side === 'buy' ? 'Buy' : 'Sell'} ${trade.token}`
        )}
      </button>

      {/* Security Notice */}
      <div className="text-xs text-gray-400 text-center">
        All trades are automatically checked by AEGIS security system before execution.
        {securityStatus && securityStatus.block && (
          <div className="text-red-400 mt-1">
            ⚠️ Trade blocked due to security concerns
          </div>
        )}
      </div>
    </div>
  );
}
