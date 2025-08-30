import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Image, 
  Link, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  Unlock,
  DollarSign,
  TrendingUp,
  Globe,
  Zap,
  Shield,
  Gamepad2,
  ExternalLink,
  ArrowUpDown,
  History,
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface NFTCollateral {
  id: string;
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  lockedOnChain: string;
  targetChain: string;
  gameFiPlatform?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  floorPrice: number;
  collateralValue: number;
  loanToValue: number;
  maxBorrowable: number;
  isLocked: boolean;
  lockTimestamp?: string;
  unlockTimestamp?: string;
  history: {
    id: string;
    event: string;
    timestamp: string;
    txHash: string;
    chain: string;
    details?: string;
  }[];
  metadata: {
    attributes: { trait_type: string; value: string }[];
    external_url?: string;
    animation_url?: string;
  };
}

interface BorrowRequest {
  nftId: string;
  amount: number;
  targetChain: string;
  duration: number;
  collateralValue: number;
}

const NftCollateral = () => {
  const { address, isConnected } = useWallet();
  const [nfts, setNfts] = useState<NFTCollateral[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFTCollateral | null>(null);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [borrowDuration, setBorrowDuration] = useState(12);
  const [borrowStatus, setBorrowStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nfts' | 'borrowing' | 'history' | 'marketplace'>('nfts');
  const [filterChain, setFilterChain] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [selectedNFTForBridge, setSelectedNFTForBridge] = useState<NFTCollateral | null>(null);
  const [bridgeTargetChain, setBridgeTargetChain] = useState<string>('solana');
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'bridging' | 'success' | 'error'>('idle');
  const [bridgeProgress, setBridgeProgress] = useState(0);
  const [bridgeTransactionHash, setBridgeTransactionHash] = useState<string>('');

  // Mock NFT data - replace with real API calls
  useEffect(() => {
    const mockNFTs: NFTCollateral[] = [
      {
        id: 'nft-001',
        tokenId: '1234',
        contractAddress: '0x1234567890123456789012345678901234567890',
        name: 'Dragon Slayer Sword',
        description: 'Epic rare sword from Fantasy Game X with fire enchantment',
        imageUrl: 'https://raw.githubusercontent.com/lucylow/aegis-ai-liquid-vault/refs/heads/main/images/DragonSlayer_Sword_In_Use.webp',
        lockedOnChain: 'ethereum',
        targetChain: 'solana',
        gameFiPlatform: 'Fantasy Game X',
        rarity: 'epic',
        floorPrice: 2500,
        collateralValue: 3000,
        loanToValue: 70,
        maxBorrowable: 2100,
        isLocked: true,
        lockTimestamp: '2025-08-15T10:00:00Z',
        unlockTimestamp: '2025-11-15T10:00:00Z',
        history: [
          { 
            id: 'hist-001', 
            event: 'Locked as collateral', 
            timestamp: '2025-08-15T10:00:00Z',
            txHash: '0x123...abc',
            chain: 'ethereum',
            details: 'NFT locked on Ethereum for cross-chain borrowing'
          },
          { 
            id: 'hist-002', 
            event: 'Received loan in USDC', 
            timestamp: '2025-08-16T14:20:00Z',
            txHash: '0x456...def',
            chain: 'solana',
            details: 'Borrowed 1500 USDC on Solana using NFT collateral'
          },
        ],
        metadata: {
          attributes: [
            { trait_type: 'Attack', value: '85' },
            { trait_type: 'Defense', value: '45' },
            { trait_type: 'Rarity', value: 'Epic' },
            { trait_type: 'Element', value: 'Fire' }
          ],
          external_url: 'https://fantasygamex.com/nft/1234',
          animation_url: 'https://fantasygamex.com/animations/sword.mp4'
        }
      },
      {
        id: 'nft-002',
        tokenId: '5678',
        contractAddress: '0x2345678901234567890123456789012345678901',
        name: 'Crypto Racer Car',
        description: 'Limited edition NFT car in Racing Game Y with turbo boost',
        imageUrl: 'https://github.com/lucylow/aegis-ai-liquid-vault/blob/main/images/solana%20crypto%20racer%20car%20nft%20racing%20game%20turbo%20boost.jpg?raw=true',
        lockedOnChain: 'solana',
        targetChain: 'ethereum',
        gameFiPlatform: 'Racing Game Y',
        rarity: 'legendary',
        floorPrice: 5000,
        collateralValue: 6000,
        loanToValue: 65,
        maxBorrowable: 3900,
        isLocked: true,
        lockTimestamp: '2025-08-10T08:30:00Z',
        unlockTimestamp: '2025-10-10T08:30:00Z',
        history: [
          { 
            id: 'hist-003', 
            event: 'Locked as collateral', 
            timestamp: '2025-08-10T08:30:00Z',
            txHash: '0x789...ghi',
            chain: 'solana',
            details: 'NFT locked on Solana for cross-chain borrowing'
          }
        ],
        metadata: {
          attributes: [
            { trait_type: 'Speed', value: '95' },
            { trait_type: 'Handling', value: '88' },
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Boost', value: 'Turbo' }
          ],
          external_url: 'https://racinggamey.com/nft/5678'
        }
      },
      {
        id: 'nft-003',
        tokenId: '9012',
        contractAddress: '0x3456789012345678901234567890123456789012',
        name: 'Pixel Warrior',
        description: 'Rare pixel art warrior from Retro Game Z',
        imageUrl: 'https://github.com/lucylow/aegis-ai-liquid-vault/blob/main/images/polygon%20pixel%20warrior%20nft%20.png?raw=true',
        lockedOnChain: 'polygon',
        targetChain: 'avalanche',
        gameFiPlatform: 'Retro Game Z',
        rarity: 'rare',
        floorPrice: 800,
        collateralValue: 1000,
        loanToValue: 75,
        maxBorrowable: 750,
        isLocked: false,
        history: [],
        metadata: {
          attributes: [
            { trait_type: 'Strength', value: '72' },
            { trait_type: 'Agility', value: '68' },
            { trait_type: 'Rarity', value: 'Rare' },
            { trait_type: 'Style', value: 'Pixel' }
          ],
          external_url: 'https://retrogamez.com/nft/9012'
        }
      }
    ];
    setNfts(mockNFTs);
  }, []);

  const handleUseAsCollateral = async () => {
    if (!selectedNFT || !borrowAmount) {
      alert('Please select an NFT and enter borrow amount');
      return;
    }

    const amount = parseFloat(borrowAmount);
    if (amount > selectedNFT.maxBorrowable) {
      alert(`Maximum borrowable amount is ${selectedNFT.maxBorrowable} USDC`);
      return;
    }

    setIsLoading(true);
    setBorrowStatus('Processing cross-chain borrow request...');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update NFT status
      setNfts(prev => prev.map(nft => 
        nft.id === selectedNFT.id 
          ? { ...nft, isLocked: true, lockTimestamp: new Date().toISOString() }
          : nft
      ));

      // Add to history
      const newHistory = {
        id: `hist-${Date.now()}`,
        event: `Borrowed ${amount} USDC`,
        timestamp: new Date().toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        chain: selectedNFT.targetChain,
        details: `Cross-chain borrow using ${selectedNFT.name} as collateral`
      };

      setNfts(prev => prev.map(nft => 
        nft.id === selectedNFT.id 
          ? { ...nft, history: [newHistory, ...nft.history] }
          : nft
      ));

      setBorrowStatus(`Successfully borrowed ${amount} USDC using ${selectedNFT.name} as collateral!`);
      setBorrowAmount('');
      
      // Update selected NFT
      setSelectedNFT(prev => prev ? { ...prev, isLocked: true, lockTimestamp: new Date().toISOString() } : null);
      
    } catch (error) {
      setBorrowStatus('Failed to process borrow request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockNFT = async (nftId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNfts(prev => prev.map(nft => 
        nft.id === nftId 
          ? { ...nft, isLocked: false, unlockTimestamp: new Date().toISOString() }
          : nft
      ));

      if (selectedNFT?.id === nftId) {
        setSelectedNFT(prev => prev ? { ...prev, isLocked: false, unlockTimestamp: new Date().toISOString() } : null);
      }

      alert('NFT unlocked successfully!');
    } catch (error) {
      alert('Failed to unlock NFT. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-purple-600 bg-purple-100';
      case 'epic': return 'text-blue-600 bg-blue-100';
      case 'rare': return 'text-green-600 bg-green-100';
      case 'common': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChainIcon = (chain: string) => {
    const chainColors: { [key: string]: string } = {
      ethereum: 'text-blue-500',
      solana: 'text-green-500',
      polygon: 'text-purple-500',
      avalanche: 'text-red-500',
      bitcoin: 'text-orange-500'
    };
    return chainColors[chain.toLowerCase()] || 'text-gray-500';
  };

  const filteredNFTs = nfts.filter(nft => {
    if (filterChain !== 'all' && nft.lockedOnChain !== filterChain) return false;
    if (filterRarity !== 'all' && nft.rarity !== filterRarity) return false;
    return true;
  });

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view your NFT collateral</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">NFT & GameFi Collateral</h1>
          <p className="text-gray-300">Manage cross-chain NFT collateral and unlock instant borrowing across all chains</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('nfts')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'nfts' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Image className="w-4 h-4" />
              <span>NFT Collateral</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'borrowing' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Cross-Chain Borrowing</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'history' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <History className="w-4 h-4" />
              <span>Transaction History</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'marketplace' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Marketplace</span>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
          >
            <option value="all">All Chains</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="polygon">Polygon</option>
            <option value="avalanche">Avalanche</option>
            <option value="bitcoin">Bitcoin</option>
          </select>
          
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>

        {/* NFTs Tab */}
        {activeTab === 'nfts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                    selectedNFT?.id === nft.id 
                      ? 'border-blue-500 ring-2 ring-blue-500/50' 
                      : 'border-white/20'
                  }`}
                  onClick={() => setSelectedNFT(nft)}
                >
                  {/* NFT Image */}
                  <div className="relative">
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name} 
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="absolute top-2 left-2 flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(nft.rarity)}`}>
                        {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                      </span>
                      {nft.isLocked && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                          <Lock className="w-3 h-3 inline mr-1" />
                          Locked
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-white`}>
                        <Globe className={`w-3 h-3 inline mr-1 ${getChainIcon(nft.lockedOnChain)}`} />
                        {nft.lockedOnChain}
                      </span>
                    </div>
                  </div>

                  {/* NFT Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{nft.name}</h3>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{nft.description}</p>
                    
                    {nft.gameFiPlatform && (
                      <div className="flex items-center text-sm text-gray-400 mb-3">
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        {nft.gameFiPlatform}
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Floor Price:</span>
                        <span className="text-white">${nft.floorPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Collateral Value:</span>
                        <span className="text-green-400">${nft.collateralValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Borrowable:</span>
                        <span className="text-blue-400">${nft.maxBorrowable.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex space-x-2">
                      {nft.isLocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlockNFT(nft.id);
                          }}
                          disabled={isLoading}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-1" />
                              Unlock
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNFT(nft);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center"
                        >
                          <Lock className="w-4 h-4 mr-1" />
                          Use as Collateral
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(nft.metadata.external_url, '_blank');
                        }}
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected NFT Details */}
            {selectedNFT && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedNFT.name} - Details
                  </h3>
                  <button
                    onClick={() => setSelectedNFT(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <p className="text-white">{selectedNFT.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Locked Chain</label>
                        <p className="text-white">{selectedNFT.lockedOnChain}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Target Chain</label>
                        <p className="text-white">{selectedNFT.targetChain}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Floor Price</label>
                        <p className="text-white">${selectedNFT.floorPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Collateral Value</label>
                        <p className="text-green-400">${selectedNFT.collateralValue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">LTV Ratio</label>
                        <p className="text-white">{selectedNFT.loanToValue}%</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Max Borrowable</label>
                        <p className="text-blue-400">${selectedNFT.maxBorrowable.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Attributes & History */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">NFT Attributes</label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedNFT.metadata.attributes.map((attr, index) => (
                          <div key={index} className="bg-slate-800/50 rounded p-2">
                            <div className="text-xs text-gray-400">{attr.trait_type}</div>
                            <div className="text-white font-medium">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Recent History</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedNFT.history.slice(0, 3).map((item) => (
                          <div key={item.id} className="bg-slate-800/50 rounded p-2 text-sm">
                            <div className="text-white">{item.event}</div>
                            <div className="text-gray-400 text-xs">
                              {new Date(item.timestamp).toLocaleDateString()} on {item.chain}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Borrowing Tab */}
        {activeTab === 'borrowing' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Cross-Chain NFT Borrowing</h2>
            
            {!selectedNFT ? (
              <div className="text-center py-8">
                <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400">Select an NFT from the NFT Collateral tab to start borrowing</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Selected NFT: {selectedNFT.name}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <img 
                      src={selectedNFT.imageUrl} 
                      alt={selectedNFT.name} 
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="space-y-2">
                      <p className="text-gray-300">{selectedNFT.description}</p>
                      <p className="text-sm text-gray-400">Locked on: {selectedNFT.lockedOnChain}</p>
                      <p className="text-sm text-gray-400">Target chain: {selectedNFT.targetChain}</p>
                      <p className="text-green-400 font-medium">
                        Max borrowable: ${selectedNFT.maxBorrowable.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Borrow Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Borrow Amount (USDC)</label>
                        <input
                          type="number"
                          min="0"
                          max={selectedNFT.maxBorrowable}
                          step="0.01"
                          value={borrowAmount}
                          onChange={(e) => setBorrowAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Max ${selectedNFT.maxBorrowable.toLocaleString()}`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Loan Duration (months)</label>
                        <select
                          value={borrowDuration}
                          onChange={(e) => setBorrowDuration(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={3}>3 months</option>
                          <option value={6}>6 months</option>
                          <option value={12}>12 months</option>
                          <option value={24}>24 months</option>
                        </select>
                      </div>

                      <button
                        onClick={handleUseAsCollateral}
                        disabled={isLoading || !borrowAmount || parseFloat(borrowAmount) <= 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Borrow via ZetaChain
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Borrow Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">NFT Value:</span>
                        <span className="text-white">${selectedNFT.collateralValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Borrow Amount:</span>
                        <span className="text-blue-400">
                          {borrowAmount ? `$${parseFloat(borrowAmount).toLocaleString()}` : '$0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">LTV Ratio:</span>
                        <span className="text-white">{selectedNFT.loanToValue}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{borrowDuration} months</span>
                      </div>
                      <hr className="border-slate-600" />
                      <div className="flex justify-between">
                        <span className="text-gray-400">Remaining Credit:</span>
                        <span className="text-green-400">
                          ${Math.max(0, selectedNFT.maxBorrowable - (parseFloat(borrowAmount) || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {borrowStatus && (
                      <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded text-green-300">
                        {borrowStatus}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Transaction History</h2>
            
            <div className="space-y-4">
              {nfts.flatMap(nft => nft.history).sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              ).map((item) => (
                <div key={item.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{item.event}</h4>
                      <p className="text-gray-400 text-sm">{item.details}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(item.timestamp).toLocaleString()} on {item.chain}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">TX Hash</div>
                      <a
                        href={`https://explorer.zetachain.com/cc/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 font-mono text-sm hover:text-blue-300 transition-colors cursor-pointer"
                        title="View on ZetaScan"
                      >
                        {item.txHash}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">NFT Marketplace Integration</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Popular Marketplaces
                </h3>
                <div className="space-y-3">
                  <a
                    href="https://opensea.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                  >
                    <span className="text-white">OpenSea</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </a>
                  <a
                    href="https://magiceden.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                  >
                    <span className="text-white">Magic Eden</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </a>
                  <a
                    href="https://blur.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                  >
                    <span className="text-white">Blur</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                                 <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                   <ArrowUpDown className="w-5 h-5 mr-2" />
                   Cross-Chain Bridge
                 </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => alert('ZetaChain bridge integration coming soon!')}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Bridge NFT via ZetaChain
                  </button>
                  <button
                    onClick={() => alert('LayerZero bridge integration coming soon!')}
                    className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Bridge NFT via LayerZero
                  </button>
                  <button
                    onClick={() => alert('Wormhole bridge integration coming soon!')}
                    className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Bridge NFT via Wormhole
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NftCollateral;
