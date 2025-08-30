import React, { useState } from 'react';
import { 
  Network, 
  Globe, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Zap,
  Coins,
  Wallet
} from 'lucide-react';
import BlockchainSwitcher from '../components/BlockchainSwitcher';
import { useWallet } from '../contexts/WalletContext';
import { 
  SUPPORTED_BLOCKCHAINS, 
  getActiveBlockchains, 
  getMainnetBlockchains, 
  getTestnetBlockchains 
} from '../config/blockchains';

const BlockchainDemo: React.FC = () => {
  const { currentBlockchain, isConnected, chainId, address } = useWallet();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'networks' | 'switching'>('overview');

  const activeBlockchains = getActiveBlockchains();
  const mainnetBlockchains = getMainnetBlockchains();
  const testnetBlockchains = getTestnetBlockchains();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'networks', name: 'Networks', icon: Network },
    { id: 'switching', name: 'Switching', icon: Globe },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-400" />
          Current Blockchain Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connected Blockchain:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                  style={{ backgroundColor: `${currentBlockchain.color}20`, color: currentBlockchain.color }}
                >
                  {currentBlockchain.icon}
                </div>
                <span className="font-medium">{currentBlockchain.name}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Chain ID:</span>
              <span className="font-mono text-sm">{currentBlockchain.chainId}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Native Token:</span>
              <span className="font-medium">{currentBlockchain.nativeCurrency.symbol}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Network Type:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentBlockchain.isTestnet 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {currentBlockchain.isTestnet ? 'Testnet' : 'Mainnet'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Wallet Status:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {isConnected && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Wallet Address:</span>
                  <span className="font-mono text-sm text-blue-400">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Chain ID:</span>
                  <span className="font-mono text-sm">{chainId || 'N/A'}</span>
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Supported Assets:</span>
              <span className="text-sm">{currentBlockchain.supportedAssets.length} assets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={20} className="text-blue-400" />
              <span className="font-medium">Switch Network</span>
            </div>
            <p className="text-sm text-gray-400">
              Change to a different blockchain using the switcher above
            </p>
          </button>
          
          <button className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Wallet size={20} className="text-green-400" />
              <span className="font-medium">Connect Wallet</span>
            </div>
            <p className="text-sm text-gray-400">
              Connect your wallet to interact with the selected blockchain
            </p>
          </button>
          
          <button className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Coins size={20} className="text-purple-400" />
              <span className="font-medium">View Assets</span>
            </div>
            <p className="text-sm text-gray-400">
              See available assets and liquidity on the current network
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderNetworks = () => (
    <div className="space-y-6">
      {/* Mainnet Networks */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-400" />
          Mainnet Networks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainnetBlockchains.map(blockchain => (
            <div 
              key={blockchain.id}
              className={`p-4 rounded-lg border transition-colors ${
                currentBlockchain.id === blockchain.id
                  ? 'bg-primary/20 border-primary/30'
                  : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${blockchain.color}20`, color: blockchain.color }}
                >
                  {blockchain.icon}
                </div>
                <div>
                  <h4 className="font-medium">{blockchain.name}</h4>
                  <p className="text-xs text-gray-400">Chain ID: {blockchain.chainId}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Native Token:</span>
                  <span>{blockchain.nativeCurrency.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Assets:</span>
                  <span>{blockchain.supportedAssets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gas Token:</span>
                  <span>{blockchain.gasToken}</span>
                </div>
              </div>
              
              {currentBlockchain.id === blockchain.id && (
                <div className="mt-3 p-2 bg-primary/20 rounded-lg border border-primary/30">
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <CheckCircle size={14} />
                    <span>Currently Selected</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Testnet Networks */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-400" />
          Testnet Networks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testnetBlockchains.map(blockchain => (
            <div 
              key={blockchain.id}
              className={`p-4 rounded-lg border transition-colors ${
                currentBlockchain.id === blockchain.id
                  ? 'bg-primary/20 border-primary/30'
                  : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${blockchain.color}20`, color: blockchain.color }}
                >
                  {blockchain.icon}
                </div>
                <div>
                  <h4 className="font-medium">{blockchain.name}</h4>
                  <p className="text-xs text-gray-400">Chain ID: {blockchain.chainId}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Native Token:</span>
                  <span>{blockchain.nativeCurrency.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Assets:</span>
                  <span>{blockchain.supportedAssets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Gas Token:</span>
                  <span>{blockchain.gasToken}</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2 text-orange-400 text-sm">
                  <AlertTriangle size={14} />
                  <span>Test Network</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSwitching = () => (
    <div className="space-y-6">
      {/* Blockchain Switcher Demo */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe size={20} className="text-blue-400" />
          Interactive Blockchain Switcher
        </h3>
        
        <p className="text-gray-400 mb-6">
          Use the blockchain switcher below to change between different networks. 
          The switcher will automatically handle MetaMask network switching for EVM chains.
        </p>
        
        <div className="flex justify-center">
          <BlockchainSwitcher 
            currentBlockchain={currentBlockchain}
            variant="dropdown"
            showTestnets={true}
          />
        </div>
      </div>

      {/* Switching Instructions */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info size={20} className="text-cyan-400" />
          How to Switch Blockchains
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
              1
            </div>
            <div>
              <h4 className="font-medium mb-1">Click the Blockchain Switcher</h4>
              <p className="text-gray-400 text-sm">
                Click on the current blockchain name in the switcher to open the dropdown menu.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
              2
            </div>
            <div>
              <h4 className="font-medium mb-1">Choose Your Network</h4>
              <p className="text-gray-400 text-sm">
                Select between Mainnet and Testnet tabs, then choose your desired blockchain.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
              3
            </div>
            <div>
              <h4 className="font-medium mb-1">Automatic Network Switching</h4>
              <p className="text-gray-400 text-sm">
                For EVM chains, the switcher will automatically add the network to MetaMask and switch to it.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
              4
            </div>
            <div>
              <h4 className="font-medium mb-1">Non-EVM Chains</h4>
              <p className="text-gray-400 text-sm">
                For Solana and Bitcoin, you'll need to use compatible wallets (Phantom, Solflare, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network size={20} className="text-green-400" />
          Current Network Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-gray-300">Selected Blockchain</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="font-medium">{currentBlockchain.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Chain ID:</span>
                <span className="font-mono text-sm">{currentBlockchain.chainId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentBlockchain.isTestnet 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {currentBlockchain.isTestnet ? 'Testnet' : 'Mainnet'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-gray-300">Wallet Connection</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Chain:</span>
                <span className="font-mono text-sm">{chainId || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Address:</span>
                <span className="font-mono text-sm text-blue-400">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${currentBlockchain.color}20`, color: currentBlockchain.color }}
          >
            {currentBlockchain.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Blockchain Switcher Demo</h1>
            <p className="text-gray-400">
              Explore and switch between different blockchains in the Aegis ecosystem
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Currently on:</span>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: `${currentBlockchain.color}20`, color: currentBlockchain.color }}
            >
              {currentBlockchain.icon}
            </div>
            <span className="font-medium text-white">{currentBlockchain.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              currentBlockchain.isTestnet 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {currentBlockchain.isTestnet ? 'Testnet' : 'Mainnet'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-primary text-white border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'networks' && renderNetworks()}
          {selectedTab === 'switching' && renderSwitching()}
        </div>
      </div>
    </div>
  );
};

export default BlockchainDemo;
