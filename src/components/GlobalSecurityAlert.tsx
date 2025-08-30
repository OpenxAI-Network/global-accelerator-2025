'use client';

import React from 'react';
import { AlertTriangle, X, Shield, Activity } from 'lucide-react';
import { useAegisSecurity } from '../contexts/AegisSecurityContext';

export default function GlobalSecurityAlert() {
  const { lastThreat, securityStatus, activeThreats, resolveThreat } = useAegisSecurity();

  if (!lastThreat || securityStatus === 'secure') {
    return null;
  }

  const getAlertStyles = () => {
    switch (securityStatus) {
      case 'critical':
        return 'bg-red-600 border-red-500 text-white';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500 text-white';
      default:
        return 'bg-blue-600 border-blue-500 text-white';
    }
  };

  const getAlertIcon = () => {
    switch (securityStatus) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-200" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-200" />;
      default:
        return <Shield className="w-5 h-5 text-blue-200" />;
    }
  };

  const getAlertTitle = () => {
    switch (securityStatus) {
      case 'critical':
        return '🚨 Critical Security Alert';
      case 'warning':
        return '⚠️ Security Warning';
      default:
        return '🔒 Security Notice';
    }
  };

  return (
    <div className={`sticky top-0 z-50 border-b ${getAlertStyles()}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getAlertIcon()}
            <div>
              <div className="font-semibold text-sm">
                {getAlertTitle()}
              </div>
              <div className="text-xs opacity-90">
                {lastThreat.message}
                {lastThreat.chain && (
                  <span className="ml-2 opacity-75">
                    • Chain: {lastThreat.chain}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Active threats counter */}
            <div className="flex items-center gap-2 text-xs opacity-90">
              <Activity className="w-4 h-4" />
              <span>
                {activeThreats.filter(t => !t.resolved).length} active
              </span>
            </div>
            
            {/* Resolve button */}
            <button
              onClick={() => resolveThreat(lastThreat.id)}
              className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Resolve
            </button>
            
            {/* Close button */}
            <button
              onClick={() => resolveThreat(lastThreat.id)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
