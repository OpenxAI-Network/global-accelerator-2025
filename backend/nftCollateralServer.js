import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

// ZetaChain RPC configuration
const ZETACHAIN_RPC_URL = 'https://rpc.zetachain.net';
const provider = new ethers.JsonRpcProvider(ZETACHAIN_RPC_URL);

// Backend wallet for transaction signing (load from environment in production)
const PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY || '0x1234567890123456789012345678901234567890123456789012345678901234';
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Mock NFT collateral contracts for different chains (replace with actual deployed contracts)
const nftCollateralContracts = {
  ethereum: {
    address: '0x1234567890123456789012345678901234567890',
    abi: [
      'function lockNFTAsCollateral(address nftContract, uint256 tokenId, uint256 collateralValue) external',
      'function unlockNFT(address nftContract, uint256 tokenId) external',
      'function borrowAgainstNFT(address nftContract, uint256 tokenId, uint256 amount, uint256 duration) external',
      'function getNFTCollateralInfo(address nftContract, uint256 tokenId) external view returns (uint256, uint256, bool)',
      'event NFTLocked(address indexed user, address indexed nftContract, uint256 indexed tokenId, uint256 collateralValue, uint256 timestamp)',
      'event NFTUnlocked(address indexed user, address indexed nftContract, uint256 indexed tokenId, uint256 timestamp)',
      'event NFTBorrowed(address indexed user, address indexed nftContract, uint256 indexed tokenId, uint256 amount, uint256 duration, uint256 timestamp)'
    ]
  },
  solana: {
    address: '0x2345678901234567890123456789012345678901',
    abi: [
      'function lockNFTAsCollateral(address nftContract, uint256 tokenId, uint256 collateralValue) external',
      'function unlockNFT(address nftContract, uint256 tokenId) external',
      'function borrowAgainstNFT(address nftContract, uint256 tokenId, uint256 amount, uint256 duration) external'
    ]
  },
  polygon: {
    address: '0x3456789012345678901234567890123456789012',
    abi: [
      'function lockNFTAsCollateral(address nftContract, uint256 tokenId, uint256 collateralValue) external',
      'function unlockNFT(address nftContract, uint256 tokenId) external',
      'function borrowAgainstNFT(address nftContract, uint256 tokenId, uint256 amount, uint256 duration) external'
    ]
  },
  avalanche: {
    address: '0x4567890123456789012345678901234567890123',
    abi: [
      'function lockNFTAsCollateral(address nftContract, uint256 tokenId, uint256 collateralValue) external',
      'function unlockNFT(address nftContract, uint256 tokenId) external',
      'function borrowAgainstNFT(address nftContract, uint256 tokenId, uint256 amount, uint256 duration) external'
    ]
  }
};

// Mock NFT collateral data storage (replace with database in production)
const nftCollaterals = new Map();
const userNFTs = new Map();
const nftHistory = new Map();

// Initialize mock data
const initializeMockData = () => {
  const mockNFTs = [
    {
      id: 'nft-001',
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenId: '1234',
      contractAddress: '0x1234567890123456789012345678901234567890',
      name: 'Dragon Slayer Sword',
      description: 'Epic rare sword from Fantasy Game X with fire enchantment',
      imageUrl: 'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Dragon+Sword',
      lockedOnChain: 'ethereum',
      targetChain: 'solana',
      gameFiPlatform: 'Fantasy Game X',
      rarity: 'epic',
      floorPrice: ethers.parseUnits('2500', 18),
      collateralValue: ethers.parseUnits('3000', 18),
      loanToValue: 70,
      maxBorrowable: ethers.parseUnits('2100', 18),
      isLocked: true,
      lockTimestamp: new Date('2025-08-15T10:00:00Z').toISOString(),
      unlockTimestamp: new Date('2025-11-15T10:00:00Z').toISOString(),
      metadata: {
        attributes: [
          { trait_type: 'Attack', value: '85' },
          { trait_type: 'Defense', value: '45' },
          { trait_type: 'Rarity', value: 'Epic' },
          { trait_type: 'Element', value: 'Fire' }
        ],
        external_url: 'https://fantasygamex.com/nft/1234',
        animation_url: 'https://fantasygamex.com/animations/sword.mp4'
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'nft-002',
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenId: '5678',
      contractAddress: '0x2345678901234567890123456789012345678901',
      name: 'Crypto Racer Car',
      description: 'Limited edition NFT car in Racing Game Y with turbo boost',
      imageUrl: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Crypto+Car',
      lockedOnChain: 'solana',
      targetChain: 'ethereum',
      gameFiPlatform: 'Racing Game Y',
      rarity: 'legendary',
      floorPrice: ethers.parseUnits('5000', 18),
      collateralValue: ethers.parseUnits('6000', 18),
      loanToValue: 65,
      maxBorrowable: ethers.parseUnits('3900', 18),
      isLocked: true,
      lockTimestamp: new Date('2025-08-10T08:30:00Z').toISOString(),
      unlockTimestamp: new Date('2025-10-10T08:30:00Z').toISOString(),
      metadata: {
        attributes: [
          { trait_type: 'Speed', value: '95' },
          { trait_type: 'Handling', value: '88' },
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Boost', value: 'Turbo' }
        ],
        external_url: 'https://racinggamey.com/nft/5678'
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'nft-003',
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      tokenId: '9012',
      contractAddress: '0x3456789012345678901234567890123456789012',
      name: 'Pixel Warrior',
      description: 'Rare pixel art warrior from Retro Game Z',
      imageUrl: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Pixel+Warrior',
      lockedOnChain: 'polygon',
      targetChain: 'avalanche',
      gameFiPlatform: 'Retro Game Z',
      rarity: 'rare',
      floorPrice: ethers.parseUnits('800', 18),
      collateralValue: ethers.parseUnits('1000', 18),
      loanToValue: 75,
      maxBorrowable: ethers.parseUnits('750', 18),
      isLocked: false,
      metadata: {
        attributes: [
          { trait_type: 'Strength', value: '72' },
          { trait_type: 'Agility', value: '68' },
          { trait_type: 'Rarity', value: 'Rare' },
          { trait_type: 'Style', value: 'Pixel' }
        ],
        external_url: 'https://retrogamez.com/nft/9012'
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  ];

  mockNFTs.forEach(nft => {
    nftCollaterals.set(nft.id, nft);
    if (!userNFTs.has(nft.userAddress)) {
      userNFTs.set(nft.userAddress, []);
    }
    userNFTs.get(nft.userAddress).push(nft.id);
    
    // Initialize history
    nftHistory.set(nft.id, []);
  });

  // Add some mock history
  const history1 = [
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
    }
  ];
  nftHistory.set('nft-001', history1);

  const history2 = [
    { 
      id: 'hist-003', 
      event: 'Locked as collateral', 
      timestamp: '2025-08-10T08:30:00Z',
      txHash: '0x789...ghi',
      chain: 'solana',
      details: 'NFT locked on Solana for cross-chain borrowing'
    }
  ];
  nftHistory.set('nft-002', history2);
};

// Initialize mock data
initializeMockData();

// API Endpoints

// Get all NFT collaterals for a user
app.get('/api/nft-collateral/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const userNFTIds = userNFTs.get(userAddress) || [];
    const userNFTsData = userNFTIds.map(id => nftCollaterals.get(id)).filter(Boolean);

    // Convert BigInt values to strings for JSON serialization
    const serializedNFTs = userNFTsData.map(nft => ({
      ...nft,
      floorPrice: ethers.formatUnits(nft.floorPrice, 18),
      collateralValue: ethers.formatUnits(nft.collateralValue, 18),
      maxBorrowable: ethers.formatUnits(nft.maxBorrowable, 18)
    }));

    res.json({
      success: true,
      nfts: serializedNFTs
    });
  } catch (error) {
    console.error('Error fetching NFT collaterals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NFT collaterals'
    });
  }
});

// Get specific NFT collateral details
app.get('/api/nft-collateral/:userAddress/:nftId', async (req, res) => {
  try {
    const { userAddress, nftId } = req.params;
    const nft = nftCollaterals.get(nftId);

    if (!nft || nft.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'NFT collateral not found'
      });
    }

    // Serialize BigInt values
    const serializedNFT = {
      ...nft,
      floorPrice: ethers.formatUnits(nft.floorPrice, 18),
      collateralValue: ethers.formatUnits(nft.collateralValue, 18),
      maxBorrowable: ethers.formatUnits(nft.maxBorrowable, 18)
    };

    res.json({
      success: true,
      nft: serializedNFT
    });
  } catch (error) {
    console.error('Error fetching NFT collateral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NFT collateral details'
    });
  }
});

// Lock NFT as collateral
app.post('/api/nft-collateral/:nftId/lock', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { userAddress, chain, collateralValue } = req.body;

    if (!userAddress || !chain || !collateralValue) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const nft = nftCollaterals.get(nftId);
    if (!nft || nft.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'NFT collateral not found'
      });
    }

    const contractInfo = nftCollateralContracts[chain.toLowerCase()];
    if (!contractInfo) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported chain'
      });
    }

    // Convert collateral value to wei
    const collateralValueInWei = ethers.parseUnits(collateralValue.toString(), 18);

    try {
      // Call smart contract to lock NFT
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
      const tx = await contract.lockNFTAsCollateral(nft.contractAddress, nft.tokenId, collateralValueInWei);
      const receipt = await tx.wait();

      // Update NFT data
      nft.isLocked = true;
      nft.lockTimestamp = new Date().toISOString();
      nft.collateralValue = collateralValueInWei;
      nft.lockedOnChain = chain.toLowerCase();
      nft.lastUpdated = new Date().toISOString();

      // Add to history
      const historyItem = {
        id: `hist-${Date.now()}`,
        event: 'Locked as collateral',
        timestamp: new Date().toISOString(),
        txHash: tx.hash,
        chain: chain.toLowerCase(),
        details: `NFT locked on ${chain} for cross-chain borrowing`
      };

      if (!nftHistory.has(nftId)) {
        nftHistory.set(nftId, []);
      }
      nftHistory.get(nftId).unshift(historyItem);

      res.json({
        success: true,
        txHash: tx.hash,
        updatedNFT: {
          ...nft,
          floorPrice: ethers.formatUnits(nft.floorPrice, 18),
          collateralValue: ethers.formatUnits(nft.collateralValue, 18),
          maxBorrowable: ethers.formatUnits(nft.maxBorrowable, 18)
        }
      });

    } catch (contractError) {
      console.error('Contract error:', contractError);
      res.status(500).json({
        success: false,
        message: 'Failed to lock NFT on blockchain'
      });
    }

  } catch (error) {
    console.error('Error locking NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lock NFT'
    });
  }
});

// Unlock NFT collateral
app.post('/api/nft-collateral/:nftId/unlock', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { userAddress, chain } = req.body;

    if (!userAddress || !chain) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const nft = nftCollaterals.get(nftId);
    if (!nft || nft.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'NFT collateral not found'
      });
    }

    const contractInfo = nftCollateralContracts[chain.toLowerCase()];
    if (!contractInfo) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported chain'
      });
    }

    try {
      // Call smart contract to unlock NFT
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
      const tx = await contract.unlockNFT(nft.contractAddress, nft.tokenId);
      const receipt = await tx.wait();

      // Update NFT data
      nft.isLocked = false;
      nft.unlockTimestamp = new Date().toISOString();
      nft.lastUpdated = new Date().toISOString();

      // Add to history
      const historyItem = {
        id: `hist-${Date.now()}`,
        event: 'Unlocked NFT',
        timestamp: new Date().toISOString(),
        txHash: tx.hash,
        chain: chain.toLowerCase(),
        details: `NFT unlocked from ${chain}`
      };

      if (!nftHistory.has(nftId)) {
        nftHistory.set(nftId, []);
      }
      nftHistory.get(nftId).unshift(historyItem);

      res.json({
        success: true,
        txHash: tx.hash,
        updatedNFT: {
          ...nft,
          floorPrice: ethers.formatUnits(nft.floorPrice, 18),
          collateralValue: ethers.formatUnits(nft.collateralValue, 18),
          maxBorrowable: ethers.formatUnits(nft.maxBorrowable, 18)
        }
      });

    } catch (contractError) {
      console.error('Contract error:', contractError);
      res.status(500).json({
        success: false,
        message: 'Failed to unlock NFT on blockchain'
      });
    }

  } catch (error) {
    console.error('Error unlocking NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock NFT'
    });
  }
});

// Borrow against NFT collateral
app.post('/api/nft-collateral/:nftId/borrow', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { userAddress, amount, duration, targetChain } = req.body;

    if (!userAddress || !amount || !duration || !targetChain) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const nft = nftCollaterals.get(nftId);
    if (!nft || nft.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'NFT collateral not found'
      });
    }

    if (!nft.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'NFT must be locked as collateral before borrowing'
      });
    }

    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    if (amountInWei > nft.maxBorrowable) {
      return res.status(400).json({
        success: false,
        message: 'Borrow amount exceeds maximum borrowable amount'
      });
    }

    try {
      // Call smart contract to borrow against NFT
      const contract = new ethers.Contract(nftCollateralContracts[nft.lockedOnChain].address, nftCollateralContracts[nft.lockedOnChain].abi, signer);
      const tx = await contract.borrowAgainstNFT(nft.contractAddress, nft.tokenId, amountInWei, duration);
      const receipt = await tx.wait();

      // Add to history
      const historyItem = {
        id: `hist-${Date.now()}`,
        event: `Borrowed ${amount} USDC`,
        timestamp: new Date().toISOString(),
        txHash: tx.hash,
        chain: targetChain.toLowerCase(),
        details: `Cross-chain borrow using ${nft.name} as collateral`
      };

      if (!nftHistory.has(nftId)) {
        nftHistory.set(nftId, []);
      }
      nftHistory.get(nftId).unshift(historyItem);

      res.json({
        success: true,
        txHash: tx.hash,
        message: `Successfully borrowed ${amount} USDC using ${nft.name} as collateral`
      });

    } catch (contractError) {
      console.error('Contract error:', contractError);
      res.status(500).json({
        success: false,
        message: 'Failed to process borrow on blockchain'
      });
    }

  } catch (error) {
    console.error('Error processing borrow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process borrow request'
    });
  }
});

// Get NFT transaction history
app.get('/api/nft-collateral/:nftId/history', async (req, res) => {
  try {
    const { nftId } = req.params;
    const history = nftHistory.get(nftId) || [];

    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('Error fetching NFT history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NFT history'
    });
  }
});

// Get marketplace links for NFT
app.get('/api/nft-collateral/:nftId/marketplace', async (req, res) => {
  try {
    const { nftId } = req.params;
    const nft = nftCollaterals.get(nftId);

    if (!nft) {
      return res.status(404).json({
        success: false,
        message: 'NFT collateral not found'
      });
    }

    // Generate marketplace links based on chain
    const marketplaceLinks = {
      opensea: `https://opensea.io/assets/${nft.lockedOnChain}/${nft.contractAddress}/${nft.tokenId}`,
      magiceden: nft.lockedOnChain === 'solana' ? `https://magiceden.io/item-details/${nft.contractAddress}` : null,
      blur: nft.lockedOnChain === 'ethereum' ? `https://blur.io/collection/${nft.contractAddress}/${nft.tokenId}` : null,
      external: nft.metadata.external_url
    };

    res.json({
      success: true,
      marketplaceLinks
    });
  } catch (error) {
    console.error('Error fetching marketplace links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace links'
    });
  }
});

// Bridge NFT to another chain
app.post('/api/nft-collateral/:nftId/bridge', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { userAddress, targetChain, bridgeProvider } = req.body;

    if (!userAddress || !targetChain || !bridgeProvider) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const nft = nftCollaterals.get(nftId);
    if (!nft || nft.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'NFT collateral not found'
      });
    }

    // Simulate bridge transaction
    const bridgeTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    // Add to history
    const historyItem = {
      id: `hist-${Date.now()}`,
      event: `Bridged to ${targetChain}`,
      timestamp: new Date().toISOString(),
      txHash: bridgeTxHash,
      chain: targetChain.toLowerCase(),
      details: `NFT bridged to ${targetChain} via ${bridgeProvider}`
    };

    if (!nftHistory.has(nftId)) {
      nftHistory.set(nftId, []);
    }
    nftHistory.get(nftId).unshift(historyItem);

    res.json({
      success: true,
      bridgeTxHash,
      message: `NFT successfully bridged to ${targetChain} via ${bridgeProvider}`,
      estimatedTime: '5-10 minutes'
    });

  } catch (error) {
    console.error('Error bridging NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bridge NFT'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    chains: Object.keys(nftCollateralContracts),
    totalNFTs: nftCollaterals.size
  });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚀 NFT Collateral Server running on port ${PORT}`);
  console.log(`📊 Supporting ${Object.keys(nftCollateralContracts).length} chains`);
  console.log(`🔗 ZetaChain RPC: ${ZETACHAIN_RPC_URL}`);
  console.log(`🎮 GameFi & NFT collateral management enabled`);
});

export default app;
