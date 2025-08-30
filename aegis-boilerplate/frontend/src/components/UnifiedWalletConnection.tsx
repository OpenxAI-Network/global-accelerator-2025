import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { WalletType, WalletStatus } from '../types/wallet';

interface UnifiedWalletConnectionProps {
  onWalletConnect: (wallet: WalletType) => void;
  onWalletDisconnect: () => void;
}

const UnifiedWalletConnection: React.FC<UnifiedWalletConnectionProps> = ({
  onWalletConnect,
  onWalletDisconnect
}) => {
  const { 
    connectedWallets, 
    connectWallet, 
    disconnectWallet, 
    isConnecting,
    error 
  } = useWallet();

  const [showWalletList, setShowWalletList] = useState(false);

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Ethereum & EVM chains',
      type: WalletType.EVM
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Solana & Solana-based chains',
      type: WalletType.SOLANA
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🪙',
      description: 'Multi-chain support',
      type: WalletType.EVM
    },
    {
      id: 'btc',
      name: 'Bitcoin Wallet',
      icon: '₿',
      description: 'Bitcoin & Lightning',
      type: WalletType.BTC
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Universal wallet connection',
      type: WalletType.UNIVERSAL
    }
  ];

  const handleConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId);
      setShowWalletList(false);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleDisconnect = async (walletId: string) => {
    try {
      await disconnectWallet(walletId);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  };

  const getWalletStatusIcon = (status: WalletStatus) => {
    switch (status) {
      case WalletStatus.CONNECTED:
        return '🟢';
      case WalletStatus.CONNECTING:
        return '🟡';
      case WalletStatus.DISCONNECTED:
        return '🔴';
      case WalletStatus.ERROR:
        return '❌';
      default:
        return '⚪';
    }
  };

  return (
    <div className="wallet-connection">
      <div className="wallet-header">
        <h3>Connected Wallets</h3>
        <button
          onClick={() => setShowWalletList(!showWalletList)}
          className="btn-primary"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : '+ Add Wallet'}
        </button>
      </div>

      {/* Connected Wallets Display */}
      <div className="connected-wallets">
        {connectedWallets.length === 0 ? (
          <div className="no-wallets">
            <p>No wallets connected</p>
            <p className="text-sm text-gray-500">
              Connect your first wallet to get started
            </p>
          </div>
        ) : (
          connectedWallets.map((wallet) => (
            <div key={wallet.id} className="wallet-item">
              <div className="wallet-info">
                <span className="wallet-icon">{wallet.icon}</span>
                <div className="wallet-details">
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-address">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                  <span className="wallet-chain">{wallet.chainName}</span>
                </div>
                <span className="wallet-status">
                  {getWalletStatusIcon(wallet.status)}
                </span>
              </div>
              <button
                onClick={() => handleDisconnect(wallet.id)}
                className="btn-disconnect"
                disabled={wallet.status === WalletStatus.CONNECTING}
              >
                Disconnect
              </button>
            </div>
          ))
        )}
      </div>

      {/* Wallet Selection Modal */}
      {showWalletList && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletList(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <h3>Choose Wallet</h3>
              <button 
                onClick={() => setShowWalletList(false)}
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <div className="wallet-options">
              {walletOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleConnect(option.id)}
                  className="wallet-option"
                  disabled={isConnecting}
                >
                  <span className="wallet-option-icon">{option.icon}</span>
                  <div className="wallet-option-details">
                    <span className="wallet-option-name">{option.name}</span>
                    <span className="wallet-option-description">
                      {option.description}
                    </span>
                  </div>
                  <span className="wallet-option-arrow">→</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="error-message">
                <p>❌ {error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cross-Chain Linking Info */}
      {connectedWallets.length > 1 && (
        <div className="cross-chain-info">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h4>Cross-Chain Identity Linked</h4>
            <p>
              Your wallets are automatically linked across chains via ZetaChain. 
              Manage all your positions from one dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedWalletConnection;
