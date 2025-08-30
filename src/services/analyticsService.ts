import { ethers } from 'ethers';

export interface LiquidityStats {
  chain: string;
  liquidity: number;
  change24h: number;
  totalUsers: number;
  avgAPY: number;
  utilization: number;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
  historicalData?: {
    month: string;
    liquidity: number;
    users: number;
    apy: number;
  }[];
}

export interface RiskModelData {
  month: string;
  avgCreditScore: number;
  liquidations: number;
  borrowRepayments: number;
  defaultRate: number;
  marketVolatility: number;
}

export interface RiskTrends {
  creditScoreTrend: 'improving' | 'declining';
  liquidationTrend: 'decreasing' | 'increasing';
  defaultRateTrend: 'improving' | 'worsening';
  volatilityTrend: 'stabilizing' | 'increasing';
}

export interface InterestRateTrends {
  month: string;
  ethereum: number;
  avalanche: number;
  solana: number;
  polygon: number;
  base: number;
  zetachain: number;
}

export interface InterestRateAnalysis {
  [chain: string]: {
    average: number;
    trend: 'increasing' | 'decreasing';
    volatility: number;
  };
}

export interface ProtocolHealth {
  overallScore: number;
  liquidityHealth: number;
  creditHealth: number;
  marketHealth: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
  metrics: {
    totalTVL: number;
    activeUsers: number;
    totalLoans: number;
    avgLoanSize: number;
    defaultRate: number;
    liquidationRate: number;
  };
}

export interface UserRiskProfile {
  creditScore: number;
  liquidationRisk: number;
  portfolioDiversification: number;
  repaymentHistory: number;
  collateralQuality: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  optimizationTips: string[];
  lastUpdated: string;
}

export interface AnalyticsSummary {
  totalLiquidity: number;
  totalUsers: number;
  avgCreditScore: number;
  protocolHealth: number;
  riskLevel: string;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AnalyticsService {
  private apiBaseUrl: string;
  private zetaConfig: any;

  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_ANALYTICS_API_URL || 'http://localhost:4002';
    this.zetaConfig = {
      rpcUrl: 'https://rpc.zetachain.net',
      chainId: 7000
    };
  }

  // Get cross-chain liquidity statistics
  async getLiquidityStats(chain?: string, timeRange?: string): Promise<LiquidityStats[]> {
    try {
      const params = new URLSearchParams();
      if (chain && chain !== 'all') params.append('chain', chain);
      if (timeRange) params.append('timeRange', timeRange);

      const response = await fetch(`${this.apiBaseUrl}/api/analytics/liquidity?${params}`);
      const data: ApiResponse<LiquidityStats[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch liquidity statistics');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching liquidity stats:', error);
      // Return mock data as fallback
      return this.getMockLiquidityStats();
    }
  }

  // Get AI risk modeling data
  async getRiskModelData(timeRange?: string, chain?: string): Promise<{ data: RiskModelData[]; trends: RiskTrends; lastUpdated: string }> {
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (chain) params.append('chain', chain);

      const response = await fetch(`${this.apiBaseUrl}/api/analytics/risk-model?${params}`);
      const data: ApiResponse<{ data: RiskModelData[]; trends: RiskTrends; lastUpdated: string }> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch risk model data');
      }
      
      return data.data!;
    } catch (error) {
      console.error('Error fetching risk model data:', error);
      // Return mock data as fallback
      return this.getMockRiskModelData();
    }
  }

  // Get interest rate trends
  async getInterestRateTrends(timeRange?: string, chain?: string): Promise<{ data: InterestRateTrends[]; analysis: InterestRateAnalysis; lastUpdated: string }> {
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (chain) params.append('chain', chain);

      const response = await fetch(`${this.apiBaseUrl}/api/analytics/interest-rates?${params}`);
      const data: ApiResponse<{ data: InterestRateTrends[]; analysis: InterestRateAnalysis; lastUpdated: string }> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch interest rate trends');
      }
      
      return data.data!;
    } catch (error) {
      console.error('Error fetching interest rate trends:', error);
      // Return mock data as fallback
      return this.getMockInterestRateTrends();
    }
  }

  // Get protocol health indicators
  async getProtocolHealth(): Promise<ProtocolHealth> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/analytics/protocol-health`);
      const data: ApiResponse<ProtocolHealth> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch protocol health data');
      }
      
      return data.data!;
    } catch (error) {
      console.error('Error fetching protocol health:', error);
      // Return mock data as fallback
      return this.getMockProtocolHealth();
    }
  }

  // Get user risk profile
  async getUserRiskProfile(userAddress: string): Promise<UserRiskProfile> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/analytics/user-risk-profile/${userAddress}`);
      const data: ApiResponse<UserRiskProfile> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch user risk profile');
      }
      
      return data.data!;
    } catch (error) {
      console.error('Error fetching user risk profile:', error);
      // Return mock data as fallback
      return this.getMockUserRiskProfile();
    }
  }

  // Get aggregated analytics summary
  async getAnalyticsSummary(timeRange?: string): Promise<AnalyticsSummary> {
    try {
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);

      const response = await fetch(`${this.apiBaseUrl}/api/analytics/summary?${params}`);
      const data: ApiResponse<AnalyticsSummary> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analytics summary');
      }
      
      return data.data!;
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      // Return mock data as fallback
      return this.getMockAnalyticsSummary();
    }
  }

  // Update liquidity statistics
  async updateLiquidityStats(chain: string, data: Partial<LiquidityStats>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/analytics/liquidity/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chain, data }),
      });

      const result: ApiResponse<{ message: string }> = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating liquidity stats:', error);
      return false;
    }
  }

  // Trigger AI risk model update
  async triggerRiskModelUpdate(): Promise<{ success: boolean; lastUpdated: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/analytics/risk-model/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trigger: 'manual' }),
      });

      const result: ApiResponse<{ message: string; lastUpdated: string }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to trigger risk model update');
      }
      
      return {
        success: true,
        lastUpdated: result.data!.lastUpdated
      };
    } catch (error) {
      console.error('Error triggering risk model update:', error);
      return {
        success: false,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Get historical data for specific metrics
  async getHistoricalData(metric: string, chain?: string, timeRange?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (chain) params.append('chain', chain);
      if (timeRange) params.append('timeRange', timeRange);

      const response = await fetch(`${this.apiBaseUrl}/api/analytics/historical/${metric}?${params}`);
      const data: ApiResponse<any[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch historical data');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Mock data methods for development
  getMockLiquidityStats(): LiquidityStats[] {
    return [
      { chain: 'ethereum', liquidity: 1500, change24h: 2.5, totalUsers: 12500, avgAPY: 8.2, utilization: 78, status: 'healthy', lastUpdated: new Date().toISOString() },
      { chain: 'avalanche', liquidity: 850, change24h: -1.2, totalUsers: 6800, avgAPY: 9.1, utilization: 82, status: 'healthy', lastUpdated: new Date().toISOString() },
      { chain: 'solana', liquidity: 500, change24h: 5.8, totalUsers: 4200, avgAPY: 7.8, utilization: 65, status: 'warning', lastUpdated: new Date().toISOString() },
      { chain: 'base', liquidity: 300, change24h: 12.3, totalUsers: 2800, avgAPY: 10.5, utilization: 45, status: 'healthy', lastUpdated: new Date().toISOString() },
      { chain: 'polygon', liquidity: 420, change24h: 3.1, totalUsers: 3500, avgAPY: 8.9, utilization: 71, status: 'healthy', lastUpdated: new Date().toISOString() },
      { chain: 'zetachain', liquidity: 400, change24h: 8.7, totalUsers: 1800, avgAPY: 11.2, utilization: 38, status: 'healthy', lastUpdated: new Date().toISOString() }
    ];
  }

  getMockRiskModelData(): { data: RiskModelData[]; trends: RiskTrends; lastUpdated: string } {
    return {
      data: [
        { month: 'Jan', avgCreditScore: 78, liquidations: 4, borrowRepayments: 70, defaultRate: 2.1, marketVolatility: 15 },
        { month: 'Feb', avgCreditScore: 80, liquidations: 5, borrowRepayments: 75, defaultRate: 1.9, marketVolatility: 18 },
        { month: 'Mar', avgCreditScore: 82, liquidations: 3, borrowRepayments: 80, defaultRate: 1.7, marketVolatility: 12 },
        { month: 'Apr', avgCreditScore: 81, liquidations: 4, borrowRepayments: 85, defaultRate: 1.8, marketVolatility: 16 },
        { month: 'May', avgCreditScore: 83, liquidations: 2, borrowRepayments: 88, defaultRate: 1.5, marketVolatility: 14 },
        { month: 'Jun', avgCreditScore: 85, liquidations: 1, borrowRepayments: 92, defaultRate: 1.2, marketVolatility: 11 }
      ],
      trends: {
        creditScoreTrend: 'improving',
        liquidationTrend: 'decreasing',
        defaultRateTrend: 'improving',
        volatilityTrend: 'stabilizing'
      },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockInterestRateTrends(): { data: InterestRateTrends[]; analysis: InterestRateAnalysis; lastUpdated: string } {
    return {
      data: [
        { month: 'Jan', ethereum: 0.052, avalanche: 0.048, solana: 0.055, polygon: 0.049, base: 0.061, zetachain: 0.058 },
        { month: 'Feb', ethereum: 0.054, avalanche: 0.050, solana: 0.053, polygon: 0.051, base: 0.059, zetachain: 0.056 },
        { month: 'Mar', ethereum: 0.051, avalanche: 0.047, solana: 0.054, polygon: 0.048, base: 0.057, zetachain: 0.054 },
        { month: 'Apr', ethereum: 0.053, avalanche: 0.049, solana: 0.052, polygon: 0.050, base: 0.055, zetachain: 0.052 },
        { month: 'May', ethereum: 0.050, avalanche: 0.046, solana: 0.051, polygon: 0.047, base: 0.053, zetachain: 0.050 },
        { month: 'Jun', ethereum: 0.048, avalanche: 0.044, solana: 0.049, polygon: 0.045, base: 0.051, zetachain: 0.048 }
      ],
      analysis: {
        ethereum: { average: 0.051, trend: 'decreasing', volatility: 0.002 },
        avalanche: { average: 0.047, trend: 'decreasing', volatility: 0.002 },
        solana: { average: 0.052, trend: 'decreasing', volatility: 0.002 },
        polygon: { average: 0.048, trend: 'decreasing', volatility: 0.002 },
        base: { average: 0.056, trend: 'decreasing', volatility: 0.003 },
        zetachain: { average: 0.053, trend: 'decreasing', volatility: 0.003 }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockProtocolHealth(): ProtocolHealth {
    return {
      overallScore: 87,
      liquidityHealth: 92,
      creditHealth: 85,
      marketHealth: 78,
      riskLevel: 'low',
      lastUpdated: new Date().toISOString(),
      metrics: {
        totalTVL: 3970,
        activeUsers: 32800,
        totalLoans: 15420,
        avgLoanSize: 257.5,
        defaultRate: 1.6,
        liquidationRate: 0.8
      }
    };
  }

  getMockUserRiskProfile(): UserRiskProfile {
    return {
      creditScore: 82,
      liquidationRisk: 15,
      portfolioDiversification: 78,
      repaymentHistory: 95,
      collateralQuality: 88,
      riskLevel: 'low',
      recommendedActions: [
        'Add collateral to optimize borrowing power',
        'Maintain repayments on time to improve credit score',
        'Monitor volatile collateral assets closely',
        'Consider diversifying across more stable assets'
      ],
      optimizationTips: [
        'Your credit score is above average - leverage this for better rates',
        'Portfolio diversification could be improved by adding more stable assets',
        'Excellent repayment history - maintain this to unlock premium features',
        'Consider increasing collateral on high-volatility positions'
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  getMockAnalyticsSummary(): AnalyticsSummary {
    return {
      totalLiquidity: 3970,
      totalUsers: 32800,
      avgCreditScore: 85,
      protocolHealth: 87,
      riskLevel: 'low',
      lastUpdated: new Date().toISOString()
    };
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatInterestRate(rate: number): string {
    return `${(rate * 100).toFixed(2)}%`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getRiskLevelColor(level: string): string {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  calculateTrendIcon(current: number, previous: number): 'up' | 'down' | 'stable' {
    const diff = current - previous;
    if (Math.abs(diff) < 0.01) return 'stable';
    return diff > 0 ? 'up' : 'down';
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'improving':
      case 'decreasing':
      case 'stabilizing':
        return 'text-green-400';
      case 'declining':
      case 'increasing':
      case 'worsening':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }

  async getZetaChainProvider(): Promise<ethers.Provider | null> {
    try {
      return new ethers.JsonRpcProvider(this.zetaConfig.rpcUrl);
    } catch (error) {
      console.error('Failed to create ZetaChain provider:', error);
      return null;
    }
  }

  // Simulate real-time data updates
  async simulateRealTimeUpdates(): Promise<void> {
    // Simulate updating liquidity stats every 30 seconds
    setInterval(async () => {
      try {
        const stats = this.getMockLiquidityStats();
        stats.forEach(stat => {
          stat.liquidity += (Math.random() - 0.5) * 10;
          stat.change24h = (Math.random() - 0.5) * 5;
          stat.lastUpdated = new Date().toISOString();
        });
      } catch (error) {
        console.error('Error in real-time updates simulation:', error);
      }
    }, 30000);
  }
}

export default new AnalyticsService();
