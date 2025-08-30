// Wallet Configuration to reduce MetaMask popups
export const WALLET_CONFIG = {
  // Auto-connect settings
  AUTO_CONNECT: true,
  AUTO_CONNECT_DELAY: 1000, // 1 second delay
  
  // Connection caching
  CACHE_CONNECTION: true,
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  
  // Popup reduction settings
  REDUCE_POPUPS: true,
  USE_ETH_ACCOUNTS_FIRST: true, // Use eth_accounts before eth_requestAccounts
  
  // Network switching
  AUTO_ADD_NETWORKS: true,
  NETWORK_SWITCH_TIMEOUT: 10000, // 10 seconds
  
  // Error handling
  SHOW_CONNECTION_ERRORS: true,
  ERROR_DISPLAY_DURATION: 5000, // 5 seconds
  
  // Supported networks
  SUPPORTED_NETWORKS: [
    {
      chainId: 1,
      name: 'Ethereum Mainnet',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
      explorer: 'https://etherscan.io',
      color: '#627eea'
    },
    {
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: 'https://polygon-rpc.com',
      explorer: 'https://polygonscan.com',
      color: '#8247e5'
    },
    {
      chainId: 56,
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      rpcUrl: 'https://bsc-dataseed.binance.org',
      explorer: 'https://bscscan.com',
      color: '#f0b90b'
    },
    {
      chainId: 42161,
      name: 'Arbitrum',
      symbol: 'ETH',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      explorer: 'https://arbiscan.io',
      color: '#28a0f0'
    },
    {
      chainId: 10,
      name: 'Optimism',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.optimism.io',
      explorer: 'https://optimistic.etherscan.io',
      color: '#ff0420'
    },
    {
      chainId: 8453,
      name: 'Base',
      symbol: 'ETH',
      rpcUrl: 'https://mainnet.base.org',
      explorer: 'https://basescan.org',
      color: '#0052ff'
    },
    {
      chainId: 59144,
      name: 'Linea',
      symbol: 'ETH',
      rpcUrl: 'https://rpc.linea.build',
      explorer: 'https://lineascan.build',
      color: '#61dafb'
    }
  ],
  
  // MetaMask specific settings
  METAMASK: {
    // Reduce popup frequency
    MIN_POPUP_INTERVAL: 2000, // 2 seconds between popups
    
    // Connection preferences
    PREFER_EXISTING_CONNECTION: true,
    SKIP_CONNECTION_IF_ALREADY_CONNECTED: true,
    
    // Network preferences
    PREFER_MAINNET: true,
    AUTO_SWITCH_TO_MAINNET: false,
    
    // Error handling
    SUPPRESS_COMMON_ERRORS: true,
    HANDLE_USER_REJECTION_GRACEFULLY: true
  }
};

// Helper functions to reduce popups
export const POPUP_REDUCTION = {
  // Check if we can avoid showing a popup
  canAvoidPopup: (action: string): boolean => {
    const lastPopup = localStorage.getItem(`last-popup-${action}`);
    if (!lastPopup) return false;
    
    const timeSinceLastPopup = Date.now() - parseInt(lastPopup);
    return timeSinceLastPopup < WALLET_CONFIG.METAMASK.MIN_POPUP_INTERVAL;
  },
  
  // Record popup shown
  recordPopup: (action: string): void => {
    localStorage.setItem(`last-popup-${action}`, Date.now().toString());
  },
  
  // Check if user has recently rejected
  hasRecentRejection: (action: string): boolean => {
    const lastRejection = localStorage.getItem(`last-rejection-${action}`);
    if (!lastRejection) return false;
    
    const timeSinceRejection = Date.now() - parseInt(lastRejection);
    return timeSinceRejection < 30000; // 30 seconds
  },
  
  // Record user rejection
  recordRejection: (action: string): void => {
    localStorage.setItem(`last-rejection-${action}`, Date.now().toString());
  }
};

// Connection state management
export const CONNECTION_STATE = {
  // Get cached connection state
  getCachedState: () => {
    try {
      const cached = localStorage.getItem('aegis-wallet-state');
      if (!cached) return null;
      
      const state = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (state.timestamp && (now - state.timestamp) < WALLET_CONFIG.CACHE_DURATION) {
        return state;
      }
      
      // Cache expired, remove it
      localStorage.removeItem('aegis-wallet-state');
      return null;
    } catch {
      return null;
    }
  },
  
  // Cache connection state
  cacheState: (state: any): void => {
    try {
      const stateWithTimestamp = {
        ...state,
        timestamp: Date.now()
      };
      localStorage.setItem('aegis-wallet-state', JSON.stringify(stateWithTimestamp));
    } catch (error) {
      console.warn('Failed to cache wallet state:', error);
    }
  },
  
  // Clear cached state
  clearCachedState: (): void => {
    localStorage.removeItem('aegis-wallet-state');
  }
};
