import React, { useState } from 'react';
import { X, Wallet, ExternalLink, ChevronRight, Globe, Brain, Zap, Shield, Activity, CreditCard, Target } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'evm' | 'solana' | 'cosmos' | 'universal' | 'bitcoin';
  status: 'available' | 'installed' | 'not-installed';
  chains: string[];
  features: string[];
}

const WalletConnectionModal = ({ isOpen, onClose }: WalletConnectionModalProps) => {
  const { connect, isConnecting, connectionError, clearError, isMetaMaskInstalled, isKeplrInstalled, isPhantomInstalled, isCoinbaseWalletInstalled, isBraveWalletInstalled, enableDemoMode } = useWallet();
  const navigate = useNavigate();
  const [selectedWalletType, setSelectedWalletType] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Ethereum & EVM chains',
      type: 'evm',
      status: isMetaMaskInstalled() ? 'installed' : 'not-installed',
      chains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism'],
      features: ['Hardware Wallet Support', 'Token Management', 'DApp Browser']
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Solana & Solana-based chains',
      type: 'solana',
      status: isPhantomInstalled() ? 'installed' : 'not-installed',
      chains: ['Solana', 'Devnet', 'Testnet'],
      features: ['NFT Support', 'Staking', 'Multi-account']
    },
    {
      id: 'keplr',
      name: 'Keplr',
      icon: '🔮',
      description: 'Cosmos ecosystem chains',
      type: 'cosmos',
      status: isKeplrInstalled() ? 'installed' : 'not-installed',
      chains: ['Cosmos Hub', 'Osmosis', 'Juno', 'Stargaze'],
      features: ['Staking', 'Governance', 'IBC Transfers']
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Universal wallet connection',
      type: 'universal',
      status: 'available',
      chains: ['All Supported Chains'],
      features: ['Mobile Wallets', 'QR Code', 'Cross-platform']
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🪙',
      description: 'Multi-chain support',
      type: 'evm',
      status: isCoinbaseWalletInstalled() ? 'installed' : 'not-installed',
      chains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum'],
      features: ['Fiat Onramp', 'DApp Browser', 'Social Recovery']
    },
    {
      id: 'brave',
      name: 'Brave Wallet',
      icon: '🦁',
      description: 'Built-in browser wallet',
      type: 'evm',
      status: isBraveWalletInstalled() ? 'installed' : 'not-installed',
      chains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum'],
      features: ['Privacy Focused', 'Built-in Browser', 'Shield Rewards']
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: '🌈',
      description: 'Beautiful mobile wallet',
      type: 'evm',
      status: 'available',
      chains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum'],
      features: ['Beautiful UI', 'NFT Support', 'Social Features']
    },
    {
      id: 'argent',
      name: 'Argent',
      icon: '🛡️',
      description: 'Smart contract wallet',
      type: 'evm',
      status: 'available',
      chains: ['Ethereum', 'Polygon', 'Arbitrum'],
      features: ['Social Recovery', 'Guardian System', 'DeFi Integration']
    }
  ];

  const handleConnect = async (walletId: string) => {
    try {
      clearError();
      await connect(walletId);
      onClose();
      // Navigate to the main app interface after successful connection
      navigate('/app');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getWalletStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'text-green-400';
      case 'available': return 'text-blue-400';
      case 'not-installed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getWalletStatusIcon = (status: string) => {
    switch (status) {
      case 'installed': return '✅';
      case 'available': return '🔗';
      case 'not-installed': return '📥';
      default: return '⚪';
    }
  };

  const getWalletTypeColor = (type: string) => {
    switch (type) {
      case 'evm': return 'from-blue-500 to-blue-600';
      case 'solana': return 'from-purple-500 to-purple-600';
      case 'cosmos': return 'from-green-500 to-green-600';
      case 'universal': return 'from-orange-500 to-orange-600';
      case 'bitcoin': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Wallet size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Connect Wallet</h2>
              <p className="text-gray-400 text-lg">Choose your preferred wallet to access Aegis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Supported Networks */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-blue-400" />
            Supported Networks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-lg">🔷</span>
              <span className="text-sm text-blue-400">Ethereum</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <span className="text-lg">🔺</span>
              <span className="text-sm text-purple-400">Polygon</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <span className="text-lg">🟡</span>
              <span className="text-sm text-yellow-400">BSC</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-lg">🔵</span>
              <span className="text-sm text-green-400">Arbitrum</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <span className="text-lg">🟠</span>
              <span className="text-sm text-orange-400">Solana</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <span className="text-lg">🟣</span>
              <span className="text-sm text-indigo-400">Cosmos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <span className="text-lg">🔴</span>
              <span className="text-sm text-red-400">Optimism</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <span className="text-lg">🟢</span>
              <span className="text-sm text-teal-400">Base</span>
            </div>
          </div>
        </div>

        {/* Wallet Options Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-green-400" />
            Available Wallets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walletOptions.map((wallet) => (
              <div
                key={wallet.id}
                className={`p-6 border rounded-xl transition-all hover:scale-105 cursor-pointer group ${
                  selectedWalletType === wallet.id
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                }`}
                onClick={() => setSelectedWalletType(wallet.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getWalletTypeColor(wallet.type)} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                      {wallet.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{wallet.name}</h4>
                      <p className="text-gray-400 text-sm">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getWalletStatusColor(wallet.status)}`}>
                      {getWalletStatusIcon(wallet.status)}
                    </span>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Supported Chains</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {wallet.chains.slice(0, 3).map((chain, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                          {chain}
                        </span>
                      ))}
                      {wallet.chains.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                          +{wallet.chains.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Features</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {wallet.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700/30 rounded text-xs text-gray-400">
                          {feature}
                        </span>
                      ))}
                      {wallet.features.length > 2 && (
                        <span className="px-2 py-1 bg-gray-700/30 rounded text-xs text-gray-400">
                          +{wallet.features.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Wallet Details */}
        {selectedWalletType && (
          <div className="mb-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Wallet Details</h4>
              <button
                onClick={() => setSelectedWalletType(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {(() => {
              const wallet = walletOptions.find(w => w.id === selectedWalletType);
              if (!wallet) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${getWalletTypeColor(wallet.type)} rounded-xl flex items-center justify-center text-3xl`}>
                      {wallet.icon}
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold text-white">{wallet.name}</h5>
                      <p className="text-gray-400">{wallet.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${getWalletStatusColor(wallet.status)}`}>
                          {getWalletStatusIcon(wallet.status)} {wallet.status.replace('-', ' ')}
                        </span>
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                          {wallet.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-sm font-medium text-gray-300 mb-2">Supported Chains</h6>
                      <div className="space-y-2">
                        {wallet.chains.map((chain, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-gray-300">{chain}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h6 className="text-sm font-medium text-gray-300 mb-2">Key Features</h6>
                      <div className="space-y-2">
                        {wallet.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleConnect(wallet.id)}
                      disabled={isConnecting || wallet.status === 'not-installed'}
                      className={`w-full px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        wallet.status === 'not-installed'
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white hover:scale-105 shadow-lg'
                      }`}
                    >
                      {isConnecting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Connecting...
                        </div>
                      ) : wallet.status === 'not-installed' ? (
                        <div className="flex items-center justify-center gap-2">
                          <ExternalLink size={20} />
                          Install {wallet.name}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Wallet size={20} />
                          Connect {wallet.name}
                        </div>
                      )}
                    </button>
                    
                    {wallet.status === 'not-installed' && (
                      <div className="mt-3 text-center">
                        <a
                          href={`https://${wallet.id}.io/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors text-sm"
                        >
                          Download {wallet.name} →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Advanced Options */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Target size={16} />
            <span className="text-sm">Advanced Options</span>
            <ChevronRight size={16} className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
          </button>
          
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="auto-connect" className="rounded border-gray-600" />
                  <label htmlFor="auto-connect" className="text-sm text-gray-300">
                    Auto-connect on page load
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="remember-choice" className="rounded border-gray-600" />
                  <label htmlFor="remember-choice" className="text-sm text-gray-300">
                    Remember my wallet choice
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="cross-chain" className="rounded border-gray-600" />
                  <label htmlFor="cross-chain" className="text-sm text-gray-300">
                    Enable cross-chain wallet linking
                  </label>
                </div>
                <div className="pt-3 border-t border-gray-600">
                  <button
                    onClick={() => {
                      enableDemoMode();
                      onClose();
                      navigate('/app');
                    }}
                    className="w-full px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-colors text-sm font-medium"
                  >
                    🚀 Hackathon Demo - Enter Without Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <X size={16} className="text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-red-400">Connection Failed</h4>
                <p className="text-red-300 text-sm">{connectionError}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">
              By connecting, you agree to our terms of service and privacy policy
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <span>🔒 Secure Connection</span>
              <span>🌐 Multi-Chain Support</span>
              <span>🤖 AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;