import { ethers } from 'ethers';

export interface Loan {
  id: string;
  userAddress: string;
  principal: string;
  interestRate: number;
  dueDate: string;
  collateralAsset: string;
  collateralChain: string;
  collateralValue: string;
  liquidationRisk: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  interestPaidHistory: { date: string; amount: number; txHash: string }[];
  totalInterestPaid: number;
  remainingBalance: string;
  loanToValue: number;
  marginCallThreshold: number;
  liquidationThreshold: number;
  status: string;
  createdAt: string;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  type: 'margin_call' | 'liquidation_warning' | 'payment_due' | 'collateral_update';
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAddress: string;
  loanId: string;
}

export interface LoanAnalytics {
  totalLoans: number;
  totalPrincipal: string;
  averageInterestRate: number;
  totalCollateralValue: string;
  riskDistribution: {
    healthy: number;
    warning: number;
    critical: number;
  };
  portfolioHealth: 'healthy' | 'warning' | 'critical';
}

export interface AddCollateralRequest {
  userAddress: string;
  asset: string;
  amount: number;
  chain: string;
}

export interface RepayLoanRequest {
  userAddress: string;
  amount: number;
  chain: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class LoanService {
  private apiBaseUrl: string;
  private zetaConfig: any;

  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_LOAN_API_URL || 'http://localhost:4000';
    this.zetaConfig = {
      rpcUrl: process.env.REACT_APP_ZETACHAIN_RPC || 'https://rpc.zetachain.net',
      chainId: process.env.REACT_APP_ZETACHAIN_CHAIN_ID || '7000'
    };
  }

  // Fetch all loans for a user
  async getUserLoans(userAddress: string): Promise<Loan[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/loans/${userAddress}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch loans');
      }
      
      return result.loans;
    } catch (error) {
      console.error('Error fetching user loans:', error);
      throw error;
    }
  }

  // Fetch specific loan details
  async getLoanDetails(userAddress: string, loanId: string): Promise<Loan> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/loans/${userAddress}/${loanId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch loan details');
      }
      
      return result.loan;
    } catch (error) {
      console.error('Error fetching loan details:', error);
      throw error;
    }
  }

  // Add collateral to a loan
  async addCollateral(loanId: string, request: AddCollateralRequest): Promise<{
    success: boolean;
    txHash: string;
    updatedLoan: Loan;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/loans/${loanId}/collateral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to add collateral');
      }
      
      return {
        success: true,
        txHash: result.txHash,
        updatedLoan: result.updatedLoan,
      };
    } catch (error) {
      console.error('Error adding collateral:', error);
      throw error;
    }
  }

  // Repay a loan
  async repayLoan(loanId: string, request: RepayLoanRequest): Promise<{
    success: boolean;
    txHash: string;
    updatedLoan: Loan;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/loans/${loanId}/repay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to process repayment');
      }
      
      return {
        success: true,
        txHash: result.txHash,
        updatedLoan: result.updatedLoan,
      };
    } catch (error) {
      console.error('Error processing repayment:', error);
      throw error;
    }
  }

  // Fetch user notifications
  async getUserNotifications(userAddress: string): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/notifications/${userAddress}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch notifications');
      }
      
      return result.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(userAddress: string, notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/notifications/${userAddress}/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to mark notification as read');
      }
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Fetch loan analytics
  async getLoanAnalytics(userAddress: string): Promise<LoanAnalytics> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/analytics/${userAddress}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch analytics');
      }
      
      return result.analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`);
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Mock data for development/testing
  getMockLoans(): Loan[] {
    return [
      {
        id: 'LOAN-001',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        principal: '5000',
        interestRate: 8.5,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        collateralAsset: 'ETH',
        collateralChain: 'ethereum',
        collateralValue: '8500',
        liquidationRisk: 35,
        healthStatus: 'healthy',
        interestPaidHistory: [
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), amount: 35.42, txHash: '0x123...abc' },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 35.42, txHash: '0x456...def' }
        ],
        totalInterestPaid: 70.84,
        remainingBalance: '5000',
        loanToValue: 58.8,
        marginCallThreshold: 75,
        liquidationThreshold: 85,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'LOAN-002',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        principal: '12000',
        interestRate: 12.2,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        collateralAsset: 'BTC',
        collateralChain: 'bitcoin',
        collateralValue: '18000',
        liquidationRisk: 68,
        healthStatus: 'warning',
        interestPaidHistory: [
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), amount: 122.00, txHash: '0x789...ghi' }
        ],
        totalInterestPaid: 122.00,
        remainingBalance: '12000',
        loanToValue: 66.7,
        marginCallThreshold: 75,
        liquidationThreshold: 85,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'LOAN-003',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        principal: '8000',
        interestRate: 15.8,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        collateralAsset: 'SOL',
        collateralChain: 'solana',
        collateralValue: '10000',
        liquidationRisk: 82,
        healthStatus: 'critical',
        interestPaidHistory: [],
        totalInterestPaid: 0,
        remainingBalance: '8000',
        loanToValue: 80.0,
        marginCallThreshold: 75,
        liquidationThreshold: 85,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  getMockNotifications(): Notification[] {
    return [
      {
        id: 'notif-001',
        type: 'liquidation_warning',
        message: '🚨 CRITICAL: Loan LOAN-003 liquidation risk at 82%',
        timestamp: new Date().toISOString(),
        isRead: false,
        severity: 'critical',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        loanId: 'LOAN-003'
      },
      {
        id: 'notif-002',
        type: 'margin_call',
        message: '⚠️ WARNING: Loan LOAN-002 margin call - LTV at 66.7%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        severity: 'high',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        loanId: 'LOAN-002'
      }
    ];
  }

  getMockAnalytics(): LoanAnalytics {
    return {
      totalLoans: 3,
      totalPrincipal: '25000',
      averageInterestRate: 12.17,
      totalCollateralValue: '36500',
      riskDistribution: {
        healthy: 1,
        warning: 1,
        critical: 1
      },
      portfolioHealth: 'critical'
    };
  }

  // Utility functions
  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  calculateDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getRiskColor(risk: number): string {
    if (risk > 80) return 'text-red-400';
    if (risk > 60) return 'text-yellow-400';
    if (risk > 40) return 'text-orange-400';
    return 'text-green-400';
  }

  getHealthStatusColor(status: string): string {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // ZetaChain specific utilities
  async getZetaChainProvider(): Promise<ethers.Provider | null> {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const network = await provider.getNetwork();
        
        // Check if we're on ZetaChain
        if (network.chainId === BigInt(this.zetaConfig.chainId)) {
          return provider;
        }
        
        // If not on ZetaChain, try to switch
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(this.zetaConfig.chainId).toString(16)}` }],
          });
          return new ethers.BrowserProvider((window as any).ethereum);
        } catch (switchError) {
          console.error('Failed to switch to ZetaChain:', switchError);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting ZetaChain provider:', error);
      return null;
    }
  }

  // Validate loan data
  validateLoanData(loan: Partial<Loan>): string[] {
    const errors: string[] = [];
    
    if (!loan.principal || parseFloat(loan.principal) <= 0) {
      errors.push('Principal amount must be greater than 0');
    }
    
    if (!loan.interestRate || loan.interestRate < 0 || loan.interestRate > 100) {
      errors.push('Interest rate must be between 0 and 100');
    }
    
    if (!loan.collateralAsset) {
      errors.push('Collateral asset is required');
    }
    
    if (!loan.collateralChain) {
      errors.push('Collateral chain is required');
    }
    
    return errors;
  }

  // Calculate loan metrics
  calculateLoanMetrics(loan: Loan): {
    ltv: number;
    liquidationRisk: number;
    healthStatus: 'healthy' | 'warning' | 'critical';
    daysUntilDue: number;
    monthlyPayment: number;
    totalInterest: number;
  } {
    const principal = parseFloat(loan.principal);
    const collateralValue = parseFloat(loan.collateralValue);
    const interestRate = loan.interestRate / 100;
    const daysUntilDue = this.calculateDaysUntilDue(loan.dueDate);
    
    // Calculate LTV
    const ltv = (principal / collateralValue) * 100;
    
    // Calculate liquidation risk based on LTV
    let liquidationRisk = 20; // Base risk
    if (ltv > 80) {
      liquidationRisk = 85;
    } else if (ltv > 70) {
      liquidationRisk = 70;
    } else if (ltv > 60) {
      liquidationRisk = 50;
    } else if (ltv > 50) {
      liquidationRisk = 30;
    }
    
    // Determine health status
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (ltv > 80) {
      healthStatus = 'critical';
    } else if (ltv > 70) {
      healthStatus = 'warning';
    }
    
    // Calculate monthly payment (simple interest for demo)
    const monthlyPayment = (principal * interestRate) / 12;
    
    // Calculate total interest over loan term
    const months = Math.ceil(daysUntilDue / 30);
    const totalInterest = monthlyPayment * months;
    
    return {
      ltv,
      liquidationRisk,
      healthStatus,
      daysUntilDue,
      monthlyPayment,
      totalInterest
    };
  }
}

export default new LoanService();
