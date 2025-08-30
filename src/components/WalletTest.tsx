import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const WalletTest = () => {
  const { 
    connect, 
    disconnect, 
    isConnected, 
    address, 
    chainId, 
    network, 
    balance,
    isConnecting,
    connectionError,
    clearError,
    isMetaMaskInstalled,
    isPhantomInstalled,
    isKeplrInstalled,
    isCoinbaseWalletInstalled,
    isBraveWalletInstalled
  } = useWallet();

  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // Test wallet detection
    const results = {
      metamask: isMetaMaskInstalled(),
      phantom: isPhantomInstalled(),
      keplr: isKeplrInstalled(),
      coinbase: isCoinbaseWalletInstalled(),
      brave: isBraveWalletInstalled(),
      windowEthereum: typeof window !== 'undefined' && !!(window as any).ethereum,
      windowSolana: typeof window !== 'undefined' && !!(window as any).solana,
      windowKeplr: typeof window !== 'undefined' && !!(window as any).keplr,
    };
    setTestResults(results);
  }, [isMetaMaskInstalled, isPhantomInstalled, isKeplrInstalled, isCoinbaseWalletInstalled, isBraveWalletInstalled]);

  const handleConnect = async (walletType: string) => {
    try {
      clearError();
      console.log(`Attempting to connect ${walletType}...`);
      await connect(walletType);
      console.log(`${walletType} connected successfully!`);
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-6">Wallet Connection Test</h2>
      
      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Connected: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>{isConnected ? 'Yes' : 'No'}</span></div>
          <div>Connecting: <span className={isConnecting ? 'text-yellow-400' : 'text-gray-400'}>{isConnecting ? 'Yes' : 'No'}</span></div>
          <div>Address: <span className="font-mono">{address || 'None'}</span></div>
          <div>Chain ID: <span>{chainId || 'None'}</span></div>
          <div>Network: <span>{network || 'None'}</span></div>
          <div>Balance: <span>{balance || 'None'}</span></div>
        </div>
        {connectionError && (
          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400">
            Error: {connectionError}
          </div>
        )}
      </div>

      {/* Wallet Detection Test */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Wallet Detection Test</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>MetaMask: <span className={testResults.metamask ? 'text-green-400' : 'text-red-400'}>{testResults.metamask ? 'Detected' : 'Not Detected'}</span></div>
          <div>Phantom: <span className={testResults.phantom ? 'text-green-400' : 'text-red-400'}>{testResults.phantom ? 'Detected' : 'Not Detected'}</span></div>
          <div>Keplr: <span className={testResults.keplr ? 'text-green-400' : 'text-red-400'}>{testResults.keplr ? 'Detected' : 'Not Detected'}</span></div>
          <div>Coinbase: <span className={testResults.coinbase ? 'text-green-400' : 'text-red-400'}>{testResults.coinbase ? 'Detected' : 'Not Detected'}</span></div>
          <div>Brave: <span className={testResults.brave ? 'text-green-400' : 'text-red-400'}>{testResults.brave ? 'Detected' : 'Not Detected'}</span></div>
          <div>Window.ethereum: <span className={testResults.windowEthereum ? 'text-green-400' : 'text-red-400'}>{testResults.windowEthereum ? 'Available' : 'Not Available'}</span></div>
          <div>Window.solana: <span className={testResults.windowSolana ? 'text-green-400' : 'text-red-400'}>{testResults.windowSolana ? 'Available' : 'Not Available'}</span></div>
          <div>Window.keplr: <span className={testResults.windowKeplr ? 'text-green-400' : 'text-red-400'}>{testResults.windowKeplr ? 'Available' : 'Not Available'}</span></div>
        </div>
      </div>

      {/* Connection Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Connections</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            Connect MetaMask
          </button>
          <button
            onClick={() => handleConnect('phantom')}
            disabled={isConnecting}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            Connect Phantom
          </button>
          <button
            onClick={() => handleConnect('keplr')}
            disabled={isConnecting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            Connect Keplr
          </button>
          <button
            onClick={() => handleConnect('coinbase')}
            disabled={isConnecting}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            Connect Coinbase
          </button>
          <button
            onClick={() => handleConnect('brave')}
            disabled={isConnecting}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            Connect Brave
          </button>
        </div>
      </div>

      {/* Disconnect Button */}
      {isConnected && (
        <div className="mb-6">
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      )}

      {/* Debug Info */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
        <div className="text-xs font-mono bg-gray-900 p-2 rounded overflow-auto">
          <div>User Agent: {navigator.userAgent}</div>
          <div>Platform: {navigator.platform}</div>
          <div>Language: {navigator.language}</div>
          <div>Cookies Enabled: {navigator.cookieEnabled ? 'Yes' : 'No'}</div>
          <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};

export default WalletTest;
