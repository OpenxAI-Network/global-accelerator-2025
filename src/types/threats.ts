export interface ThreatItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  chain: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating' | 'mitigated';
  confidence: number; // 0-100
  affectedAssets: string[];
  riskScore: number; // 0-100
  mitigationSteps: string[];
  sourceAddress?: string;
  destinationAddress?: string;
  transactionHash?: string;
  estimatedLoss?: string;
  category: 'exploit' | 'anomaly' | 'bridge' | 'contract' | 'social' | 'network';
}

export interface ThreatPattern {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  mitigationStrategy: string;
  examples: string[];
}

export interface RiskMetrics {
  totalThreats: number;
  protectedValue: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  totalRiskScore: number;
  averageRiskScore: number;
  threatsByChain: Record<string, number>;
  threatsByCategory: Record<string, number>;
  lastUpdated: string;
}

export interface ChainInfo {
  id: string;
  name: string;
  icon: any;
  color: string;
  status: 'healthy' | 'warning' | 'critical';
  lastBlock: number;
  avgBlockTime: number;
  activeThreats: number;
}
