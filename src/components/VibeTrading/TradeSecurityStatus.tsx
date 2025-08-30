'use client';

import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface SecurityStatus {
  block: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  recommendations: string[];
  securityScore: number;
  timestamp: string;
}

interface TradeSecurityStatusProps {
  trade: {
    token: string;
    amount: number;
    side: 'buy' | 'sell';
    user?: any;
  };
  onSecurityChange?: (status: SecurityStatus) => void;
}

export default function TradeSecurityStatus({ trade, onSecurityChange }: TradeSecurityStatusProps) {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkTradeSecurity();
  }, [trade]);

  const checkTradeSecurity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the main trade API endpoint for security checks
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trade),
      });

      if (response.status === 403) {
        // Trade blocked by AEGIS - this is expected for security threats
        const blockedTrade = await response.json();
        setStatus({
          block: true,
          threatLevel: 'critical',
          warnings: [blockedTrade.error],
          recommendations: ['Review trade parameters', 'Contact support if needed'],
          securityScore: 0,
          timestamp: new Date().toISOString()
        });
        
        if (onSecurityChange) {
          onSecurityChange({
            block: true,
            threatLevel: 'critical',
            warnings: [blockedTrade.error],
            recommendations: ['Review trade parameters', 'Contact support if needed'],
            securityScore: 0,
            timestamp: new Date().toISOString()
          });
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Security check failed');
      }

      // Trade passed security checks
      const tradeResult = await response.json();
      const securityStatus = {
        block: false,
        threatLevel: 'low',
        warnings: [],
        recommendations: ['Trade approved by AEGIS security system'],
        securityScore: tradeResult.securityScore || 100,
        timestamp: new Date().toISOString()
      };
      
      setStatus(securityStatus);
      
      // Notify parent component
      if (onSecurityChange) {
        onSecurityChange(securityStatus);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Security check failed');
      console.error('Trade security check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white">Checking trade security...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-red-300 font-medium">Security Check Failed</div>
            <div className="text-red-200 text-sm">{error}</div>
          </div>
        </div>
        <button
          onClick={checkTradeSecurity}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Security Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Trade Security Status</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getThreatLevelColor(status.threatLevel)}`}>
          {status.threatLevel.toUpperCase()}
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-white/5 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">Security Score</span>
          <span className={`text-lg font-bold ${getSecurityScoreColor(status.securityScore)}`}>
            {status.securityScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              status.securityScore >= 80 ? 'bg-green-500' :
              status.securityScore >= 60 ? 'bg-yellow-500' :
              status.securityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${status.securityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Trade Status */}
      <div className={`rounded-lg p-3 border ${
        status.block 
          ? 'bg-red-500/20 border-red-500/30' 
          : 'bg-green-500/20 border-green-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {status.block ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          <div>
            <div className={`font-medium ${
              status.block ? 'text-red-300' : 'text-green-300'
            }`}>
              {status.block ? 'Trade Blocked' : 'Trade Approved'}
            </div>
            <div className={`text-sm ${
              status.block ? 'text-red-200' : 'text-green-200'
            }`}>
              {status.block 
                ? 'Security checks failed - trade cannot proceed'
                : 'All security checks passed - trade can proceed'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {status.warnings.length > 0 && (
        <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-yellow-300 font-medium mb-2">Security Warnings</div>
              <ul className="space-y-1">
                {status.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-200 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {status.recommendations.length > 0 && (
        <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-blue-300 font-medium mb-2">Security Recommendations</div>
              <ul className="space-y-1">
                {status.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-blue-200 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-gray-400 text-xs text-center">
        Last updated: {new Date(status.timestamp).toLocaleTimeString()}
      </div>

      {/* Refresh Button */}
      <button
        onClick={checkTradeSecurity}
        className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors text-sm"
      >
        🔄 Refresh Security Check
      </button>
    </div>
  );
}
