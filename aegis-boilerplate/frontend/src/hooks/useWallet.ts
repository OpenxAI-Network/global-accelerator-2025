import { useState, useEffect, useCallback } from 'react';
import { ConnectedWallet, WalletType, WalletStatus, WalletConnectionError } from '../types/wallet';

export const useWallet = () => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallets from localStorage on mount
  useEffect(() => {
    const savedWallets = localStorage.getItem('aegis-connected-wallets');
    if (savedWallets) {
      try {
        const wallets = JSON.parse(savedWallets);
        setConnectedWallets(wallets);
      } catch (err) {
        console.error('Failed to parse saved wallets:', err);
      }
    }
  }, []);

  // Save wallets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aegis-connected-wallets', JSON.stringify(connectedWallets));
  }, [connectedWallets]);

  const connectWallet = useCallback(async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      let wallet: ConnectedWallet;

      switch (walletId) {
        case 'metamask':
          wallet = await connectMetaMask();
          break;
        case 'phantom':
          wallet = await connectPhantom();
          break;
        case 'coinbase':
          wallet = await connectCoinbaseWallet();
          break;
        case 'btc':
          wallet = await connectBitcoinWallet();
          break;
        case 'walletconnect':
          wallet = await connectWalletConnect();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletId}`);
      }

      setConnectedWallets(prev => {
        const existing = prev.find(w => w.id === wallet.id);
        if (existing) {
          return prev.map(w => w.id === wallet.id ? { ...wallet, status: WalletStatus.CONNECTED } : w);
        }
        return [...prev, { ...wallet, status: WalletStatus.CONNECTED }];
      });

      return wallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async (walletId: string) => {
    try {
      setConnectedWallets(prev => 
        prev.map(wallet => 
          wallet.id === walletId 
            ? { ...wallet, status: WalletStatus.DISCONNECTED }
            : wallet
        )
      );
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, []);

  const refreshWalletBalances = useCallback(async () => {
    // This would typically call your backend API to get updated balances
    // For now, we'll just update the last connected time
    setConnectedWallets(prev =>
      prev.map(wallet => ({
        ...wallet,
        lastConnected: new Date()
      }))
    );
  }, []);

  // Wallet-specific connection functions
  const connectMetaMask = async (): Promise<ConnectedWallet> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainName = getChainName(parseInt(chainId, 16));

    return {
      id: `metamask-${account}`,
      name: 'MetaMask',
      icon: '🦊',
      address: account,
      chainId: parseInt(chainId, 16),
      chainName,
      type: WalletType.EVM,
      status: WalletStatus.CONNECTED,
      lastConnected: new Date()
    };
  };

  const connectPhantom = async (): Promise<ConnectedWallet> => {
    if (typeof window.solana === 'undefined') {
      throw new Error('Phantom not installed');
    }

    const response = await window.solana.connect();
    const publicKey = response.publicKey.toString();

    return {
      id: `phantom-${publicKey}`,
      name: 'Phantom',
      icon: '👻',
      address: publicKey,
      chainId: 101, // Solana mainnet
      chainName: 'Solana',
      type: WalletType.SOLANA,
      status: WalletStatus.CONNECTED,
      lastConnected: new Date()
    };
  };

  const connectCoinbaseWallet = async (): Promise<ConnectedWallet> => {
    if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
      throw new Error('Coinbase Wallet not installed');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainName = getChainName(parseInt(chainId, 16));

    return {
      id: `coinbase-${account}`,
      name: 'Coinbase Wallet',
      icon: '🪙',
      address: account,
      chainId: parseInt(chainId, 16),
      chainName,
      type: WalletType.EVM,
      status: WalletStatus.CONNECTED,
      lastConnected: new Date()
    };
  };

  const connectBitcoinWallet = async (): Promise<ConnectedWallet> => {
    // This would integrate with a Bitcoin wallet like Unisat, Xverse, etc.
    // For now, we'll create a placeholder
    throw new Error('Bitcoin wallet integration not yet implemented');
  };

  const connectWalletConnect = async (): Promise<ConnectedWallet> => {
    // This would integrate with WalletConnect v2
    // For now, we'll create a placeholder
    throw new Error('WalletConnect integration not yet implemented');
  };

  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      43114: 'Avalanche',
      56: 'BNB Chain',
      7000: 'ZetaChain'
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  return {
    connectedWallets,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    refreshWalletBalances
  };
};

// Extend Window interface for wallet providers
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}
