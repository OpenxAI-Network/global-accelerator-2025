import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { getActiveBlockchains, BlockchainConfig } from '../../config/blockchains';

interface ChainSelectorProps {
  className?: string;
  showTestnets?: boolean;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ 
  className = '', 
  showTestnets = false 
}) => {
  const { currentBlockchain, switchToBlockchain, isConnected } = useWallet();
  
  const activeChains = getActiveBlockchains().filter(chain => 
    showTestnets ? true : !chain.isTestnet
  );

  const handleChainSwitch = async (blockchain: BlockchainConfig) => {
    if (!isConnected) return;
    
    try {
      await switchToBlockchain(blockchain);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  return (
    <div className={`chain-selector ${className}`}>
      <div className="flex flex-wrap gap-2">
        {activeChains.map(chain => (
          <button
            key={chain.id}
            onClick={() => handleChainSwitch(chain)}
            disabled={!isConnected}
            className={`
              chain-btn flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200
              ${currentBlockchain.id === chain.id 
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }
              ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
            `}
            title={`Switch to ${chain.name}`}
          >
            <span className="text-lg">{chain.icon}</span>
            <span className="font-medium">{chain.name}</span>
            {chain.isTestnet && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                TEST
              </span>
            )}
          </button>
        ))}
      </div>
      
      {!isConnected && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Connect your wallet to switch chains
        </p>
      )}
    </div>
  );
};

export default ChainSelector;
