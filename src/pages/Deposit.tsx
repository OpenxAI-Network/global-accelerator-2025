import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Globe, 
  DollarSign, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Shield,
  TrendingUp,
  Clock,
  X,
  Copy,
  Image,
  Zap,
  Activity,
  Brain
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface Asset {
  symbol: string;
  name: string;
  type: 'crypto' | 'nft';
  icon: any;
  color: string;
  decimals: number;
  price: number;
  change24h: number;
  balance: number;
  apy?: number;
  ltv?: number; // Loan-to-Value ratio
}

interface NFTAsset extends Asset {
  type: 'nft';
  collectionName: string;
  floorPrice: number;
  tokenId?: string;
  imageUrl?: string;
}

interface Chain {
  id: string;
  name: string;
  icon: string; // Changed from 'any' to 'string' for emoji icons
  color: string;
  status: 'healthy' | 'warning' | 'critical';
  gasPrice: string;
  confirmationTime: string;
  bridgeFee: number;
  isNative: boolean;
}

interface DepositTransaction {
  id: string;
  asset: string;
  amount: number;
  chain: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
  usdValue: number;
  estimatedRewards?: number;
}

interface OraclePrice {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
  source: string;
}

const Deposit = () => {
  const { address, isConnected } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [amount, setAmount] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [depositHistory, setDepositHistory] = useState<DepositTransaction[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNFTs, setShowNFTs] = useState(false);
  const [oraclePrices, setOraclePrices] = useState<Record<string, OraclePrice>>({});
  const [validationError, setValidationError] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<DepositTransaction | null>(null);

  // Enhanced asset data with real-time oracle prices
  const cryptoAssets: Asset[] = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      type: 'crypto',
      icon: DollarSign, 
      color: '#f7931a', 
      decimals: 8, 
      price: 52400, 
      change24h: 2.4, 
      balance: 0.5,
      apy: 4.2,
      ltv: 75
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      type: 'crypto',
      icon: DollarSign, 
      color: '#627eea', 
      decimals: 18, 
      price: 2500, 
      change24h: -1.2, 
      balance: 2.3,
      apy: 5.8,
      ltv: 80
    },
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      type: 'crypto',
      icon: DollarSign, 
      color: '#9945ff', 
      decimals: 9, 
      price: 93, 
      change24h: 5.8, 
      balance: 150,
      apy: 7.2,
      ltv: 65
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      type: 'crypto',
      icon: DollarSign, 
      color: '#4cc9f0', 
      decimals: 6, 
      price: 1, 
      change24h: 0.1, 
      balance: 1000,
      apy: 8.5,
      ltv: 90
    },
    { 
      symbol: 'MATIC', 
      name: 'Polygon', 
      type: 'crypto',
      icon: DollarSign, 
      color: '#8247e5', 
      decimals: 18, 
      price: 0.75, 
      change24h: 3.2, 
      balance: 500,
      apy: 6.1,
      ltv: 70
    },
    { 
      symbol: 'AVAX', 
      name: 'Avalanche', 
      type: 'crypto',
      icon: DollarSign, 
      color: '#e84142', 
      decimals: 18, 
      price: 18.50, 
      change24h: -0.8, 
      balance: 25,
      apy: 5.9,
      ltv: 72
    },
    { 
      symbol: 'ZETA', 
      name: 'ZetaChain', 
      type: 'crypto',
      icon: DollarSign, 
      color: '#00d4aa', 
      decimals: 18, 
      price: 2.45, 
      change24h: 5.2, 
      balance: 1000,
      apy: 12.5,
      ltv: 85
    }
  ];

  const nftAssets: NFTAsset[] = [
    {
      symbol: 'BAYC',
      name: 'Bored Ape Yacht Club',
      type: 'nft',
      collectionName: 'Bored Ape Yacht Club',
      icon: Image,
      color: '#ff6b35',
      decimals: 0,
      price: 45000,
      change24h: -2.1,
      balance: 1,
      floorPrice: 45000,
      ltv: 50,
      tokenId: '#1234'
    },
    {
      symbol: 'AZUKI',
      name: 'Azuki',
      type: 'nft',
      collectionName: 'Azuki',
      icon: Image,
      color: '#ff4757',
      decimals: 0,
      price: 8500,
      change24h: 1.8,
      balance: 2,
      floorPrice: 8500,
      ltv: 40,
      tokenId: '#567'
    },
    {
      symbol: 'PUNKS',
      name: 'CryptoPunks',
      type: 'nft',
      collectionName: 'CryptoPunks',
      icon: Image,
      color: '#5f27cd',
      decimals: 0,
      price: 65000,
      change24h: 0.5,
      balance: 1,
      floorPrice: 65000,
      ltv: 60,
      tokenId: '#890'
    }
  ];

  const chains: Chain[] = [
    { 
      id: 'bitcoin', 
      name: 'Bitcoin', 
      icon: '₿', 
      color: '#f7931a', 
      status: 'healthy', 
      gasPrice: '1-5 sat/vB', 
      confirmationTime: '~10 min',
      bridgeFee: 0.0001,
      isNative: true
    },
    { 
      id: 'ethereum', 
      name: 'Ethereum', 
      icon: '🔷', 
      color: '#627eea', 
      status: 'healthy', 
      gasPrice: '15-25 gwei', 
      confirmationTime: '~12 sec',
      bridgeFee: 0.001,
      isNative: true
    },
    { 
      id: 'solana', 
      name: 'Solana', 
      icon: '☀️', 
      color: '#9945ff', 
      status: 'healthy', 
      gasPrice: '0.000005 SOL', 
      confirmationTime: '~400ms',
      bridgeFee: 0.001,
      isNative: true
    },
    { 
      id: 'polygon', 
      name: 'Polygon', 
      icon: '🔺', 
      color: '#8247e5', 
      status: 'warning', 
      gasPrice: '30-50 gwei', 
      confirmationTime: '~2 sec',
      bridgeFee: 0.1,
      isNative: false
    },
    { 
      id: 'avalanche', 
      name: 'Avalanche', 
      icon: '❄️', 
      color: '#e84142', 
      status: 'healthy', 
      gasPrice: '25-35 gwei', 
      confirmationTime: '~3 sec',
      bridgeFee: 0.01,
      isNative: false
    },
    { 
      id: 'arbitrum', 
      name: 'Arbitrum', 
      icon: '🔵', 
      color: '#28a0f0', 
      status: 'healthy', 
      gasPrice: '0.1-0.3 gwei', 
      confirmationTime: '~1 sec',
      bridgeFee: 0.001,
      isNative: false
    },
    { 
      id: 'zetachain', 
      name: 'ZetaChain', 
      icon: '⚡', 
      color: '#00d4aa', 
      status: 'healthy', 
      gasPrice: '0.001 gaZETA', 
      confirmationTime: '~2 sec',
      bridgeFee: 0,
      isNative: true
    }
  ];

  // Real-time oracle price updates
  useEffect(() => {
    const updateOraclePrices = () => {
      const updatedPrices: Record<string, OraclePrice> = {};
      [...cryptoAssets, ...nftAssets].forEach(asset => {
        updatedPrices[asset.symbol] = {
          symbol: asset.symbol,
          price: asset.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% fluctuation
          change24h: asset.change24h + (Math.random() - 0.5) * 0.5,
          lastUpdated: new Date(),
          source: 'Aegis Oracle'
        };
      });
      setOraclePrices(updatedPrices);
    };

    updateOraclePrices();
    const interval = setInterval(updateOraclePrices, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate estimated value
  useEffect(() => {
    if (selectedAsset && amount) {
      const numAmount = parseFloat(amount) || 0;
      const currentPrice = oraclePrices[selectedAsset.symbol]?.price || selectedAsset.price;
      setEstimatedValue(numAmount * currentPrice);
    } else {
      setEstimatedValue(0);
    }
  }, [selectedAsset, amount, oraclePrices]);

  // Validate amount
  useEffect(() => {
    if (selectedAsset && amount) {
      const numAmount = parseFloat(amount) || 0;
      if (numAmount <= 0) {
        setValidationError('Enter a valid amount');
      } else if (numAmount > selectedAsset.balance) {
        setValidationError('Insufficient balance');
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  }, [selectedAsset, amount]);

  const loadDepositHistory = async () => {
    // Mock data - in production this would fetch from API
    setDepositHistory([
      {
        id: '1',
        asset: 'BTC',
        amount: 0.5,
        chain: 'Bitcoin',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        txHash: '0x1234567890abcdef',
        usdValue: 26200,
        estimatedRewards: 1100
      },
      {
        id: '2',
        asset: 'ETH',
        amount: 10,
        chain: 'Ethereum',
        status: 'pending',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        txHash: '0x8765432109fedcba',
        usdValue: 25000,
        estimatedRewards: 1450
      }
    ]);
  };

  useEffect(() => {
    if (isConnected) {
      loadDepositHistory();
    }
  }, [isConnected]);

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    // Auto-select compatible chain
    if (asset.symbol === 'BTC') {
      setSelectedChain(chains.find(c => c.id === 'bitcoin') || null);
    } else if (asset.symbol === 'SOL') {
      setSelectedChain(chains.find(c => c.id === 'solana') || null);
    } else {
      setSelectedChain(chains.find(c => c.id === 'ethereum') || null);
    }
  };

  const handleDeposit = async () => {
    if (!selectedAsset || !selectedChain || !amount || validationError) {
      return;
    }

    setIsLoading(true);
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const newTransaction: DepositTransaction = {
      id: txId,
      asset: selectedAsset.symbol,
      amount: parseFloat(amount),
      chain: selectedChain.name,
      status: 'pending',
      timestamp: new Date(),
      txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
      usdValue: estimatedValue,
      estimatedRewards: estimatedValue * (selectedAsset.apy || 0) / 100
    };

    setCurrentTransaction(newTransaction);
    setShowTransactionModal(true);
    setDepositHistory(prev => [newTransaction, ...prev]);

    try {
      // Simulate ZetaChain cross-chain deposit
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update transaction status
      setDepositHistory(prev => 
        prev.map(tx => 
          tx.id === txId ? { ...tx, status: 'confirmed' } : tx
        )
      );
      
      if (currentTransaction?.id === txId) {
        setCurrentTransaction(prev => prev ? { ...prev, status: 'confirmed' } : null);
      }
      
      // Reset form
      setSelectedAsset(null);
      setSelectedChain(null);
      setAmount('');
      
    } catch (error) {
      console.error('Deposit failed:', error);
      setDepositHistory(prev => 
        prev.map(tx => 
          tx.id === txId ? { ...tx, status: 'failed' } : tx
        )
      );
      
      if (currentTransaction?.id === txId) {
        setCurrentTransaction(prev => prev ? { ...prev, status: 'failed' } : null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-green-400" />;
      case 'pending': return <Clock size={16} className="text-yellow-400" />;
      case 'failed': return <X size={16} className="text-red-400" />;
      default: return <Activity size={16} className="text-gray-400" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <Wallet size={64} className="mx-auto mb-6 text-gray-400" />
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to deposit collateral</p>
      </div>
    );
  }

  const currentAssets = showNFTs ? nftAssets : cryptoAssets;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deposit Collateral</h1>
          <p className="text-gray-400">Lock assets on any chain to borrow across the entire ecosystem. Powered by ZetaChain's omnichain infrastructure.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-white/10 rounded-lg">
            <button
              onClick={() => setShowNFTs(false)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                !showNFTs ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Crypto
            </button>
            <button
              onClick={() => setShowNFTs(true)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showNFTs ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              NFTs
            </button>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Asset Selection */}
        <div className="xl:col-span-2 space-y-6">
          {/* Oracle Price Display */}
          {Object.keys(oraclePrices).length > 0 && (
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Live Oracle Prices</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Updated {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.values(oraclePrices).slice(0, 6).map((price) => (
                  <div key={price.symbol} className="text-center">
                    <div className="text-xs text-gray-400">{price.symbol}</div>
                    <div className="text-sm font-medium">${price.price.toLocaleString()}</div>
                    <div className={`text-xs ${price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intent-Based Lending & Cross-Chain Selection */}
          <div className="glass-effect border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Intent-Based Lending
              <Zap className="w-5 h-5 text-yellow-400" />
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Describe your lending goal in natural language. AI will convert it to cross-chain transactions.
            </p>
            
            {/* Intent Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What do you want to do?
              </label>
              <textarea
                placeholder="e.g., 'Borrow ETH against my idle BTC at 70% LTV' or 'Deposit SOL to unlock borrowing power across all chains'"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                rows={3}
              />
              <div className="mt-2 flex items-center space-x-2">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                  <Brain className="w-4 h-4 inline mr-2" />
                  AI Analyze Intent
                </button>
                <span className="text-xs text-gray-400">Powered by Gemini 2.5</span>
              </div>
            </div>

            <h4 className="text-md font-semibold mb-3 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Select Target Chain</span>
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Choose which blockchain to deposit your collateral on. You can borrow assets on any chain regardless of where you deposit.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedChain(chain)}
                  className={`p-3 rounded-lg border transition-all text-center ${
                    selectedChain?.id === chain.id
                      ? 'border-primary bg-primary/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-2">{chain.icon}</div>
                  <div className="text-sm font-medium">{chain.name}</div>
                  <div className="text-xs text-gray-400">{chain.id === 'bitcoin' ? 'BTC' : chain.id === 'ethereum' ? 'ETH' : chain.id === 'solana' ? 'SOL' : chain.id === 'polygon' ? 'MATIC' : chain.id === 'avalanche' ? 'AVAX' : chain.id === 'arbitrum' ? 'ARB' : 'ZETA'}</div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                    chain.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                    chain.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {chain.status}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Asset Selection */}
          <div className="glass-effect border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Select {showNFTs ? 'NFT Collection' : 'Asset'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleAssetSelect(asset)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedAsset?.symbol === asset.symbol
                      ? 'border-primary bg-primary/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                    >
                      <asset.icon size={24} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-gray-400">{asset.name}</div>
                    </div>
                    {asset.type === 'nft' && (asset as NFTAsset).tokenId && (
                      <div className="text-xs text-gray-400">{(asset as NFTAsset).tokenId}</div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400">Price</div>
                      <div className="font-medium">${asset.price.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Balance</div>
                      <div className="font-medium">{asset.balance}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">24h Change</div>
                      <div className={`font-medium ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">{asset.type === 'nft' ? 'LTV' : 'APY'}</div>
                      <div className="font-medium text-blue-400">
                        {asset.type === 'nft' ? `${asset.ltv}%` : `${asset.apy}%`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chain Selection */}
          {selectedAsset && (
            <div className="glass-effect border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Select Target Chain</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedChain?.id === chain.id
                        ? 'border-primary bg-primary/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${chain.color}20`, color: chain.color }}
                      >
                        {chain.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">{chain.name}</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            chain.status === 'healthy' ? 'bg-green-400' :
                            chain.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-xs text-gray-400 capitalize">{chain.status}</span>
                          {chain.isNative && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1 rounded">Native</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>Gas: {chain.gasPrice}</div>
                      <div>Time: {chain.confirmationTime}</div>
                      <div>Bridge Fee: {chain.bridgeFee > 0 ? `${chain.bridgeFee}%` : 'Free'}</div>
                      <div className="text-green-400">Available</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount Input */}
          {selectedAsset && selectedChain && (
            <div className="glass-effect border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Deposit Amount</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      max={selectedAsset.balance}
                      step={selectedAsset.type === 'nft' ? '1' : 'any'}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${
                        validationError ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={() => setAmount(selectedAsset.balance.toString())}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        MAX
                      </button>
                      <div className="text-gray-400">{selectedAsset.symbol}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">
                      Balance: {selectedAsset.balance} {selectedAsset.symbol}
                    </span>
                    {validationError && (
                      <span className="text-red-400">{validationError}</span>
                    )}
                  </div>
                </div>

                {estimatedValue > 0 && (
                  <div className="p-4 bg-white/5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Estimated Value:</span>
                      <span className="text-white font-medium">
                        ${estimatedValue.toLocaleString()}
                      </span>
                    </div>
                    {selectedAsset.apy && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Est. Annual Rewards:</span>
                        <span className="text-green-400 font-medium">
                          ${(estimatedValue * selectedAsset.apy / 100).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedChain.bridgeFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Bridge Fee:</span>
                        <span className="text-yellow-400 font-medium">
                          ${(estimatedValue * selectedChain.bridgeFee / 100).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleDeposit}
                  disabled={!selectedAsset || !selectedChain || !amount || !!validationError || isLoading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Processing Deposit...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Deposit via ZetaChain
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Info & History */}
        <div className="space-y-6">
          {/* Deposit Benefits */}
          <div className="glass-effect border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Why Deposit with Aegis?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-0.5">
                  <Shield size={16} className="text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">AI-Shielded Security</div>
                  <div className="text-xs text-gray-400 mt-1">Real-time threat detection and protection</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-0.5">
                  <TrendingUp size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Competitive Yields</div>
                  <div className="text-xs text-gray-400 mt-1">Up to 8.5% APY on stablecoin deposits</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-0.5">
                  <Zap size={16} className="text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Cross-Chain Native</div>
                  <div className="text-xs text-gray-400 mt-1">Deposit anywhere, borrow anywhere</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mt-0.5">
                  <Activity size={16} className="text-yellow-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Dynamic LTV</div>
                  <div className="text-xs text-gray-400 mt-1">AI-optimized loan-to-value ratios</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Deposits */}
          <div className="glass-effect border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Deposits</h3>
              <button className="text-xs text-primary hover:text-primary/80">View All</button>
            </div>
            {depositHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No deposits yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {depositHistory.slice(0, 5).map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        {getStatusIcon(deposit.status)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {deposit.amount} {deposit.asset}
                        </div>
                        <div className="text-xs text-gray-400">{deposit.chain}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${deposit.usdValue.toLocaleString()}
                      </div>
                      <div className={`text-xs ${getStatusColor(deposit.status)}`}>
                        {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="glass-effect border border-green-500/30 rounded-xl p-6 bg-green-500/5">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-400 mb-2">Secured by ZetaChain</h4>
                <p className="text-sm text-green-300/80 mb-3">
                  Your deposits are protected by ZetaChain's universal contracts with enterprise-grade security and real-time monitoring.
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>Multi-sig</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>Audited</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span>Insured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && currentTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Transaction Status</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  {getStatusIcon(currentTransaction.status)}
                </div>
                <div className="text-lg font-medium mb-2">
                  {currentTransaction.status === 'pending' && 'Processing Deposit...'}
                  {currentTransaction.status === 'confirmed' && 'Deposit Confirmed!'}
                  {currentTransaction.status === 'failed' && 'Deposit Failed'}
                </div>
                <div className="text-gray-400">
                  {currentTransaction.amount} {currentTransaction.asset} on {currentTransaction.chain}
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span>{currentTransaction.amount} {currentTransaction.asset}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Value:</span>
                  <span>${currentTransaction.usdValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Chain:</span>
                  <span>{currentTransaction.chain}</span>
                </div>
                {currentTransaction.txHash && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tx Hash:</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://explorer.zetachain.com/cc/tx/${currentTransaction.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-400 hover:text-blue-300 transition-colors"
                        title="View on ZetaScan"
                      >
                        {currentTransaction.txHash.substring(0, 8)}...
                      </a>
                      <button
                        onClick={() => copyToClipboard(currentTransaction.txHash!)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Copy Transaction Hash"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {currentTransaction.status === 'confirmed' && (
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;
