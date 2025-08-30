import { ethers } from 'ethers';

// Enhanced interfaces for the improved Dashboard UI
export interface ConnectedWallet {
  id: string;
  name: string;
  chain: string;
  address: string;
  fullAddress: string;
  balance: number;
  nativeToken: string;
  status: 'connected' | 'disconnected' | 'connecting';
  icon: string;
  color: string;
  lastActivity?: string;
}

export interface PortfolioSummary {
  depositedCollateral: {
    [chain: string]: {
      amount: number;
      change24h: number;
      apy: number;
    };
  };
  outstandingLoans: {
    [chain: string]: {
      amount: number;
      interestRate: number;
      dueDate: string;
    };
  };
  totalCollateralUSD: number;
  totalLoansUSD: number;
  borrowingPowerUSD: number;
  utilizationPercent: number;
  creditScore: number;
  liquidationRiskPercent: number;
  netWorthUSD: number;
  availableCreditUSD: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export interface ActivityEvent {
  id: number;
  type: 'Deposit' | 'Borrow' | 'Repay' | 'Liquidation Warning' | 'Withdraw' | 'Collateral Adjustment';
  chain: string;
  asset: string;
  amount: number;
  usdValue: number;
  status: 'confirmed' | 'pending' | 'failed' | 'warning';
  timestamp: string;
  txHash: string;
  icon: string;
}

export interface DashboardOverview {
  totalWallets: number;
  totalChains: number;
  totalCollateralUSD: number;
  totalLoansUSD: number;
  activeLoans: number;
  recentActivity: ActivityEvent[];
  lastUpdated: string;
}

export interface WalletBalance {
  [asset: string]: number;
}

export interface CreditScore {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  factors: string[];
  lastUpdated: string;
}

export interface CrossChainStats {
  totalChains: number;
  crossChainTransactions: number;
  averageAPY: number;
  totalTVL: number;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class DashboardService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:4004') {
    this.baseUrl = baseUrl;
  }

  // Get dashboard overview
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/overview`);
      const result: ApiResponse<DashboardOverview> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch dashboard overview');
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return this.getMockDashboardOverview();
    }
  }

  // Get connected wallets
  async getConnectedWallets(): Promise<ConnectedWallet[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/wallets`);
      const result: ApiResponse<ConnectedWallet[]> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch connected wallets');
    } catch (error) {
      console.error('Error fetching connected wallets:', error);
      return this.getMockConnectedWallets();
    }
  }

  // Connect a new wallet
  async connectWallet(walletType: string): Promise<ConnectedWallet> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletType })
      });
      const result: ApiResponse<ConnectedWallet> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to connect wallet');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  // Disconnect a wallet
  async disconnectWallet(walletId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/wallets/${walletId}`, {
        method: 'DELETE'
      });
      const result: ApiResponse<boolean> = await response.json();
      
      if (result.success) {
        return true;
      }
      throw new Error(result.error || 'Failed to disconnect wallet');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  // Get portfolio summary
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/portfolio/summary`);
      const result: ApiResponse<PortfolioSummary> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch portfolio summary');
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      return this.getMockPortfolioSummary();
    }
  }

  // Get activity feed
  async getActivityFeed(): Promise<ActivityEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/activity`);
      const result: ApiResponse<ActivityEvent[]> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch activity feed');
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return this.getMockActivityFeed();
    }
  }

  // Get wallet balance
  async getWalletBalance(address: string): Promise<WalletBalance> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/wallets/${address}/balance`);
      const result: ApiResponse<WalletBalance> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch wallet balance');
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return this.getMockWalletBalance(address);
    }
  }

  // Get credit score
  async getCreditScore(address: string): Promise<CreditScore> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/wallets/${address}/credit-score`);
      const result: ApiResponse<CreditScore> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch credit score');
    } catch (error) {
      console.error('Error fetching credit score:', error);
      return this.getMockCreditScore(address);
    }
  }

  // Update portfolio data
  async updatePortfolio(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/portfolio/update`, {
        method: 'POST'
      });
      const result: ApiResponse<boolean> = await response.json();
      
      if (result.success) {
        return true;
      }
      throw new Error(result.error || 'Failed to update portfolio');
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  // Refresh wallet data
  async refreshWalletData(address: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/wallets/${address}/refresh`, {
        method: 'POST'
      });
      const result: ApiResponse<boolean> = await response.json();
      
      if (result.success) {
        return true;
      }
      throw new Error(result.error || 'Failed to refresh wallet data');
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
      throw error;
    }
  }

  // Get cross-chain statistics
  async getCrossChainStats(): Promise<CrossChainStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/statistics`);
      const result: ApiResponse<CrossChainStats> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch cross-chain stats');
    } catch (error) {
      console.error('Error fetching cross-chain stats:', error);
      return this.getMockCrossChainStats();
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Mock data methods for development
  private getMockDashboardOverview(): DashboardOverview {
    return {
      totalWallets: 3,
      totalChains: 4,
      totalCollateralUSD: 8700,
      totalLoansUSD: 2400,
      activeLoans: 3,
      recentActivity: this.getMockActivityFeed(),
      lastUpdated: new Date().toISOString()
    };
  }

  private getMockConnectedWallets(): ConnectedWallet[] {
    return [
      {
        id: '1',
        name: 'MetaMask',
        chain: 'Ethereum',
        address: '0x2095...28b3',
        fullAddress: '0x2095a8f7c8d9e2f1a3b4c5d6e7f8a9b0c1d2e3f4',
        balance: 0.0020,
        nativeToken: 'ETH',
        status: 'connected',
        icon: '🦊',
        color: 'from-blue-500 to-blue-600'
      },
      {
        id: '2',
        name: 'Phantom',
        chain: 'Solana',
        address: '5D4Xz...wqEr',
        fullAddress: '5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq',
        balance: 15.8,
        nativeToken: 'SOL',
        status: 'connected',
        icon: '👻',
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: '3',
        name: 'WalletConnect',
        chain: 'Avalanche',
        address: '0xaBcD...789F',
        fullAddress: '0xaBcD8ba1f109551bD432803012645Hac136c772c3c7c',
        balance: 125.5,
        nativeToken: 'AVAX',
        status: 'connected',
        icon: '🔗',
        color: 'from-red-500 to-red-600'
      }
    ];
  }

  private getMockPortfolioSummary(): PortfolioSummary {
    return {
      depositedCollateral: {
        Ethereum: { amount: 5000, change24h: 2.3, apy: 8.2 },
        Avalanche: { amount: 2500, change24h: -1.2, apy: 9.1 },
        Solana: { amount: 1200, change24h: 5.7, apy: 7.8 }
      },
      outstandingLoans: {
        Ethereum: { amount: 1200, interestRate: 12.5, dueDate: '2025-10-15' },
        Avalanche: { amount: 800, interestRate: 14.2, dueDate: '2025-09-30' },
        Solana: { amount: 400, interestRate: 13.8, dueDate: '2025-11-05' }
      },
      totalCollateralUSD: 8700,
      totalLoansUSD: 2400,
      borrowingPowerUSD: 5000,
      utilizationPercent: 48,
      creditScore: 78,
      liquidationRiskPercent: 22,
      netWorthUSD: 6300,
      availableCreditUSD: 2600,
      healthStatus: 'healthy'
    };
  }

  private getMockActivityFeed(): ActivityEvent[] {
    return [
      {
        id: 1,
        type: 'Deposit',
        chain: 'Ethereum',
        asset: 'USDC',
        amount: 1000,
        usdValue: 1000,
        status: 'confirmed',
        timestamp: '2025-08-20 14:36',
        txHash: '0x1234...5678',
        icon: '⬇️'
      },
      {
        id: 2,
        type: 'Borrow',
        chain: 'Avalanche',
        asset: 'USDC',
        amount: 500,
        usdValue: 500,
        status: 'confirmed',
        timestamp: '2025-08-19 11:15',
        txHash: '0xabcd...efgh',
        icon: '⬆️'
      },
      {
        id: 3,
        type: 'Repay',
        chain: 'Ethereum',
        asset: 'ZETA',
        amount: 300,
        usdValue: 450,
        status: 'confirmed',
        timestamp: '2025-08-18 09:42',
        txHash: '0x9876...5432',
        icon: '💳'
      }
    ];
  }

  private getMockWalletBalance(address: string): WalletBalance {
    const balances: { [key: string]: WalletBalance } = {
      '0x2095a8f7c8d9e2f1a3b4c5d6e7f8a9b0c1d2e3f4': { ETH: 0.0020, USDC: 5000, WBTC: 0.15 },
      '5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq': { SOL: 15.8, USDC: 800 },
      '0xaBcD8ba1f109551bD432803012645Hac136c772c3c7c': { AVAX: 125.5 }
    };
    return balances[address] || {};
  }

  private getMockCreditScore(address: string): CreditScore {
    const scores: { [key: string]: CreditScore } = {
      '0x2095a8f7c8d9e2f1a3b4c5d6e7f8a9b0c1d2e3f4': {
        score: 78,
        level: 'good',
        factors: ['Diversified collateral', 'Consistent repayment history', 'Low utilization ratio'],
        lastUpdated: new Date().toISOString()
      },
      '5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq': {
        score: 75,
        level: 'fair',
        factors: ['Growing portfolio', 'Recent activity'],
        lastUpdated: new Date().toISOString()
      },
      '0xaBcD8ba1f109551bD432803012645Hac136c772c3c7c': {
        score: 68,
        level: 'fair',
        factors: ['New user', 'Limited history'],
        lastUpdated: new Date().toISOString()
      }
    };
    return scores[address] || {
      score: 70,
      level: 'fair',
      factors: ['Default score'],
      lastUpdated: new Date().toISOString()
    };
  }

  private getMockCrossChainStats(): CrossChainStats {
    return {
      totalChains: 4,
      crossChainTransactions: 156,
      averageAPY: 8.4,
      totalTVL: 15420,
      lastUpdated: new Date().toISOString()
    };
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatAddress(address: string, length: number = 8): string {
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-gray-400';
      case 'connecting': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  }

  getStatusBgColor(status: string): string {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  getActivityIconColor(type: string): string {
    switch (type) {
      case 'Deposit': return 'text-green-500';
      case 'Borrow': return 'text-blue-500';
      case 'Repay': return 'text-purple-500';
      case 'Liquidation Warning': return 'text-red-500';
      case 'Withdraw': return 'text-orange-500';
      case 'Collateral Adjustment': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  }
}
