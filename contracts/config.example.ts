// AEGIS Protocol Configuration Example
// Copy this file to config.ts and fill in your values

export const CONFIG = {
  // Private key for deployment (without 0x prefix)
  PRIVATE_KEY: "your_private_key_here",
  
  // ZetaChain API key for contract verification
  ZETA_API_KEY: "your_zeta_api_key_here",
  
  // RPC URLs
  RPC_URLS: {
    ZETA_TESTNET: "https://rpc.ankr.com/zeta_testnet",
    ZETA_MAINNET: "https://rpc.ankr.com/zeta",
    BSC_TESTNET: "https://data-seed-prebsc-1-s1.binance.org:8545",
    POLYGON_TESTNET: "https://rpc-mumbai.maticvigil.com",
    LOCALNET: "http://localhost:8545"
  },
  
  // Gas settings
  GAS: {
    LIMIT: 5000000,
    PRICE: "20000000000" // 20 gwei
  },
  
  // Chain IDs
  CHAIN_IDS: {
    ETHEREUM: 1,
    POLYGON: 137,
    BSC: 56,
    ARBITRUM: 42161,
    OPTIMISM: 10,
    ZETA_TESTNET: 7001,
    ZETA_MAINNET: 7000,
    LOCALNET: 1337
  },
  
  // Protocol parameters
  PROTOCOL: {
    BASIS_POINTS: 10000,
    MIN_LIQUIDATION_THRESHOLD: 8000, // 80%
    MAX_LIQUIDATION_THRESHOLD: 9500, // 95%
    LIQUIDATION_PENALTY: 500, // 5%
    MAX_INTEREST_RATE: 2000 // 20%
  },
  
  // Default risk profiles
  DEFAULT_RISK_PROFILES: {
    USDC: {
      maxLTV: 8500, // 85%
      liquidationThreshold: 9000, // 90%
      volatilityScore: 20 // Low volatility
    },
    ETH: {
      maxLTV: 7500, // 75%
      liquidationThreshold: 8500, // 85%
      volatilityScore: 60 // Medium volatility
    },
    BTC: {
      maxLTV: 7000, // 70%
      liquidationThreshold: 8000, // 80%
      volatilityScore: 80 // High volatility
    }
  },
  
  // Default prices (in USD with 8 decimals)
  DEFAULT_PRICES: {
    USDC: 100000000, // $1.00
    ETH: 2000000000, // $2000
    BTC: 40000000000 // $40000
  }
};

export default CONFIG; 