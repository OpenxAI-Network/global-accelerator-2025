import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getBlockchainById, getActiveBlockchains } from '../config/blockchains';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  chainId: string;
  chainName: string;
  icon?: string;
  change24h?: number;
  apy?: number;
}

interface MultiChainPortfolioProps {
  className?: string;
  showTestnets?: boolean;
}

const MultiChainPortfolio: React.FC<MultiChainPortfolioProps> = ({ 
  className = '', 
  showTestnets = false 
}) => {
  const { currentBlockchain, isConnected } = useWallet();
  const [portfolioByChain, setPortfolioByChain] = useState<Record<string, Asset[]>>({});
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (!isConnected) {
      setPortfolioByChain({});
      setTotalPortfolioValue(0);
      setIsLoading(false);
      return;
    }

    // Simulate loading
    setIsLoading(true);
    
    // Mock portfolio data - replace with actual data fetching
    const mockPortfolio: Record<string, Asset[]> = {
      'zetachain': [
        {
          id: '1',
          symbol: 'ZETA',
          name: 'Zeta',
          amount: 1250.5,
          usdValue: 1875.75,
          chainId: 'zetachain',
          chainName: 'ZetaChain',
          icon: '🟣',
          change24h: 2.5,
          apy: 8.5
        },
        {
          id: '2',
          symbol: 'USDC',
          name: 'USD Coin',
          amount: 5000,
          usdValue: 5000,
          chainId: 'zetachain',
          chainName: 'ZetaChain',
          icon: '💵',
          change24h: 0,
          apy: 4.2
        }
      ],
      'ethereum': [
        {
          id: '3',
          symbol: 'ETH',
          name: 'Ethereum',
          amount: 2.5,
          usdValue: 6250,
          chainId: 'ethereum',
          chainName: 'Ethereum',
          icon: '🔷',
          change24h: -1.2,
          apy: 3.8
        }
      ],
      'solana': [
        {
          id: '4',
          symbol: 'SOL',
          name: 'Solana',
          amount: 45.8,
          usdValue: 4580,
          chainId: 'solana',
          chainName: 'Solana',
          icon: '🟢',
          change24h: 5.8,
          apy: 6.2
        }
      ]
    };

    setPortfolioByChain(mockPortfolio);
    
    // Calculate total portfolio value
    const total = Object.values(mockPortfolio).flat().reduce((sum, asset) => sum + asset.usdValue, 0);
    setTotalPortfolioValue(total);
    
    setIsLoading(false);
  }, [isConnected]);

  const renderChainAssets = (chainId: string, assets: Asset[]) => {
    const blockchain = getBlockchainById(chainId);
    if (!blockchain) return null;

    const chainTotal = assets.reduce((sum, asset) => sum + asset.usdValue, 0);
    const isSelected = selectedChain === null || selectedChain === chainId;

    return (
      <div 
        key={chainId} 
        className={`chain-assets mb-6 ${isSelected ? 'block' : 'hidden'}`}
      >
        <div className="chain-header flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{blockchain.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{blockchain.name}</h3>
              <p className="text-sm text-gray-600">
                {assets.length} asset{assets.length !== 1 ? 's' : ''} • 
                <span className="font-medium text-green-600 ml-1">${chainTotal.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Chain ID</div>
            <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {blockchain.chainId}
            </div>
          </div>
        </div>

        <div className="assets-grid">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Asset</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">USD Value</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">24h Change</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">APY</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{asset.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{asset.name}</div>
                        <div className="text-sm text-gray-500">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-medium text-gray-900">
                      {asset.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-semibold text-gray-900">
                      ${asset.usdValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-medium ${
                      (asset.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(asset.change24h || 0) >= 0 ? '+' : ''}{asset.change24h?.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-blue-600 font-medium">
                      {asset.apy?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderChainTabs = () => {
    const chains = Object.keys(portfolioByChain);
    if (chains.length <= 1) return null;

    return (
      <div className="chain-tabs mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setSelectedChain(null)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedChain === null
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Chains
          </button>
          {chains.map(chainId => {
            const blockchain = getBlockchainById(chainId);
            if (!blockchain) return null;
            
            return (
              <button
                key={chainId}
                onClick={() => setSelectedChain(chainId)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedChain === chainId
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {blockchain.icon} {blockchain.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className={`multi-chain-portfolio ${className}`}>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Connect your wallet to view your multi-chain portfolio</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`multi-chain-portfolio ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`multi-chain-portfolio ${className}`}>
      {/* Portfolio Summary */}
      <div className="portfolio-summary mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Multi-Chain Portfolio</h2>
            <p className="text-gray-600">Your assets across all connected blockchains</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-3xl font-bold text-blue-600">
              ${totalPortfolioValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Chain Tabs */}
      {renderChainTabs()}

      {/* Chain Assets */}
      {Object.entries(portfolioByChain).map(([chainId, assets]) => 
        renderChainAssets(chainId, assets)
      )}

      {Object.keys(portfolioByChain).length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
          <p className="text-gray-600">Start by depositing assets on any supported blockchain</p>
        </div>
      )}
    </div>
  );
};

export default MultiChainPortfolio;
