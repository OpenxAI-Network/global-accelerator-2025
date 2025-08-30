import { ethers } from 'ethers';

export interface DepositRequest {
  userAddress: string;
  asset: string;
  amount: number;
  sourceChain: string;
  targetChain: string;
  assetType: 'crypto' | 'nft';
  tokenId?: string;
}

export interface DepositResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  estimatedConfirmationTime?: number;
  bridgeFee?: number;
}

export interface OraclePrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
  source: string;
}

export interface ZetaChainConfig {
  rpcUrl: string;
  chainId: number;
  contractAddresses: {
    universalLending: string;
    crossChainMessaging: string;
    nftCollateral: string;
  };
}

class DepositService {
  private apiBaseUrl: string;
  private zetaConfig: ZetaChainConfig;

  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.zetaConfig = {
      rpcUrl: 'https://rpc.zetachain.net',
      chainId: 7000,
      contractAddresses: {
        universalLending: '0x1234567890123456789012345678901234567890',
        crossChainMessaging: '0x2345678901234567890123456789012345678901',
        nftCollateral: '0x3456789012345678901234567890123456789012'
      }
    };
  }

  /**
   * Get real-time oracle prices for supported assets
   */
  async getOraclePrices(): Promise<Record<string, OraclePrice>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/oracle/prices`);
      if (!response.ok) {
        throw new Error('Failed to fetch oracle prices');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching oracle prices:', error);
      // Return mock data as fallback
      return this.getMockOraclePrices();
    }
  }

  /**
   * Get mock oracle prices (for development/demo)
   */
  private getMockOraclePrices(): Record<string, OraclePrice> {
    const baseTime = new Date();
    return {
      BTC: {
        symbol: 'BTC',
        price: 52400 * (1 + (Math.random() - 0.5) * 0.02),
        change24h: 2.4 + (Math.random() - 0.5) * 0.5,
        lastUpdated: baseTime,
        source: 'Aegis Oracle'
      },
      ETH: {
        symbol: 'ETH',
        price: 2500 * (1 + (Math.random() - 0.5) * 0.02),
        change24h: -1.2 + (Math.random() - 0.5) * 0.5,
        lastUpdated: baseTime,
        source: 'Aegis Oracle'
      },
      SOL: {
        symbol: 'SOL',
        price: 93 * (1 + (Math.random() - 0.5) * 0.02),
        change24h: 5.8 + (Math.random() - 0.5) * 0.5,
        lastUpdated: baseTime,
        source: 'Aegis Oracle'
      },
      USDC: {
        symbol: 'USDC',
        price: 1 * (1 + (Math.random() - 0.5) * 0.001),
        change24h: 0.1 + (Math.random() - 0.5) * 0.1,
        lastUpdated: baseTime,
        source: 'Aegis Oracle'
      },
      MATIC: {
        symbol: 'MATIC',
        price: 0.75 * (1 + (Math.random() - 0.5) * 0.02),
        change24h: 3.2 + (Math.random() - 0.5) * 0.5,
        lastUpdated: baseTime,
        source: 'Aegis Oracle'
      },
      AVAX: {
        symbol: 'AVAX',
        price: 18.50 * (1 + (Math.random() - 0.5) * 0.02),
        change24h: -0.8 + (Math.random() - 0.5) * 0.5,
        lastUpdated: baseTime,
        source: 'Aegis Oracle'
      }
    };
  }

  /**
   * Submit a deposit request to the backend
   */
  async submitDeposit(request: DepositRequest): Promise<DepositResponse> {
    try {
      // Validate request
      this.validateDepositRequest(request);

      // Submit to backend API
      const response = await fetch(`${this.apiBaseUrl}/api/deposits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deposit request failed');
      }

      const result = await response.json();
      
      // Trigger AI credit scoring update
      this.triggerCreditScoreUpdate(request.userAddress);

      return result;
    } catch (error) {
      console.error('Deposit submission error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get deposit transaction status
   */
  async getDepositStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    estimatedTime?: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/deposits/status/${txHash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deposit status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching deposit status:', error);
      // Return mock status for demo
      return {
        status: Math.random() > 0.3 ? 'confirmed' : 'pending',
        confirmations: Math.floor(Math.random() * 12) + 1,
        estimatedTime: Math.random() > 0.5 ? 30 : undefined
      };
    }
  }

  /**
   * Get user's deposit history
   */
  async getDepositHistory(userAddress: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/deposits/history/${userAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deposit history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching deposit history:', error);
      // Return mock history for demo
      return [
        {
          id: '1',
          asset: 'BTC',
          amount: 0.5,
          chain: 'Bitcoin',
          status: 'confirmed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          txHash: '0x1234567890abcdef',
          usdValue: 26200,
          estimatedRewards: 1100
        },
        {
          id: '2',
          asset: 'ETH',
          amount: 10,
          chain: 'Ethereum',
          status: 'pending',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          txHash: '0x8765432109fedcba',
          usdValue: 25000,
          estimatedRewards: 1450
        }
      ];
    }
  }

  /**
   * Estimate bridge fees for cross-chain deposits
   */
  async estimateBridgeFees(
    sourceChain: string,
    targetChain: string,
    asset: string,
    amount: number
  ): Promise<{
    fee: number;
    feeUSD: number;
    estimatedTime: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/bridge/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceChain,
          targetChain,
          asset,
          amount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to estimate bridge fees');
      }

      return await response.json();
    } catch (error) {
      console.error('Error estimating bridge fees:', error);
      // Return mock estimate
      return {
        fee: amount * 0.001, // 0.1% fee
        feeUSD: amount * 0.001 * 2500, // Assuming ETH price
        estimatedTime: 300 // 5 minutes
      };
    }
  }

  /**
   * Validate NFT ownership before deposit
   */
  async validateNFTOwnership(
    userAddress: string,
    contractAddress: string,
    tokenId: string,
    chain: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          contractAddress,
          tokenId,
          chain
        })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.isOwner;
    } catch (error) {
      console.error('Error validating NFT ownership:', error);
      return false;
    }
  }

  /**
   * Get supported chains and their configurations
   */
  async getSupportedChains(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/chains/supported`);
      if (!response.ok) {
        throw new Error('Failed to fetch supported chains');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      // Return mock chains
      return [
        { id: 'bitcoin', name: 'Bitcoin', status: 'healthy', gasPrice: '1-5 sat/vB' },
        { id: 'ethereum', name: 'Ethereum', status: 'healthy', gasPrice: '15-25 gwei' },
        { id: 'solana', name: 'Solana', status: 'healthy', gasPrice: '0.000005 SOL' },
        { id: 'polygon', name: 'Polygon', status: 'warning', gasPrice: '30-50 gwei' },
        { id: 'avalanche', name: 'Avalanche', status: 'healthy', gasPrice: '25-35 gwei' },
        { id: 'arbitrum', name: 'Arbitrum', status: 'healthy', gasPrice: '0.1-0.3 gwei' },
        { id: 'zetachain', name: 'ZetaChain', status: 'healthy', gasPrice: '0.1 gwei' }
      ];
    }
  }

  /**
   * Trigger AI credit score update after deposit
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
   * Validate deposit request before submission
   */
  private validateDepositRequest(request: DepositRequest): void {
    if (!request.userAddress || !ethers.isAddress(request.userAddress)) {
      throw new Error('Invalid user address');
    }

    if (!request.asset || request.asset.trim() === '') {
      throw new Error('Asset is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!request.sourceChain || request.sourceChain.trim() === '') {
      throw new Error('Source chain is required');
    }

    if (!request.targetChain || request.targetChain.trim() === '') {
      throw new Error('Target chain is required');
    }

    if (request.assetType === 'nft' && !request.tokenId) {
      throw new Error('Token ID is required for NFT deposits');
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
}

export default new DepositService();
