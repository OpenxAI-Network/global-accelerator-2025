'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  chain?: string;
  resolved: boolean;
}

interface AegisSecurityContextType {
  lastThreat: SecurityThreat | null;
  activeThreats: SecurityThreat[];
  securityStatus: 'secure' | 'warning' | 'critical';
  addThreat: (threat: SecurityThreat) => void;
  resolveThreat: (threatId: string) => void;
  clearThreats: () => void;
  getSecuritySummary: () => {
    totalThreats: number;
    criticalThreats: number;
    resolvedThreats: number;
  };
}

const AegisSecurityContext = createContext<AegisSecurityContextType | undefined>(undefined);

export function useAegisSecurity() {
  const context = useContext(AegisSecurityContext);
  if (context === undefined) {
    throw new Error('useAegisSecurity must be used within an AegisSecurityProvider');
  }
  return context;
}

interface AegisSecurityProviderProps {
  children: ReactNode;
}

export function AegisSecurityProvider({ children }: AegisSecurityProviderProps) {
  const [lastThreat, setLastThreat] = useState<SecurityThreat | null>(null);
  const [activeThreats, setActiveThreats] = useState<SecurityThreat[]>([]);
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'critical'>('secure');

  // Update security status based on active threats
  useEffect(() => {
    const criticalThreats = activeThreats.filter(t => t.severity === 'critical');
    const highThreats = activeThreats.filter(t => t.severity === 'high');
    
    if (criticalThreats.length > 0) {
      setSecurityStatus('critical');
    } else if (highThreats.length > 0 || activeThreats.length > 5) {
      setSecurityStatus('warning');
    } else {
      setSecurityStatus('secure');
    }
  }, [activeThreats]);

  // Simulate incoming security threats for demonstration
  useEffect(() => {
    const threatTypes = [
      'suspicious_transaction',
      'cross_chain_anomaly',
      'amount_threshold_exceeded',
      'geographic_anomaly',
      'time_pattern_anomaly'
    ];

    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];

    const simulateThreat = () => {
      if (Math.random() > 0.95) { // 5% chance every interval
        const threat: SecurityThreat = {
          id: 'threat_' + Math.random().toString(36).substring(7),
          type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          message: `Security threat detected: ${threatTypes[Math.floor(Math.random() * threatTypes.length)].replace('_', ' ')}`,
          timestamp: new Date().toISOString(),
          chain: ['ethereum', 'base', 'polygon'][Math.floor(Math.random() * 3)],
          resolved: false
        };

        addThreat(threat);
      }
    };

    // Simulate threats every 30 seconds
    const interval = setInterval(simulateThreat, 30000);
    
    // Initial threat simulation
    setTimeout(simulateThreat, 5000);

    return () => clearInterval(interval);
  }, []);

  const addThreat = (threat: SecurityThreat) => {
    setActiveThreats(prev => [threat, ...prev]);
    setLastThreat(threat);
    
    // Auto-resolve low severity threats after 5 minutes
    if (threat.severity === 'low') {
      setTimeout(() => {
        resolveThreat(threat.id);
      }, 5 * 60 * 1000);
    }
  };

  const resolveThreat = (threatId: string) => {
    setActiveThreats(prev => 
      prev.map(t => 
        t.id === threatId ? { ...t, resolved: true } : t
      )
    );
  };

  const clearThreats = () => {
    setActiveThreats([]);
    setLastThreat(null);
  };

  const getSecuritySummary = () => {
    const totalThreats = activeThreats.length;
    const criticalThreats = activeThreats.filter(t => t.severity === 'critical').length;
    const resolvedThreats = activeThreats.filter(t => t.resolved).length;

    return {
      totalThreats,
      criticalThreats,
      resolvedThreats
    };
  };

  const value: AegisSecurityContextType = {
    lastThreat,
    activeThreats,
    securityStatus,
    addThreat,
    resolveThreat,
    clearThreats,
    getSecuritySummary
  };

  return (
    <AegisSecurityContext.Provider value={value}>
      {children}
    </AegisSecurityContext.Provider>
  );
}
