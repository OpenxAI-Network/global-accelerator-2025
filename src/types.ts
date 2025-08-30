export interface Threat {
  id: string;
  chain: string;
  txHash: string;
  from: string;
  to: string;
  value: string;
  type: string;
  severity: number;
  timestamp: string;
  description: string;
  aiAnalysis: string;
  patterns: string[];
  riskIndicators: {
    name: string;
    value: number;
  }[];
  recommendedActions: {
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }[];
}

export interface ChainStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  threats: number;
}

export interface SecurityOverview {
  totalThreats: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  protectedValue: string;
  chains: ChainStatus[];
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  chain: string;
  detectedAt: string;
  actionTaken: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

export interface Transaction {
  id: string;
  hash: string;
  chain: string;
  from: string;
  to: string;
  value: string;
  threatLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  threatType?: string;
  timestamp: string;
}

export interface UserSettings {
  permissions: {
    autoFreeze: boolean;
    requireConfirmation: boolean;
    crossChainOperations: boolean;
    aiAnalysis: boolean;
    realTimeMonitoring: boolean;
    emergencyStop: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    telegram: boolean;
    discord: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    biometricAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    ipWhitelist: boolean;
  };
}

export interface SecurityMetrics {
  totalThreats: number;
  threatsByChain: Record<string, number>;
  threatsByType: Record<string, number>;
  averageResponseTime: number;
  successRate: number;
  lastUpdated: string;
}

export interface CrossChainOperation {
  id: string;
  sourceChain: string;
  targetChain: string;
  operation: 'freeze' | 'unfreeze' | 'transfer' | 'reverse';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: string;
  details: string;
}

export interface AIAnalysisResult {
  threatId: string;
  confidence: number;
  analysis: string;
  patterns: string[];
  recommendations: string[];
  riskScore: number;
  timestamp: string;
}

export interface NotificationConfig {
  id: string;
  type: 'email' | 'push' | 'sms' | 'telegram' | 'discord';
  enabled: boolean;
  channels: string[];
  frequency: 'immediate' | 'hourly' | 'daily';
  severity: 'all' | 'high' | 'critical';
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number;
  }[];
  actions: {
    type: 'freeze' | 'alert' | 'block' | 'log';
    parameters: Record<string, any>;
  }[];
  enabled: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
} 