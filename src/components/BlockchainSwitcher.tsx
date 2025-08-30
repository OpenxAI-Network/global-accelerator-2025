import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, AlertTriangle, Network, Globe } from 'lucide-react';
import { 
  BlockchainConfig, 
  SUPPORTED_BLOCKCHAINS, 
  getActiveBlockchains, 
  getMainnetBlockchains, 
  getTestnetBlockchains,
  switchToNetwork,
  addNetworkToMetaMask
} from '../config/blockchains';
import { useWallet } from '../contexts/WalletContext';

interface BlockchainSwitcherProps {
  currentBlockchain?: BlockchainConfig;
  onBlockchainChange?: (blockchain: BlockchainConfig) => void;
  showTestnets?: boolean;
  className?: string;
  variant?: 'sidebar' | 'modal' | 'dropdown';
}

const BlockchainSwitcher: React.FC<BlockchainSwitcherProps> = ({
  currentBlockchain,
  onBlockchainChange,
  showTestnets = true,
  className = '',
  variant = 'dropdown'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'mainnet' | 'testnet'>('mainnet');
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isConnected, chainId, switchNetwork } = useWallet();

  // Get available blockchains
  const mainnetBlockchains = getMainnetBlockchains();
  const testnetBlockchains = getTestnetBlockchains();
  const activeBlockchains = getActiveBlockchains();

  // Determine current blockchain if not provided
  const currentChain = currentBlockchain || 
    activeBlockchains.find(chain => chain.chainId === chainId) ||
    activeBlockchains[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle blockchain switching
  const handleBlockchainSwitch = async (blockchain: BlockchainConfig) => {
    if (!isConnected) {
      // If not connected, just update the selection
      onBlockchainChange?.(blockchain);
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setError(null);

    try {
      // For EVM chains, use MetaMask switching
      if (blockchain.id !== 'solana' && blockchain.id !== 'bitcoin') {
        await switchToNetwork(blockchain);
      } else {
        // For non-EVM chains, show instructions
        setError(`${blockchain.name} requires a different wallet connection method.`);
        return;
      }

      // Update the current blockchain
      onBlockchainChange?.(blockchain);
      setIsOpen(false);
      
      // Show success feedback
      console.log(`Successfully switched to ${blockchain.name}`);
      
    } catch (error: any) {
      console.error('Error switching blockchain:', error);
      setError(error.message || 'Failed to switch blockchain');
    } finally {
      setIsSwitching(false);
    }
  };

  // Add network to MetaMask
  const handleAddNetwork = async (blockchain: BlockchainConfig) => {
    if (blockchain.id === 'solana' || blockchain.id === 'bitcoin') {
      setError(`${blockchain.name} cannot be added to MetaMask. Use a compatible wallet.`);
      return;
    }

    setIsSwitching(true);
    setError(null);

    try {
      await addNetworkToMetaMask(blockchain);
      console.log(`Successfully added ${blockchain.name} to MetaMask`);
      
      // After adding, try to switch to it
      await handleBlockchainSwitch(blockchain);
      
    } catch (error: any) {
      console.error('Error adding network:', error);
      setError(error.message || 'Failed to add network');
    } finally {
      setIsSwitching(false);
    }
  };

  // Render blockchain item
  const renderBlockchainItem = (blockchain: BlockchainConfig, showAddButton = false) => {
    const isCurrentChain = currentChain?.id === blockchain.id;
    const isConnectedToChain = isConnected && chainId === blockchain.chainId;

    return (
      <div
        key={blockchain.id}
        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isCurrentChain 
            ? 'bg-primary/20 border border-primary/30' 
            : 'hover:bg-white/10'
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: `${blockchain.color}20`, color: blockchain.color }}
          >
            {blockchain.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white truncate">
                {blockchain.name}
              </span>
              {blockchain.isTestnet && (
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                  Testnet
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{blockchain.nativeCurrency.symbol}</span>
              <span>•</span>
              <span className="truncate">
                {blockchain.estimatedGas.deposit} {blockchain.gasToken} gas
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentChain && (
            <Check size={16} className="text-primary" />
          )}
          
          {isConnectedToChain && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          
          {showAddButton && !isCurrentChain && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddNetwork(blockchain);
              }}
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-blue-400 hover:text-blue-300"
              title={`Add ${blockchain.name} to MetaMask`}
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={`px-6 py-3 border-b border-white/10 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Network size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Current Network</span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: `${currentChain.color}20`, color: currentChain.color }}
            >
              {currentChain.icon}
            </div>
            <span className="text-sm font-medium text-white">
              {currentChain.name}
            </span>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="mt-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {mainnetBlockchains.map(blockchain => 
                renderBlockchainItem(blockchain, true)
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render modal variant
  if (variant === 'modal') {
    return (
      <div className={`bg-gray-800/50 p-4 rounded-lg border border-gray-700 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">Select Blockchain</span>
          <Network size={16} className="text-blue-400" />
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setSelectedTab('mainnet')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'mainnet'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mainnet
          </button>
          {showTestnets && (
            <button
              onClick={() => setSelectedTab('testnet')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'testnet'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Testnet
            </button>
          )}
        </div>

        {/* Blockchain List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {(selectedTab === 'mainnet' ? mainnetBlockchains : testnetBlockchains).map(blockchain => (
            <button
              key={blockchain.id}
              onClick={() => handleBlockchainSwitch(blockchain)}
              disabled={isSwitching}
              className="w-full text-left"
            >
              {renderBlockchainItem(blockchain, true)}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={14} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSwitching && (
          <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Switching network...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render dropdown variant (default)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
      >
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: `${currentChain.color}20`, color: currentChain.color }}
        >
          {currentChain.icon}
        </div>
        <span className="text-sm font-medium text-white">
          {currentChain.name}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-white">Switch Blockchain</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setSelectedTab('mainnet')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'mainnet'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mainnet
              </button>
              {showTestnets && (
                <button
                  onClick={() => setSelectedTab('testnet')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === 'testnet'
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Testnet
                </button>
              )}
            </div>

            {/* Blockchain List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(selectedTab === 'mainnet' ? mainnetBlockchains : testnetBlockchains).map(blockchain => (
                <button
                  key={blockchain.id}
                  onClick={() => handleBlockchainSwitch(blockchain)}
                  disabled={isSwitching}
                  className="w-full text-left"
                >
                  {renderBlockchainItem(blockchain, true)}
                </button>
              ))}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={14} />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isSwitching && (
              <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Switching network...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainSwitcher;
