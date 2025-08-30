import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { BlockchainConfig, getBlockchainByChainId, DEFAULT_BLOCKCHAIN } from '../config/blockchains';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  network: string | null;
  balance: string | null;
  connectionError: string | null;
  isDemoMode: boolean;
  zetaNetwork: 'mainnet' | 'testnet';
  setZetaNetwork: (network: 'mainnet' | 'testnet') => void;
  currentBlockchain: BlockchainConfig;
  setCurrentBlockchain: (blockchain: BlockchainConfig) => void;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  enableDemoMode: () => void;
  isMetaMaskInstalled: () => boolean;
  isKeplrInstalled: () => boolean;
  isPhantomInstalled: () => boolean;
  isCoinbaseWalletInstalled: () => boolean;
  isBraveWalletInstalled: () => boolean;
  isMetaMaskUnlocked: () => Promise<boolean>;
  getMetaMaskProvider: () => any;
  getAccountInfo: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  switchToBlockchain: (blockchain: BlockchainConfig) => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [zetaNetwork, setZetaNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [currentBlockchain, setCurrentBlockchain] = useState<BlockchainConfig>(DEFAULT_BLOCKCHAIN);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Check for MetaMask specifically, not just any ethereum provider
    const ethereum = (window as any).ethereum;
    const isInstalled = ethereum && ethereum.isMetaMask === true;
    console.log('MetaMask installed check:', isInstalled);
    return isInstalled;
  }, []);

  // Check if Keplr is installed
  const isKeplrInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isInstalled = !!(window as any).keplr;
    console.log('Keplr installed check:', isInstalled);
    return isInstalled;
  }, []);

  // Check if Phantom is installed
  const isPhantomInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isInstalled = !!(window as any).solana?.isPhantom;
    console.log('Phantom installed check:', isInstalled);
    return isInstalled;
  }, []);

  // Check if Coinbase Wallet is installed
  const isCoinbaseWalletInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const ethereum = (window as any).ethereum;
    const isInstalled = ethereum && ethereum.isCoinbaseWallet === true;
    console.log('Coinbase Wallet installed check:', isInstalled);
    return isInstalled;
  }, []);

  // Check if Brave Wallet is installed
  const isBraveWalletInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const ethereum = (window as any).ethereum;
    const isInstalled = ethereum && ethereum.isBraveWallet === true;
    console.log('Brave Wallet installed check:', isInstalled);
    return isInstalled;
  }, []);

  // Check if MetaMask is unlocked
  const isMetaMaskUnlocked = useCallback(async () => {
    if (!isMetaMaskInstalled()) return false;
    
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      return accounts && accounts.length > 0;
    } catch {
      return false;
    }
  }, [isMetaMaskInstalled]);

  // Get the correct MetaMask provider
  const getMetaMaskProvider = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const ethereum = (window as any).ethereum;
    
    // Check if there are multiple providers and find MetaMask
    if (ethereum && ethereum.providers) {
      const metaMaskProvider = ethereum.providers.find((provider: any) => provider.isMetaMask);
      if (metaMaskProvider) return metaMaskProvider;
    }
    
    // Return the main ethereum object if it's MetaMask
    if (ethereum && ethereum.isMetaMask) {
      return ethereum;
    }
    
    return null;
  }, []);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    const provider = getMetaMaskProvider();
    if (!provider) {
      throw new Error('MetaMask provider not found');
    }

    // Request accounts (this will trigger the popup)
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    if (accounts && accounts.length > 0) {
      const account = accounts[0];
      setAddress(account);
      setIsConnected(true);
      
      // Get chain ID
      const chainId = await provider.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainId, 16));
      
      // Get balance
      const balance = await provider.request({ 
        method: 'eth_getBalance', 
        params: [account, 'latest'] 
      });
      setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
      
      // Set network name
      const networkNames: { [key: number]: string } = {
        1: 'Ethereum Mainnet',
        137: 'Polygon',
        56: 'Binance Smart Chain',
        42161: 'Arbitrum',
        10: 'Optimism',
        8453: 'Base',
        59144: 'Linea'
      };
      setNetwork(networkNames[parseInt(chainId, 16)] || `Chain ID: ${parseInt(chainId, 16)}`);
      
      console.log('MetaMask connected successfully:', account);
    }
  }, [isMetaMaskInstalled, getMetaMaskProvider]);

  // Connect to Keplr
  const connectKeplr = useCallback(async () => {
    if (!isKeplrInstalled()) {
      throw new Error('Keplr is not installed. Please install Keplr to continue.');
    }

    try {
      const keplr = (window as any).keplr;
      
      // Enable Keplr
      await keplr.enable('cosmoshub-4'); // You can change this to your preferred chain
      
      // Get account info
      const offlineSigner = keplr.getOfflineSigner('cosmoshub-4');
      const accounts = await offlineSigner.getAccounts();
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setAddress(account.address);
        setIsConnected(true);
        setChainId(4); // Cosmoshub-4
        setNetwork('Cosmos Hub');
        setBalance('0'); // You would need to implement balance fetching for Cosmos
        
        console.log('Keplr connected successfully:', account.address);
      }
    } catch (error: any) {
      console.error('Keplr connection error:', error);
      throw new Error(error.message || 'Failed to connect Keplr');
    }
  }, [isKeplrInstalled]);

  // Connect to Phantom
  const connectPhantom = useCallback(async () => {
    if (!isPhantomInstalled()) {
      throw new Error('Phantom is not installed. Please install Phantom to continue.');
    }

    try {
      const solana = (window as any).solana;
      
      // Connect to Phantom
      const response = await solana.connect();
      const publicKey = response.publicKey.toString();
      
      setAddress(publicKey);
      setIsConnected(true);
      setChainId(101); // Solana mainnet
      setNetwork('Solana');
      setBalance('0'); // You would need to implement balance fetching for Solana
      
      console.log('Phantom connected successfully:', publicKey);
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      throw new Error(error.message || 'Failed to connect Phantom');
    }
  }, [isPhantomInstalled]);

  // Connect to Coinbase Wallet
  const connectCoinbaseWallet = useCallback(async () => {
    if (!isCoinbaseWalletInstalled()) {
      throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet to continue.');
    }

    try {
      const ethereum = (window as any).ethereum;
      
      // Request accounts (this will trigger the popup)
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setAddress(account);
        setIsConnected(true);
        
        // Get chain ID
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
        
        // Get balance
        const balance = await ethereum.request({ 
          method: 'eth_getBalance', 
          params: [account, 'latest'] 
        });
        setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
        
        // Set network name
        const networkNames: { [key: number]: string } = {
          1: 'Ethereum Mainnet',
          137: 'Polygon',
          56: 'Binance Smart Chain',
          42161: 'Arbitrum',
          10: 'Optimism',
          8453: 'Base',
          59144: 'Linea'
        };
        setNetwork(networkNames[parseInt(chainId, 16)] || `Chain ID: ${parseInt(chainId, 16)}`);
        
        console.log('Coinbase Wallet connected successfully:', account);
      }
    } catch (error: any) {
      console.error('Coinbase Wallet connection error:', error);
      throw new Error(error.message || 'Failed to connect Coinbase Wallet');
    }
  }, [isCoinbaseWalletInstalled]);

  // Connect to Brave Wallet
  const connectBraveWallet = useCallback(async () => {
    if (!isBraveWalletInstalled()) {
      throw new Error('Brave Wallet is not installed. Please install Brave Wallet to continue.');
    }

    try {
      const ethereum = (window as any).ethereum;
      
      // Request accounts (this will trigger the popup)
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setAddress(account);
        setIsConnected(true);
        
        // Get chain ID
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
        
        // Get balance
        const balance = await ethereum.request({ 
          method: 'eth_getBalance', 
          params: [account, 'latest'] 
        });
        setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
        
        // Set network name
        const networkNames: { [key: number]: string } = {
          1: 'Ethereum Mainnet',
          137: 'Polygon',
          56: 'Binance Smart Chain',
          42161: 'Arbitrum',
          10: 'Optimism',
          8453: 'Base',
          59144: 'Linea'
        };
        setNetwork(networkNames[parseInt(chainId, 16)] || `Chain ID: ${parseInt(chainId, 16)}`);
        
        console.log('Brave Wallet connected successfully:', account);
      }
    } catch (error: any) {
      console.error('Brave Wallet connection error:', error);
      throw new Error(error.message || 'Failed to connect Brave Wallet');
    }
  }, [isBraveWalletInstalled]);

  // Get account info without triggering popups
  const getAccountInfo = useCallback(async () => {
    const provider = getMetaMaskProvider();
    if (!provider) return;

    try {
      // Use eth_accounts instead of eth_requestAccounts to avoid popup
      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setAddress(account);
        setIsConnected(true);
        
        // Get chain ID
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
        
        // Get balance
        const balance = await provider.request({ 
          method: 'eth_getBalance', 
          params: [account, 'latest'] 
        });
        setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
        
        // Set network name
        const networkNames: { [key: number]: string } = {
          1: 'Ethereum Mainnet',
          137: 'Polygon',
          56: 'Binance Smart Chain',
          42161: 'Arbitrum',
          10: 'Optimism',
          8453: 'Base',
          59144: 'Linea'
        };
        setNetwork(networkNames[parseInt(chainId, 16)] || `Chain ID: ${parseInt(chainId, 16)}`);
      } else {
        // No accounts, but MetaMask is available
        setIsConnected(false);
        setAddress(null);
      }
    } catch (error) {
      console.error('Error getting account info:', error);
      setConnectionError('Failed to get account information');
    }
  }, [getMetaMaskProvider]);

  // Connect wallet with support for multiple wallet types
  const connect = useCallback(async (walletType: string = 'metamask') => {
    console.log('Attempting to connect wallet:', walletType);
    setIsConnecting(true);
    setConnectionError(null);

    try {
      switch (walletType.toLowerCase()) {
        case 'metamask':
          console.log('Connecting to MetaMask...');
          await connectMetaMask();
          break;
        case 'keplr':
          console.log('Connecting to Keplr...');
          await connectKeplr();
          break;
        case 'phantom':
          console.log('Connecting to Phantom...');
          await connectPhantom();
          break;
        case 'coinbase':
          console.log('Connecting to Coinbase Wallet...');
          await connectCoinbaseWallet();
          break;
        case 'brave':
          console.log('Connecting to Brave Wallet...');
          await connectBraveWallet();
          break;
        default:
          console.error('Unsupported wallet type:', walletType);
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }
      console.log('Wallet connection successful:', walletType);
    } catch (error: any) {
      console.error('Connection error:', error);
      
      if (error.code === 4001) {
        setConnectionError('User rejected the connection request');
      } else if (error.code === -32002) {
        setConnectionError('Wallet is already processing a request. Please check your wallet and try again.');
      } else {
        setConnectionError(error.message || 'Failed to connect wallet');
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connectMetaMask, connectKeplr, connectPhantom, connectCoinbaseWallet, connectBraveWallet]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setChainId(null);
    setNetwork(null);
    setBalance(null);
    setConnectionError(null);
    console.log('Wallet disconnected');
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!isConnected || !address) return;

    try {
      const provider = getMetaMaskProvider();
      if (!provider) return;

      const balance = await provider.request({ 
        method: 'eth_getBalance', 
        params: [address, 'latest'] 
      });
      setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [isConnected, address, getMetaMaskProvider]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!isConnected) return;

    try {
      const provider = getMetaMaskProvider();
      if (!provider) return;

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      // Refresh account info after network switch
      await getAccountInfo();
    } catch (error: any) {
      console.error('Error switching network:', error);
      
      if (error.code === 4902) {
        // Chain not added to MetaMask
        setConnectionError('Network not found in MetaMask. Please add it manually.');
      } else {
        setConnectionError('Failed to switch network');
      }
    }
  }, [isConnected, getMetaMaskProvider, getAccountInfo]);

  // Switch to specific blockchain
  const switchToBlockchain = useCallback(async (blockchain: BlockchainConfig) => {
    if (!isConnected) {
      // If not connected, just update the current blockchain
      setCurrentBlockchain(blockchain);
      return;
    }

    try {
      // For EVM chains, use MetaMask switching
      if (blockchain.id !== 'solana' && blockchain.id !== 'bitcoin') {
        await switchNetwork(blockchain.chainId);
        setCurrentBlockchain(blockchain);
      } else {
        // For non-EVM chains, show instructions
        setConnectionError(`${blockchain.name} requires a different wallet connection method.`);
      }
    } catch (error: any) {
      console.error('Error switching to blockchain:', error);
      setConnectionError(`Failed to switch to ${blockchain.name}`);
    }
  }, [isConnected, switchNetwork]);

  // Enable demo mode
  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setAddress('0x742d35Cc6634C0532925a3b8D16C09025A2f3c2E'); // Demo address
    setChainId(1);
    setNetwork('Demo Mode');
    setBalance('1.0000');
    console.log('Demo mode enabled');
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setConnectionError(null);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnect();
      } else if (accounts[0] !== address) {
        // Account changed
        setAddress(accounts[0]);
        // Call getAccountInfo directly to avoid dependency issues
        const provider = getMetaMaskProvider();
        if (provider) {
          provider.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              const account = accounts[0];
              setAddress(account);
              setIsConnected(true);
              
              // Get chain ID
              provider.request({ method: 'eth_chainId' }).then((chainId: string) => {
                setChainId(parseInt(chainId, 16));
                
                // Get balance
                provider.request({ 
                  method: 'eth_getBalance', 
                  params: [account, 'latest'] 
                }).then((balance: string) => {
                  setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
                });
                
                // Set network name
                const networkNames: { [key: number]: string } = {
                  1: 'Ethereum Mainnet',
                  137: 'Polygon',
                  56: 'Binance Smart Chain',
                  42161: 'Arbitrum',
                  10: 'Optimism',
                  8453: 'Base',
                  59144: 'Linea'
                };
                setNetwork(networkNames[parseInt(chainId, 16)] || `Chain ID: ${parseInt(chainId, 16)}`);
              });
            }
          });
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      // Reload the page when chain changes (recommended by MetaMask)
      window.location.reload();
    };

    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, disconnect]); // Removed getAccountInfo dependency

  // Auto-connect if MetaMask is already unlocked
  useEffect(() => {
    const autoConnect = async () => {
      if (isMetaMaskInstalled() && await isMetaMaskUnlocked()) {
        getAccountInfo();
      }
    };

    autoConnect();
  }, []); // Only run once on mount

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [isConnected, refreshBalance]);

  const value: WalletContextType = {
    address,
    isConnected,
    isConnecting,
    chainId,
    network,
    balance,
    connectionError,
    isDemoMode,
    zetaNetwork,
    setZetaNetwork,
    currentBlockchain,
    setCurrentBlockchain,
    connect,
    disconnect,
    enableDemoMode,
    isMetaMaskInstalled,
    isKeplrInstalled,
    isPhantomInstalled,
    isCoinbaseWalletInstalled,
    isBraveWalletInstalled,
    isMetaMaskUnlocked,
    getMetaMaskProvider,
    getAccountInfo,
    refreshBalance,
    switchNetwork,
    switchToBlockchain,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
