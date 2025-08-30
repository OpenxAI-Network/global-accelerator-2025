import { BlockchainConfig, getBlockchainById } from '../config/blockchains';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  chainId: string;
  chainName: string;
  icon?: string;
  change24h?: number;
  apy?: number;
  contractAddress?: string;
  decimals: number;
}

export interface TransactionStatus {
  id: string;
  chainId: string;
  chainName: string;
  status: 'pending' | 'confirmed' | 'failed' | 'processing';
  txHash?: string;
  timestamp: Date;
  description: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  confirmations?: number;
  requiredConfirmations?: number;
  fromAddress?: string;
  toAddress?: string;
  value?: string;
  tokenSymbol?: string;
}

export interface ChainStatus {
  chainId: string;
  isOnline: boolean;
  blockHeight: number;
  lastBlockTime: Date;
  gasPrice: string;
  networkLoad: 'low' | 'medium' | 'high';
  latency: number; // in milliseconds
}

export interface CrossChainOperation {
  id: string;
  sourceChain: string;
  targetChain: string;
  operation: 'swap' | 'transfer' | 'lending' | 'borrowing';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceTxHash?: string;
  targetTxHash?: string;
  amount: string;
  tokenSymbol: string;
  timestamp: Date;
  estimatedCompletion?: Date;
}

class MultiChainService {
  private static instance: MultiChainService;
  private wsConnections: Map<string, WebSocket> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {}

  public static getInstance(): MultiChainService {
    if (!MultiChainService.instance) {
      MultiChainService.instance = new MultiChainService();
    }
    return MultiChainService.instance;
  }

  // Portfolio Management
  async getPortfolioByChain(walletAddress: string, chainIds?: string[]): Promise<Record<string, Asset[]>> {
    try {
      // Mock implementation - replace with actual API calls
      const mockPortfolio: Record<string, Asset[]> = {
        'zetachain': [
          {
            id: '1',
            symbol: 'ZETA',
            name: 'Zeta',
            amount: 1250.5,
            usdValue: 1875.75,
            chainId: 'zetachain',
            chainName: 'ZetaChain',
            icon: '🟣',
            change24h: 2.5,
            apy: 8.5,
            decimals: 18
          },
          {
            id: '2',
            symbol: 'USDC',
            name: 'USD Coin',
            amount: 5000,
            usdValue: 5000,
            chainId: 'zetachain',
            chainName: 'ZetaChain',
            icon: '💵',
            change24h: 0,
            apy: 4.2,
            decimals: 6
          }
        ],
        'ethereum': [
          {
            id: '3',
            symbol: 'ETH',
            name: 'Ethereum',
            amount: 2.5,
            usdValue: 6250,
            chainId: 'ethereum',
            chainName: 'Ethereum',
            icon: '🔷',
            change24h: -1.2,
            apy: 3.8,
            decimals: 18
          }
        ],
        'solana': [
          {
            id: '4',
            symbol: 'SOL',
            name: 'Solana',
            amount: 45.8,
            usdValue: 4580,
            chainId: 'solana',
            chainName: 'Solana',
            icon: '🟢',
            change24h: 5.8,
            apy: 6.2,
            decimals: 9
          }
        ]
      };

      // Filter by chain IDs if specified
      if (chainIds) {
        const filtered: Record<string, Asset[]> = {};
        chainIds.forEach(chainId => {
          if (mockPortfolio[chainId]) {
            filtered[chainId] = mockPortfolio[chainId];
          }
        });
        return filtered;
      }

      return mockPortfolio;
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      throw new Error('Failed to fetch portfolio data');
    }
  }

  // Transaction Tracking
  async getTransactionStatus(txHash: string, chainId: string): Promise<TransactionStatus | null> {
    try {
      const blockchain = getBlockchainById(chainId);
      if (!blockchain) throw new Error('Unsupported blockchain');

      // Mock implementation - replace with actual blockchain RPC calls
      const mockTx: TransactionStatus = {
        id: txHash,
        chainId,
        chainName: blockchain.name,
        status: 'confirmed',
        txHash,
        timestamp: new Date(Date.now() - 300000),
        description: 'Mock transaction',
        gasUsed: '0.001',
        gasPrice: '0.000000001',
        blockNumber: Math.floor(Math.random() * 10000000),
        confirmations: 12,
        requiredConfirmations: 12
      };

      return mockTx;
    } catch (error) {
      console.error('Failed to fetch transaction status:', error);
      return null;
    }
  }

  async getTransactionsByChain(walletAddress: string, chainId: string, limit: number = 50): Promise<TransactionStatus[]> {
    try {
      // Mock implementation - replace with actual API calls
      const mockTransactions: TransactionStatus[] = [
        {
          id: '1',
          chainId,
          chainName: getBlockchainById(chainId)?.name || 'Unknown',
          status: 'confirmed',
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          timestamp: new Date(Date.now() - 300000),
          description: 'Deposit to lending pool',
          gasUsed: '0.001',
          gasPrice: '0.000000001',
          blockNumber: 12345678,
          confirmations: 12,
          requiredConfirmations: 12
        }
      ];

      return mockTransactions.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  }

  // Chain Status Monitoring
  async getChainStatus(chainId: string): Promise<ChainStatus | null> {
    try {
      const blockchain = getBlockchainById(chainId);
      if (!blockchain) return null;

      // Mock implementation - replace with actual health checks
      const mockStatus: ChainStatus = {
        chainId,
        isOnline: true,
        blockHeight: Math.floor(Math.random() * 100000000),
        lastBlockTime: new Date(Date.now() - Math.random() * 60000),
        gasPrice: '0.000000001',
        networkLoad: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        latency: Math.floor(Math.random() * 200) + 50
      };

      return mockStatus;
    } catch (error) {
      console.error('Failed to fetch chain status:', error);
      return null;
    }
  }

  async getAllChainsStatus(): Promise<ChainStatus[]> {
    try {
      const activeChains = ['zetachain', 'ethereum', 'solana', 'avalanche', 'base'];
      const statuses = await Promise.all(
        activeChains.map(chainId => this.getChainStatus(chainId))
      );
      return statuses.filter((status): status is ChainStatus => status !== null);
    } catch (error) {
      console.error('Failed to fetch all chains status:', error);
      return [];
    }
  }

  // Cross-Chain Operations
  async getCrossChainOperations(walletAddress: string): Promise<CrossChainOperation[]> {
    try {
      // Mock implementation - replace with actual cross-chain monitoring
      const mockOperations: CrossChainOperation[] = [
        {
          id: '1',
          sourceChain: 'ethereum',
          targetChain: 'zetachain',
          operation: 'transfer',
          status: 'completed',
          sourceTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          targetTxHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          amount: '1000',
          tokenSymbol: 'USDC',
          timestamp: new Date(Date.now() - 600000),
          estimatedCompletion: new Date(Date.now() - 300000)
        }
      ];

      return mockOperations;
    } catch (error) {
      console.error('Failed to fetch cross-chain operations:', error);
      return [];
    }
  }

  // Real-time Updates via WebSocket
  subscribeToChainUpdates(chainId: string, callback: (data: any) => void): () => void {
    const key = `chain_${chainId}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    
    this.eventListeners.get(key)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Gas Estimation
  async estimateGas(chainId: string, operation: 'deposit' | 'borrow' | 'repay' | 'liquidation'): Promise<string> {
    try {
      const blockchain = getBlockchainById(chainId);
      if (!blockchain) throw new Error('Unsupported blockchain');

      // Mock implementation - replace with actual gas estimation
      const gasEstimates = {
        deposit: blockchain.estimatedGas.deposit,
        borrow: blockchain.estimatedGas.borrow,
        repay: blockchain.estimatedGas.repay,
        liquidation: blockchain.estimatedGas.liquidation
      };

      return gasEstimates[operation].toString();
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  // Price Feeds
  async getTokenPrice(symbol: string, chainId: string): Promise<number> {
    try {
      // Mock implementation - replace with actual price oracle calls
      const mockPrices: Record<string, number> = {
        'ETH': 2500,
        'ZETA': 1.5,
        'SOL': 100,
        'USDC': 1,
        'AVAX': 25
      };

      return mockPrices[symbol] || 0;
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      return 0;
    }
  }

  // Cross-Chain Bridge Status
  async getBridgeStatus(sourceChain: string, targetChain: string): Promise<{
    isAvailable: boolean;
    estimatedTime: number;
    fee: string;
    minAmount: string;
    maxAmount: string;
  }> {
    try {
      // Mock implementation - replace with actual bridge API calls
      return {
        isAvailable: true,
        estimatedTime: 300, // 5 minutes
        fee: '0.001',
        minAmount: '10',
        maxAmount: '100000'
      };
    } catch (error) {
      console.error('Failed to fetch bridge status:', error);
      throw new Error('Failed to fetch bridge status');
    }
  }

  // Cleanup
  disconnect() {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
    this.eventListeners.clear();
  }
}

export default MultiChainService;
