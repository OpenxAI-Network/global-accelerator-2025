import { ethers } from 'ethers';

export interface BorrowRequest {
  userAddress: string;
  asset: string;
  amount: number;
  duration: number; // months
  sourceChain: string;
  targetChain: string;
  collateralValue: number;
}

export interface BorrowResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  estimatedConfirmationTime?: number;
  interestRate?: number;
  monthlyPayment?: number;
  totalRepayment?: number;
}

export interface CreditProfile {
  creditScore: number;
  creditLimit: number;
  aiMaxBorrow: number;
  currentBorrowed: number;
  availableCredit: number;
  riskTier: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: Date;
  riskFactors: string[];
}

export interface LoanTerms {
  amount: number;
  duration: number;
  interestRate: number;
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  riskScore: number;
  liquidityRatio: number;
  maxLoanToValue: number;
}

export interface RepaymentSchedule {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface BorrowableAsset {
  symbol: string;
  name: string;
  price: number;
  availableLiquidity: number;
  maxLoanToValue: number;
  baseInterestRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  minBorrowAmount: number;
  maxBorrowAmount: number;
}

class BorrowService {
  private apiBaseUrl: string;
  private zetaConfig: any;

  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.zetaConfig = {
      rpcUrl: 'https://rpc.zetachain.net',
      chainId: 7000,
      contractAddresses: {
        universalLending: '0x1234567890123456789012345678901234567890',
        crossChainMessaging: '0x2345678901234567890123456789012345678901'
      }
    };
  }

  /**
   * Get user's credit profile and AI scoring
   */
  async getCreditProfile(userAddress: string): Promise<CreditProfile> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/credit-profile/${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credit profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching credit profile:', error);
      // Return mock profile as fallback
      return this.getMockCreditProfile(userAddress);
    }
  }

  /**
   * Get available borrowable assets
   */
  async getBorrowableAssets(): Promise<BorrowableAsset[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/assets`);
      if (!response.ok) {
        throw new Error('Failed to fetch borrowable assets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching borrowable assets:', error);
      // Return mock assets as fallback
      return this.getMockBorrowableAssets();
    }
  }

  /**
   * Calculate loan terms and repayment schedule
   */
  async calculateLoanTerms(
    asset: string,
    amount: number,
    duration: number,
    userAddress: string
  ): Promise<LoanTerms> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset,
          amount,
          duration,
          userAddress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate loan terms');
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating loan terms:', error);
      // Return mock calculation as fallback
      return this.calculateMockLoanTerms(asset, amount, duration);
    }
  }

  /**
   * Get repayment schedule for loan
   */
  async getRepaymentSchedule(
    principal: number,
    yearlyRate: number,
    months: number
  ): Promise<RepaymentSchedule[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/repayment-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          principal,
          yearlyRate,
          months
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate repayment schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating repayment schedule:', error);
      // Return mock schedule as fallback
      return this.calculateMockRepaymentSchedule(principal, yearlyRate, months);
    }
  }

  /**
   * Submit borrow request
   */
  async submitBorrow(request: BorrowRequest): Promise<BorrowResponse> {
    try {
      // Validate request
      this.validateBorrowRequest(request);

      // Submit to backend API
      const response = await fetch(`${this.apiBaseUrl}/api/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Borrow request failed');
      }

      const result = await response.json();
      
      // Trigger AI credit scoring update
      this.triggerCreditScoreUpdate(request.userAddress);

      return result;
    } catch (error) {
      console.error('Borrow submission error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get borrow transaction status
   */
  async getBorrowStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    estimatedTime?: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/status/${txHash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch borrow status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching borrow status:', error);
      // Return mock status for demo
      return {
        status: Math.random() > 0.3 ? 'confirmed' : 'pending',
        confirmations: Math.floor(Math.random() * 12) + 1,
        estimatedTime: Math.random() > 0.5 ? 30 : undefined
      };
    }
  }

  /**
   * Get user's borrow history
   */
  async getBorrowHistory(userAddress: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/history/${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch borrow history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching borrow history:', error);
      // Return mock history for demo
      return [
        {
          id: '1',
          asset: 'USDC',
          amount: 1000,
          duration: 12,
          interestRate: 0.038,
          status: 'confirmed',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          txHash: '0x1234567890abcdef',
          usdValue: 1000
        },
        {
          id: '2',
          asset: 'ZETA',
          amount: 500,
          duration: 6,
          interestRate: 0.045,
          status: 'confirmed',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          txHash: '0x8765432109fedcba',
          usdValue: 1225
        }
      ];
    }
  }

  /**
   * Estimate borrowing fees and costs
   */
  async estimateBorrowCosts(
    asset: string,
    amount: number,
    duration: number,
    userAddress: string
  ): Promise<{
    interestRate: number;
    monthlyPayment: number;
    totalInterest: number;
    totalRepayment: number;
    originationFee: number;
    earlyRepaymentPenalty: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/estimate-costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset,
          amount,
          duration,
          userAddress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to estimate borrow costs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error estimating borrow costs:', error);
      // Return mock estimate
      const baseRate = 0.045; // 4.5% base rate
      const monthlyRate = baseRate / 12;
      const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                            (Math.pow(1 + monthlyRate, duration) - 1);
      
      return {
        interestRate: baseRate,
        monthlyPayment,
        totalInterest: (monthlyPayment * duration) - amount,
        totalRepayment: monthlyPayment * duration,
        originationFee: amount * 0.01, // 1% origination fee
        earlyRepaymentPenalty: amount * 0.005 // 0.5% early repayment penalty
      };
    }
  }

  /**
   * Get risk assessment for borrow request
   */
  async getRiskAssessment(
    userAddress: string,
    asset: string,
    amount: number,
    duration: number
  ): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    recommendations: string[];
    maxRecommendedAmount: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/borrow/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          asset,
          amount,
          duration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get risk assessment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting risk assessment:', error);
      // Return mock assessment
      return {
        riskScore: 75,
        riskLevel: 'medium',
        riskFactors: ['Moderate credit utilization', 'Recent borrowing activity'],
        recommendations: ['Consider shorter loan term', 'Monitor collateral value'],
        maxRecommendedAmount: amount * 0.8
      };
    }
  }

  // Mock data methods for development/demo

  private getMockCreditProfile(userAddress: string): CreditProfile {
    return {
      creditScore: 85,
      creditLimit: 10000,
      aiMaxBorrow: 8000,
      currentBorrowed: 2500,
      availableCredit: 7500,
      riskTier: 'good',
      lastUpdated: new Date(),
      riskFactors: ['Good payment history', 'Moderate debt utilization']
    };
  }

  private getMockBorrowableAssets(): BorrowableAsset[] {
    return [
      {
        symbol: 'ZETA',
        name: 'Zeta',
        price: 2.45,
        availableLiquidity: 5000000,
        maxLoanToValue: 75,
        baseInterestRate: 0.045,
        riskLevel: 'low',
        minBorrowAmount: 100,
        maxBorrowAmount: 100000
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.00,
        availableLiquidity: 25000000,
        maxLoanToValue: 90,
        baseInterestRate: 0.038,
        riskLevel: 'low',
        minBorrowAmount: 50,
        maxBorrowAmount: 500000
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 2500,
        availableLiquidity: 8000000,
        maxLoanToValue: 70,
        baseInterestRate: 0.055,
        riskLevel: 'medium',
        minBorrowAmount: 0.1,
        maxBorrowAmount: 1000
      }
    ];
  }

  private calculateMockLoanTerms(asset: string, amount: number, duration: number): LoanTerms {
    const baseRate = 0.045; // 4.5% base rate
    const monthlyRate = baseRate / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                          (Math.pow(1 + monthlyRate, duration) - 1);
    
    return {
      amount,
      duration,
      interestRate: baseRate,
      monthlyPayment,
      totalRepayment: monthlyPayment * duration,
      totalInterest: (monthlyPayment * duration) - amount,
      riskScore: 75,
      liquidityRatio: 0.6,
      maxLoanToValue: 80
    };
  }

  private calculateMockRepaymentSchedule(
    principal: number,
    yearlyRate: number,
    months: number
  ): RepaymentSchedule[] {
    const monthlyRate = yearlyRate / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    
    const schedule: RepaymentSchedule[] = [];
    let remainingBalance = principal;
    
    for (let month = 1; month <= months; month++) {
      const interest = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      remainingBalance -= principalPayment;
      
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
    
    return schedule;
  }

  /**
   * Trigger AI credit score update after borrow
   */
  private async triggerCreditScoreUpdate(userAddress: string): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/api/ai/credit-score/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress })
      });
    } catch (error) {
      console.error('Error triggering credit score update:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Validate borrow request before submission
   */
  private validateBorrowRequest(request: BorrowRequest): void {
    if (!request.userAddress || !ethers.isAddress(request.userAddress)) {
      throw new Error('Invalid user address');
    }

    if (!request.asset || request.asset.trim() === '') {
      throw new Error('Asset is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!request.duration || request.duration < 1 || request.duration > 60) {
      throw new Error('Duration must be between 1 and 60 months');
    }

    if (!request.sourceChain || request.sourceChain.trim() === '') {
      throw new Error('Source chain is required');
    }

    if (!request.targetChain || request.targetChain.trim() === '') {
      throw new Error('Target chain is required');
    }

    if (!request.collateralValue || request.collateralValue <= 0) {
      throw new Error('Collateral value must be greater than 0');
    }
  }

  /**
   * Format transaction hash for display
   */
  formatTxHash(txHash: string): string {
    if (!txHash || txHash.length < 10) return txHash;
    return `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`;
  }

  /**
   * Get explorer URL for transaction
   */
  getExplorerUrl(txHash: string, chain: string): string {
    const explorers: Record<string, string> = {
      'bitcoin': 'https://blockstream.info/tx/',
      'ethereum': 'https://etherscan.io/tx/',
      'solana': 'https://solscan.io/tx/',
      'polygon': 'https://polygonscan.com/tx/',
      'avalanche': 'https://snowtrace.io/tx/',
      'arbitrum': 'https://arbiscan.io/tx/',
      'zetachain': 'https://explorer.zetachain.com/cc/tx/'
    };

    const baseUrl = explorers[chain.toLowerCase()] || explorers['ethereum'];
    return `${baseUrl}${txHash}`;
  }

  /**
   * Calculate loan-to-value ratio
   */
  calculateLTV(borrowedAmount: number, collateralValue: number): number {
    if (collateralValue === 0) return 0;
    return (borrowedAmount / collateralValue) * 100;
  }

  /**
   * Check if user is eligible for additional borrowing
   */
  isEligibleForBorrow(
    currentLTV: number,
    maxLTV: number,
    availableCredit: number,
    requestedAmount: number
  ): boolean {
    return currentLTV < maxLTV && requestedAmount <= availableCredit;
  }
}

export default new BorrowService();
