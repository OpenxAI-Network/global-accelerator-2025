import React, { useState } from 'react';
import ChainSelector from './ui/ChainSelector';
import MultiChainPortfolio from './MultiChainPortfolio';
import CrossChainTxTracker from './CrossChainTxTracker';
import { useWallet } from '../contexts/WalletContext';
import { getActiveBlockchains, getMainnetBlockchains, getTestnetBlockchains } from '../config/blockchains';

interface MultiChainDashboardProps {
  className?: string;
}

const MultiChainDashboard: React.FC<MultiChainDashboardProps> = ({ className = '' }) => {
  const { isConnected, currentBlockchain } = useWallet();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'transactions' | 'overview'>('overview');
  const [showTestnets, setShowTestnets] = useState(false);

  const activeChains = getActiveBlockchains().filter(chain => 
    showTestnets ? true : !chain.isTestnet
  );
  const mainnetChains = getMainnetBlockchains();
  const testnetChains = getTestnetBlockchains();

  const renderOverview = () => (
    <div className="overview-section space-y-6">
      {/* Chain Status Overview */}
      <div className="chain-status-overview">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeChains.map(chain => (
            <div key={chain.id} className="chain-status-card p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{chain.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{chain.name}</h4>
                    <p className="text-sm text-gray-600">Chain ID: {chain.chainId}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  chain.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Native Token:</span>
                  <span className="font-medium">{chain.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Token:</span>
                  <span className="font-medium">{chain.gasToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{chain.isTestnet ? 'Testnet' : 'Mainnet'}</span>
                </div>
              </div>

              {chain.isActive && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Estimated Gas Costs</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Deposit: {chain.estimatedGas.deposit} {chain.gasToken}</div>
                    <div>Borrow: {chain.estimatedGas.borrow} {chain.gasToken}</div>
                    <div>Repay: {chain.estimatedGas.repay} {chain.gasToken}</div>
                    <div>Liquidate: {chain.estimatedGas.liquidation} {chain.gasToken}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="quick-action-btn p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left">
            <div className="text-2xl mb-2">💱</div>
            <h4 className="font-medium text-blue-900">Cross-Chain Swap</h4>
            <p className="text-sm text-blue-700">Swap assets between different blockchains</p>
          </button>
          
          <button className="quick-action-btn p-4 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-left">
            <div className="text-2xl mb-2">🏦</div>
            <h4 className="font-medium text-green-900">Multi-Chain Lending</h4>
            <p className="text-sm text-green-700">Borrow against collateral on any chain</p>
          </button>
          
          <button className="quick-action-btn p-4 border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-left">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-medium text-purple-900">Security Settings</h4>
            <p className="text-sm text-purple-700">Configure cross-chain security policies</p>
          </button>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="network-statistics">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{mainnetChains.length}</div>
            <div className="text-sm text-blue-700">Mainnet Chains</div>
          </div>
          
          <div className="stat-card p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{testnetChains.length}</div>
            <div className="text-sm text-green-700">Testnet Chains</div>
          </div>
          
          <div className="stat-card p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{activeChains.length}</div>
            <div className="text-sm text-purple-700">Active Chains</div>
          </div>
          
          <div className="stat-card p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">24/7</div>
            <div className="text-sm text-orange-700">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="dashboard-tabs mb-6">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'portfolio', label: 'Portfolio', icon: '💼' },
          { key: 'transactions', label: 'Transactions', icon: '📋' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  );

  if (!isConnected) {
    return (
      <div className={`multi-chain-dashboard ${className}`}>
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Multi-Chain Dashboard</h2>
          <p className="text-lg text-gray-600 mb-8">
            Connect your wallet to access the full multi-chain experience
          </p>
          <div className="max-w-md mx-auto">
            <ChainSelector className="mb-4" />
            <p className="text-sm text-gray-500">
              Support for Ethereum, ZetaChain, Solana, Bitcoin, and more
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`multi-chain-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Chain Dashboard</h1>
            <p className="text-gray-600">
              Currently connected to <span className="font-medium">{currentBlockchain.name}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showTestnets}
                onChange={(e) => setShowTestnets(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Testnets
            </label>
          </div>
        </div>

        {/* Chain Selector */}
        <ChainSelector className="mb-6" showTestnets={showTestnets} />
      </div>

      {/* Tabs */}
      {renderTabs()}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'portfolio' && <MultiChainPortfolio showTestnets={showTestnets} />}
        {activeTab === 'transactions' && <CrossChainTxTracker />}
      </div>

      {/* Footer */}
      <div className="dashboard-footer mt-12 pt-8 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>Powered by AEGIS AI • Multi-Chain Security & Asset Management</p>
          <p className="mt-1">
            Supporting {activeChains.length} blockchain{activeChains.length !== 1 ? 's' : ''} • 
            Real-time monitoring • AI-powered risk assessment
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiChainDashboard;
