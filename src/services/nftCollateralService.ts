import { ethers } from 'ethers';

export interface NFTCollateral {
  id: string;
  userAddress: string;
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  lockedOnChain: string;
  targetChain: string;
  gameFiPlatform?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  floorPrice: string;
  collateralValue: string;
  loanToValue: number;
  maxBorrowable: string;
  isLocked: boolean;
  lockTimestamp?: string;
  unlockTimestamp?: string;
  metadata: {
    attributes: { trait_type: string; value: string }[];
    external_url?: string;
    animation_url?: string;
  };
  status: string;
  createdAt: string;
  lastUpdated: string;
}

export interface NFTHistory {
  id: string;
  event: string;
  timestamp: string;
  txHash: string;
  chain: string;
  details?: string;
}

export interface MarketplaceLinks {
  opensea: string;
  magiceden?: string;
  blur?: string;
  external?: string;
}

export interface LockNFTRequest {
  userAddress: string;
  chain: string;
  collateralValue: number;
}

export interface UnlockNFTRequest {
  userAddress: string;
  chain: string;
}

export interface BorrowAgainstNFTRequest {
  userAddress: string;
  amount: number;
  duration: number;
  targetChain: string;
}

export interface BridgeNFTRequest {
  userAddress: string;
  targetChain: string;
  bridgeProvider: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class NFTCollateralService {
  private apiBaseUrl: string;
  private zetaConfig: any;

  constructor() {
    this.apiBaseUrl = process.env.REACT_APP_NFT_COLLATERAL_API_URL || 'http://localhost:4001';
    this.zetaConfig = {
      rpcUrl: 'https://rpc.zetachain.net',
      chainId: 7000
    };
  }

  // Get all NFT collaterals for a user
  async getUserNFTCollaterals(userAddress: string): Promise<NFTCollateral[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${userAddress}`);
      const data: ApiResponse<NFTCollateral[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch NFT collaterals');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching NFT collaterals:', error);
      // Return mock data as fallback
      return this.getMockNFTCollaterals();
    }
  }

  // Get specific NFT collateral details
  async getNFTCollateralDetails(userAddress: string, nftId: string): Promise<NFTCollateral> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${userAddress}/${nftId}`);
      const data: ApiResponse<NFTCollateral> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch NFT collateral details');
      }
      
      return data.data!;
    } catch (error) {
      console.error('Error fetching NFT collateral details:', error);
      throw error;
    }
  }

  // Lock NFT as collateral
  async lockNFTAsCollateral(nftId: string, request: LockNFTRequest): Promise<{ success: boolean; txHash: string; updatedNFT: NFTCollateral }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${nftId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<{ txHash: string; updatedNFT: NFTCollateral }> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to lock NFT as collateral');
      }
      
      return {
        success: true,
        txHash: data.data!.txHash,
        updatedNFT: data.data!.updatedNFT
      };
    } catch (error) {
      console.error('Error locking NFT as collateral:', error);
      throw error;
    }
  }

  // Unlock NFT collateral
  async unlockNFTCollateral(nftId: string, request: UnlockNFTRequest): Promise<{ success: boolean; txHash: string; updatedNFT: NFTCollateral }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${nftId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<{ txHash: string; updatedNFT: NFTCollateral }> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to unlock NFT collateral');
      }
      
      return {
        success: true,
        txHash: data.data!.txHash,
        updatedNFT: data.data!.updatedNFT
      };
    } catch (error) {
      console.error('Error unlocking NFT collateral:', error);
      throw error;
    }
  }

  // Borrow against NFT collateral
  async borrowAgainstNFT(nftId: string, request: BorrowAgainstNFTRequest): Promise<{ success: boolean; txHash: string; message: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${nftId}/borrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<{ txHash: string; message: string }> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to borrow against NFT');
      }
      
      return {
        success: true,
        txHash: data.data!.txHash,
        message: data.data!.message
      };
    } catch (error) {
      console.error('Error borrowing against NFT:', error);
      throw error;
    }
  }

  // Get NFT transaction history
  async getNFTHistory(nftId: string): Promise<NFTHistory[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${nftId}/history`);
      const data: ApiResponse<NFTHistory[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch NFT history');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching NFT history:', error);
      return [];
    }
  }

  // Get marketplace links for NFT
  async getMarketplaceLinks(nftId: string): Promise<MarketplaceLinks> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${nftId}/marketplace`);
      const data: ApiResponse<MarketplaceLinks> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch marketplace links');
      }
      
      return data.data!;
    } catch (error) {
      console.error('Error fetching marketplace links:', error);
      throw error;
    }
  }

  // Bridge NFT to another chain
  async bridgeNFT(nftId: string, request: BridgeNFTRequest): Promise<{ success: boolean; bridgeTxHash: string; message: string; estimatedTime: string }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/nft-collateral/${nftId}/bridge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: ApiResponse<{ bridgeTxHash: string; message: string; estimatedTime: string }> = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to bridge NFT');
      }
      
      return {
        success: true,
        bridgeTxHash: data.data!.bridgeTxHash,
        message: data.data!.message,
        estimatedTime: data.data!.estimatedTime
      };
    } catch (error) {
      console.error('Error bridging NFT:', error);
      throw error;
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
  getMockNFTCollaterals(): NFTCollateral[] {
    return [
      {
        id: 'nft-001',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        tokenId: '1234',
        contractAddress: '0x1234567890123456789012345678901234567890',
        name: 'Dragon Slayer Sword',
        description: 'Epic rare sword from Fantasy Game X with fire enchantment',
        imageUrl: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Dragon+Sword',
        lockedOnChain: 'ethereum',
        targetChain: 'solana',
        gameFiPlatform: 'Fantasy Game X',
        rarity: 'epic',
        floorPrice: '2500',
        collateralValue: '3000',
        loanToValue: 70,
        maxBorrowable: '2100',
        isLocked: true,
        lockTimestamp: '2025-08-15T10:00:00Z',
        unlockTimestamp: '2025-11-15T10:00:00Z',
        metadata: {
          attributes: [
            { trait_type: 'Attack', value: '85' },
            { trait_type: 'Defense', value: '45' },
            { trait_type: 'Rarity', value: 'Epic' },
            { trait_type: 'Element', value: 'Fire' }
          ],
          external_url: 'https://fantasygamex.com/nft/1234',
          animation_url: 'https://fantasygamex.com/animations/sword.mp4'
        },
        status: 'active',
        createdAt: '2025-08-15T10:00:00Z',
        lastUpdated: '2025-08-15T10:00:00Z'
      },
      {
        id: 'nft-002',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        tokenId: '5678',
        contractAddress: '0x2345678901234567890123456789012345678901',
        name: 'Crypto Racer Car',
        description: 'Limited edition NFT car in Racing Game Y with turbo boost',
        imageUrl: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Crypto+Car',
        lockedOnChain: 'solana',
        targetChain: 'ethereum',
        gameFiPlatform: 'Racing Game Y',
        rarity: 'legendary',
        floorPrice: '5000',
        collateralValue: '6000',
        loanToValue: 65,
        maxBorrowable: '3900',
        isLocked: true,
        lockTimestamp: '2025-08-10T08:30:00Z',
        unlockTimestamp: '2025-10-10T08:30:00Z',
        metadata: {
          attributes: [
            { trait_type: 'Speed', value: '95' },
            { trait_type: 'Handling', value: '88' },
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Boost', value: 'Turbo' }
          ],
          external_url: 'https://racinggamey.com/nft/5678'
        },
        status: 'active',
        createdAt: '2025-08-10T08:30:00Z',
        lastUpdated: '2025-08-10T08:30:00Z'
      },
      {
        id: 'nft-003',
        userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        tokenId: '9012',
        contractAddress: '0x3456789012345678901234567890123456789012',
        name: 'Pixel Warrior',
        description: 'Rare pixel art warrior from Retro Game Z',
        imageUrl: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Pixel+Warrior',
        lockedOnChain: 'polygon',
        targetChain: 'avalanche',
        gameFiPlatform: 'Retro Game Z',
        rarity: 'rare',
        floorPrice: '800',
        collateralValue: '1000',
        loanToValue: 75,
        maxBorrowable: '750',
        isLocked: false,
        metadata: {
          attributes: [
            { trait_type: 'Strength', value: '72' },
            { trait_type: 'Agility', value: '68' },
            { trait_type: 'Rarity', value: 'Rare' },
            { trait_type: 'Style', value: 'Pixel' }
          ],
          external_url: 'https://retrogamez.com/nft/9012'
        },
        status: 'active',
        createdAt: '2025-08-10T08:30:00Z',
        lastUpdated: '2025-08-10T08:30:00Z'
      }
    ];
  }

  getMockNFTHistory(nftId: string): NFTHistory[] {
    const histories: { [key: string]: NFTHistory[] } = {
      'nft-001': [
        { 
          id: 'hist-001', 
          event: 'Locked as collateral', 
          timestamp: '2025-08-15T10:00:00Z',
          txHash: '0x123...abc',
          chain: 'ethereum',
          details: 'NFT locked on Ethereum for cross-chain borrowing'
        },
        { 
          id: 'hist-002', 
          event: 'Received loan in USDC', 
          timestamp: '2025-08-16T14:20:00Z',
          txHash: '0x456...def',
          chain: 'solana',
          details: 'Borrowed 1500 USDC on Solana using NFT collateral'
        }
      ],
      'nft-002': [
        { 
          id: 'hist-003', 
          event: 'Locked as collateral', 
          timestamp: '2025-08-10T08:30:00Z',
          txHash: '0x789...ghi',
          chain: 'solana',
          details: 'NFT locked on Solana for cross-chain borrowing'
        }
      ]
    };
    
    return histories[nftId] || [];
  }

  // Utility methods
  formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'legendary': return 'text-purple-600 bg-purple-100';
      case 'epic': return 'text-blue-600 bg-blue-100';
      case 'rare': return 'text-green-600 bg-green-100';
      case 'common': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getChainIcon(chain: string): string {
    const chainColors: { [key: string]: string } = {
      ethereum: 'text-blue-500',
      solana: 'text-green-500',
      polygon: 'text-purple-500',
      avalanche: 'text-red-500',
      bitcoin: 'text-orange-500'
    };
    return chainColors[chain.toLowerCase()] || 'text-gray-500';
  }

  calculateMaxBorrowable(collateralValue: string, ltv: number): string {
    const value = parseFloat(collateralValue);
    return (value * (ltv / 100)).toFixed(2);
  }

  validateBorrowRequest(amount: number, maxBorrowable: string): string[] {
    const errors: string[] = [];
    const max = parseFloat(maxBorrowable);
    
    if (amount <= 0) {
      errors.push('Borrow amount must be greater than 0');
    }
    
    if (amount > max) {
      errors.push(`Borrow amount cannot exceed maximum borrowable amount of $${max.toLocaleString()}`);
    }
    
    return errors;
  }

  async getZetaChainProvider(): Promise<ethers.Provider | null> {
    try {
      return new ethers.JsonRpcProvider(this.zetaConfig.rpcUrl);
    } catch (error) {
      console.error('Failed to create ZetaChain provider:', error);
      return null;
    }
  }

  // Simulate cross-chain operations for development
  async simulateCrossChainBorrow(nftId: string, amount: number, targetChain: string): Promise<{ success: boolean; txHash: string; estimatedTime: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    return {
      success: true,
      txHash,
      estimatedTime: '2-5 minutes'
    };
  }

  async simulateNFTBridge(nftId: string, targetChain: string, bridgeProvider: string): Promise<{ success: boolean; bridgeTxHash: string; estimatedTime: string }> {
    // Simulate bridge processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const bridgeTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    return {
      success: true,
      bridgeTxHash,
      estimatedTime: '5-10 minutes'
    };
  }
}

export default new NFTCollateralService();
