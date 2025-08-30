/**
 * @title Blockchain Configuration for Aegis Cross-Chain Lending
 * @dev Defines all supported blockchains with their network details, RPC endpoints, and contract addresses
 */

export interface BlockchainConfig {
  id: string;
  name: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  icon: string;
  color: string;
  isActive: boolean;
  isTestnet: boolean;
  vaultContractAddress?: string;
  universalLendingAddress?: string;
  supportedAssets: string[];
  gasToken: string;
  estimatedGas: {
    deposit: number;
    borrow: number;
    repay: number;
    liquidation: number;
  };
}

export const SUPPORTED_BLOCKCHAINS: BlockchainConfig[] = [
  {
    id: 'zetachain',
    name: 'ZetaChain',
    chainId: 7000, // Mainnet
    nativeCurrency: {
      name: 'Zeta',
      symbol: 'ZETA',
      decimals: 18,
    },
    rpcUrls: [
      'https://zetachain-evm.blockpi.network/v1/rpc/public',
      'https://rpc.ankr.com/zetachain_evm',
      'https://zetachain-mainnet-archive.allthatnode.com:8545'
    ],
    blockExplorerUrls: ['https://explorer.zetachain.com'],
    icon: '🟣',
    color: '#6366f1',
    isActive: true,
    isTestnet: false,
    universalLendingAddress: process.env.ZETA_UNIVERSAL_LENDING_ADDRESS || '0x...',
    supportedAssets: ['ZETA', 'USDC', 'ETH', 'BTC', 'SOL', 'AVAX'],
    gasToken: 'ZETA',
    estimatedGas: {
      deposit: 0.001,
      borrow: 0.002,
      repay: 0.001,
      liquidation: 0.003,
    },
  },
  {
    id: 'zetachain-testnet',
    name: 'ZetaChain Testnet',
    chainId: 7001,
    nativeCurrency: {
      name: 'Zeta',
      symbol: 'ZETA',
      decimals: 18,
    },
    rpcUrls: [
      'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
      'https://rpc.ankr.com/zetachain_evm_testnet',
      'https://zetachain-testnet-archive.allthatnode.com:8545'
    ],
    blockExplorerUrls: ['https://explorer.zetachain.com'],
    icon: '🟣',
    color: '#a855f7',
    isActive: true,
    isTestnet: true,
    universalLendingAddress: process.env.ZETA_TESTNET_UNIVERSAL_LENDING_ADDRESS || '0x...',
    supportedAssets: ['ZETA', 'USDC', 'ETH', 'BTC', 'SOL', 'AVAX'],
    gasToken: 'ZETA',
    estimatedGas: {
      deposit: 0.0001,
      borrow: 0.0002,
      repay: 0.0001,
      liquidation: 0.0003,
    },
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://ethereum.publicnode.com'
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    icon: '🔷',
    color: '#3b82f6',
    isActive: true,
    isTestnet: false,
    vaultContractAddress: process.env.ETHEREUM_VAULT_ADDRESS || '0x...',
    supportedAssets: ['ETH', 'USDC', 'USDT', 'WETH'],
    gasToken: 'ETH',
    estimatedGas: {
      deposit: 0.005,
      borrow: 0.008,
      repay: 0.005,
      liquidation: 0.01,
    },
  },
  {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.blockpi.network/v1/rpc/public',
      'https://1rpc.io/base'
    ],
    blockExplorerUrls: ['https://basescan.org'],
    icon: '🔵',
    color: '#0052ff',
    isActive: true,
    isTestnet: false,
    vaultContractAddress: process.env.BASE_VAULT_ADDRESS || '0x...',
    supportedAssets: ['ETH', 'USDC', 'USDbC'],
    gasToken: 'ETH',
    estimatedGas: {
      deposit: 0.0001,
      borrow: 0.0002,
      repay: 0.0001,
      liquidation: 0.0003,
    },
  },
  {
    id: 'base-testnet',
    name: 'Base Testnet',
    chainId: 84531,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://goerli.base.org',
      'https://base-goerli.blockpi.network/v1/rpc/public'
    ],
    blockExplorerUrls: ['https://goerli.basescan.org'],
    icon: '🔵',
    color: '#7c3aed',
    isActive: true,
    isTestnet: true,
    vaultContractAddress: process.env.BASE_TESTNET_VAULT_ADDRESS || '0x...',
    supportedAssets: ['ETH', 'USDC', 'USDbC'],
    gasToken: 'ETH',
    estimatedGas: {
      deposit: 0.00001,
      borrow: 0.00002,
      repay: 0.00001,
      liquidation: 0.00003,
    },
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: 43114,
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche',
      'https://avalanche.public-rpc.com'
    ],
    blockExplorerUrls: ['https://snowtrace.io'],
    icon: '❄️',
    color: '#e84142',
    isActive: true,
    isTestnet: false,
    vaultContractAddress: process.env.AVALANCHE_VAULT_ADDRESS || '0x...',
    supportedAssets: ['AVAX', 'USDC', 'WETH', 'USDT'],
    gasToken: 'AVAX',
    estimatedGas: {
      deposit: 0.01,
      borrow: 0.015,
      repay: 0.01,
      liquidation: 0.02,
    },
  },
  {
    id: 'avalanche-testnet',
    name: 'Avalanche Testnet',
    chainId: 43113,
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: [
      'https://api.avax-test.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche_fuji'
    ],
    blockExplorerUrls: ['https://testnet.snowtrace.io'],
    icon: '❄️',
    color: '#f97316',
    isActive: true,
    isTestnet: true,
    vaultContractAddress: process.env.AVALANCHE_TESTNET_VAULT_ADDRESS || '0x...',
    supportedAssets: ['AVAX', 'USDC', 'WETH', 'USDT'],
    gasToken: 'AVAX',
    estimatedGas: {
      deposit: 0.001,
      borrow: 0.0015,
      repay: 0.001,
      liquidation: 0.002,
    },
  },
  {
    id: 'solana',
    name: 'Solana',
    chainId: 1399811150, // Custom chain ID for Solana in EVM context
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ],
    blockExplorerUrls: ['https://explorer.solana.com'],
    icon: '🟢',
    color: '#14f195',
    isActive: true,
    isTestnet: false,
    vaultContractAddress: 'AegisVaultSol1111111111111111111111111111111',
    supportedAssets: ['SOL', 'USDC', 'RAY'],
    gasToken: 'SOL',
    estimatedGas: {
      deposit: 0.000005,
      borrow: 0.00001,
      repay: 0.000005,
      liquidation: 0.000015,
    },
  },
  {
    id: 'solana-testnet',
    name: 'Solana Testnet',
    chainId: 1399811149,
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: [
      'https://api.testnet.solana.com',
      'https://api.devnet.solana.com'
    ],
    blockExplorerUrls: ['https://explorer.solana.com'],
    icon: '🟢',
    color: '#10b981',
    isActive: true,
    isTestnet: true,
    vaultContractAddress: 'AegisVaultSol1111111111111111111111111111111',
    supportedAssets: ['SOL', 'USDC', 'RAY'],
    gasToken: 'SOL',
    estimatedGas: {
      deposit: 0.000001,
      borrow: 0.000002,
      repay: 0.000001,
      liquidation: 0.000003,
    },
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    chainId: 8332, // Custom chain ID for Bitcoin in EVM context
    nativeCurrency: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
    },
    rpcUrls: [
      'https://blockstream.info/api',
      'https://mempool.space/api'
    ],
    blockExplorerUrls: ['https://blockstream.info', 'https://mempool.space'],
    icon: '🟡',
    color: '#f7931a',
    isActive: true,
    isTestnet: false,
    vaultContractAddress: process.env.BTC_VAULT_ADDRESS || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    supportedAssets: ['BTC'],
    gasToken: 'BTC',
    estimatedGas: {
      deposit: 0.0001,
      borrow: 0.0002,
      repay: 0.0001,
      liquidation: 0.0003,
    },
  },
  {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network',
      'https://rpc.ankr.com/polygon'
    ],
    blockExplorerUrls: ['https://polygonscan.com'],
    icon: '🟣',
    color: '#8247e5',
    isActive: false, // Not yet implemented
    isTestnet: false,
    vaultContractAddress: process.env.POLYGON_VAULT_ADDRESS || '0x...',
    supportedAssets: ['MATIC', 'USDC', 'USDT', 'WETH'],
    gasToken: 'MATIC',
    estimatedGas: {
      deposit: 0.001,
      borrow: 0.002,
      repay: 0.001,
      liquidation: 0.003,
    },
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    chainId: 42161,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
      'https://arbitrum-one.publicnode.com'
    ],
    blockExplorerUrls: ['https://arbiscan.io'],
    icon: '🔵',
    color: '#28a0f0',
    isActive: false, // Not yet implemented
    isTestnet: false,
    vaultContractAddress: process.env.ARBITRUM_VAULT_ADDRESS || '0x...',
    supportedAssets: ['ETH', 'USDC', 'USDT', 'WETH'],
    gasToken: 'ETH',
    estimatedGas: {
      deposit: 0.0005,
      borrow: 0.001,
      repay: 0.0005,
      liquidation: 0.0015,
    },
  },
];

// Helper functions
export const getBlockchainById = (id: string): BlockchainConfig | undefined => {
  return SUPPORTED_BLOCKCHAINS.find(chain => chain.id === id);
};

export const getBlockchainByChainId = (chainId: number): BlockchainConfig | undefined => {
  return SUPPORTED_BLOCKCHAINS.find(chain => chain.chainId === chainId);
};

export const getActiveBlockchains = (): BlockchainConfig[] => {
  return SUPPORTED_BLOCKCHAINS.filter(chain => chain.isActive);
};

export const getMainnetBlockchains = (): BlockchainConfig[] => {
  return SUPPORTED_BLOCKCHAINS.filter(chain => chain.isActive && !chain.isTestnet);
};

export const getTestnetBlockchains = (): BlockchainConfig[] => {
  return SUPPORTED_BLOCKCHAINS.filter(chain => chain.isActive && chain.isTestnet);
};

export const getBlockchainsByType = (type: 'evm' | 'non-evm'): BlockchainConfig[] => {
  const nonEvmChains = ['solana', 'bitcoin'];
  return SUPPORTED_BLOCKCHAINS.filter(chain => 
    chain.isActive && 
    (type === 'evm' ? !nonEvmChains.includes(chain.id) : nonEvmChains.includes(chain.id))
  );
};

// Network switching helpers
export const addNetworkToMetaMask = async (blockchain: BlockchainConfig): Promise<void> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not installed');
  }

  const ethereum = (window as any).ethereum;
  
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${blockchain.chainId.toString(16)}`,
        chainName: blockchain.name,
        nativeCurrency: blockchain.nativeCurrency,
        rpcUrls: blockchain.rpcUrls,
        blockExplorerUrls: blockchain.blockExplorerUrls,
      }],
    });
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected network addition');
    } else {
      throw new Error(`Failed to add network: ${error.message}`);
    }
  }
};

export const switchToNetwork = async (blockchain: BlockchainConfig): Promise<void> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not installed');
  }

  const ethereum = (window as any).ethereum;
  
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${blockchain.chainId.toString(16)}` }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added to MetaMask, add it first
      await addNetworkToMetaMask(blockchain);
      // Then switch to it
      await switchToNetwork(blockchain);
    } else if (error.code === 4001) {
      throw new Error('User rejected network switch');
    } else {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }
};

// Default blockchain
export const DEFAULT_BLOCKCHAIN = SUPPORTED_BLOCKCHAINS.find(chain => chain.id === 'zetachain')!;
export const DEFAULT_TESTNET_BLOCKCHAIN = SUPPORTED_BLOCKCHAINS.find(chain => chain.id === 'zetachain-testnet')!;
