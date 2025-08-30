import type { SupportedChain } from '../types/wallet';

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    explorerUrl: 'https://etherscan.io/tx/',
    name: 'Ethereum Mainnet',
    chainId: 1,
    icon: '🔷',
    colorHex: '#627eea',
  },
  {
    explorerUrl: 'https://polygonscan.com/tx/',
    name: 'Polygon',
    chainId: 137,
    icon: '🟣',
    colorHex: '#8247e5',
  },
  {
    explorerUrl: 'https://bscscan.com/tx/',
    name: 'Binance Smart Chain',
    chainId: 56,
    icon: '🟡',
    colorHex: '#f0b90b',
  },
  {
    explorerUrl: 'https://arbiscan.io/tx/',
    name: 'Arbitrum',
    chainId: 42161,
    icon: '🔵',
    colorHex: '#28a0f0',
  },
  {
    explorerUrl: 'https://optimistic.etherscan.io/tx/',
    name: 'Optimism',
    chainId: 10,
    icon: '🔴',
    colorHex: '#ff0420',
  },
  {
    explorerUrl: 'https://basescan.org/tx/',
    name: 'Base',
    chainId: 8453,
    icon: '🔵',
    colorHex: '#0052ff',
  },
];

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(
  (chain) => chain.chainId
);