import React, { useState } from 'react';
import { Wallet, Network, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { SUPPORTED_BLOCKCHAINS } from '../config/blockchains';

const SimpleWalletTest: React.FC = () => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    chainId, 
    network, 
    balance, 
    connectionError, 
    currentBlockchain,
    connect, 
    disconnect, 
    switchToBlockchain,
    clearError 
  } = useWallet();

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const testZetaChainConnection = async () => {
    if (!isConnected) {
      setSwitchError('Please connect wallet first');
      return;
    }

    setIsSwitching(true);
    setSwitchError(null);

    try {
      const zetaChain = SUPPORTED_BLOCKCHAINS.find(chain => chain.id === 'zetachain');
      if (zetaChain) {
        await switchToBlockchain(zetaChain);
        console.log('Successfully connected to ZetaChain');
      }
    } catch (error: any) {
      console.error('ZetaChain connection failed:', error);
      setSwitchError(error.message || 'Failed to connect to ZetaChain');
    } finally {
      setIsSwitching(false);
    }
  };

  const testNetworkSwitch = async (blockchain: any) => {
    if (!isConnected) {
      setSwitchError('Please connect wallet first');
      return;
    }

    setIsSwitching(true);
    setSwitchError(null);

    try {
      await switchToBlockchain(blockchain);
      console.log(`Successfully switched to ${blockchain.name}`);
    } catch (error: any) {
      console.error('Network switch failed:', error);
      setSwitchError(error.message || 'Failed to switch network');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Wallet Connection Test</h1>
      
      {/* Current Status */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Current Status
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isConnected ? '✅' : '❌'}
            </div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              {chainId ? `Chain ${chainId}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Chain ID</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              {network || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Network</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              {balance ? `${balance} ETH` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Balance</div>
          </div>
        </div>

        {address && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">Address:</div>
            <div className="font-mono text-sm bg-gray-100 p-2 rounded">
              {address}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Disconnect
          </button>
        )}

        <button
          onClick={testZetaChainConnection}
          disabled={!isConnected || isSwitching}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
        >
          <Network className="w-5 h-5" />
          Connect to ZetaChain
        </button>
      </div>

      {/* Network List */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network className="w-6 h-6" />
          Available Networks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORTED_BLOCKCHAINS.slice(0, 6).map((blockchain) => (
            <button
              key={blockchain.id}
              onClick={() => testNetworkSwitch(blockchain)}
              disabled={!isConnected || isSwitching}
              className={`p-4 rounded-lg border transition-colors text-left ${
                currentBlockchain?.id === blockchain.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{blockchain.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{blockchain.name}</div>
                  <div className="text-sm text-gray-600">
                    Chain ID: {blockchain.chainId} • {blockchain.nativeCurrency.symbol}
                  </div>
                </div>
                {currentBlockchain?.id === blockchain.id && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {(connectionError || switchError) && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">Errors:</h3>
          {connectionError && (
            <div className="text-red-700 mb-2">
              <strong>Connection Error:</strong> {connectionError}
            </div>
          )}
          {switchError && (
            <div className="text-red-700 mb-2">
              <strong>Switch Error:</strong> {switchError}
            </div>
          )}
          <button
            onClick={() => { clearError(); setSwitchError(null); }}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Clear Errors
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleWalletTest;
