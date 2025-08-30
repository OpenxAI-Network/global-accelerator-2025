import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import axios from 'axios';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure ZetaChain RPC provider
const ZETACHAIN_RPC = process.env.ZETACHAIN_RPC || 'https://rpc.zetachain.net';
const provider = new ethers.JsonRpcProvider(ZETACHAIN_RPC);

// Wallet private key with sufficient permissions to relay transactions
const PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY || '';
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Lending contract configurations for different chains
const lendingContracts = {
  bitcoin: {
    address: '0xBitcoinLendingContractAddress',
    abi: [
      'function depositCollateral(string asset, uint256 amount, address user) external returns (bytes32)',
      'event DepositCollateral(address indexed user, string asset, uint256 amount, bytes32 txId)',
      'event CrossChainDeposit(address indexed user, string sourceChain, string targetChain, string asset, uint256 amount)'
    ],
  },
  ethereum: {
    address: '0xEthereumLendingContractAddress',
    abi: [
      'function depositCollateral(string asset, uint256 amount, address user) external returns (bytes32)',
      'event DepositCollateral(address indexed user, string asset, uint256 amount, bytes32 txId)',
      'event CrossChainDeposit(address indexed user, string sourceChain, string targetChain, string asset, uint256 amount)'
    ],
  },
  solana: {
    address: '0xSolanaLendingContractAddress',
    abi: [
      'function depositCollateral(string asset, uint256 amount, address user) external returns (bytes32)',
      'event DepositCollateral(address indexed user, string asset, uint256 amount, bytes32 txId)',
      'event CrossChainDeposit(address indexed user, string sourceChain, string targetChain, string asset, uint256 amount)'
    ],
  },
  polygon: {
    address: '0xPolygonLendingContractAddress',
    abi: [
      'function depositCollateral(string asset, uint256 amount, address user) external returns (bytes32)',
      'event DepositCollateral(address indexed user, string asset, uint256 amount, bytes32 txId)',
      'event CrossChainDeposit(address indexed user, string sourceChain, string targetChain, string asset, uint256 amount)'
    ],
  },
  avalanche: {
    address: '0xAvalancheLendingContractAddress',
    abi: [
      'function depositCollateral(string asset, uint256 amount, address user) external returns (bytes32)',
      'event DepositCollateral(address indexed user, string asset, uint256 amount, bytes32 txId)',
      'event CrossChainDeposit(address indexed user, string sourceChain, string targetChain, string asset, uint256 amount)'
    ],
  },
  zetachain: {
    address: '0xZetaChainLendingContractAddress',
    abi: [
      'function depositCollateral(string asset, uint256 amount, address user) external returns (bytes32)',
      'function crossChainDeposit(string sourceChain, string targetChain, string asset, uint256 amount, address user) external returns (bytes32)',
      'event DepositCollateral(address indexed user, string asset, uint256 amount, bytes32 txId)',
      'event CrossChainDeposit(address indexed user, string sourceChain, string targetChain, string asset, uint256 amount)'
    ],
  },
};

// NFT contract configurations
const nftContracts = {
  bayc: {
    address: '0x4c4a07F737Bf57F6632B6CAB089B78f62385aCaE',
    chain: 'ethereum'
  },
  azuki: {
    address: '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
    chain: 'ethereum'
  },
  punks: {
    address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
    chain: 'ethereum'
  }
};

// In-memory storage for demo (use a real database in production)
const depositHistory = new Map();
const transactionStatus = new Map();

// Oracle price endpoints
const ORACLE_ENDPOINTS = {
  coingecko: 'https://api.coingecko.com/api/v3/simple/price',
  chainlink: 'https://api.chain.link/price-feeds',
  aegis: process.env.AEGIS_ORACLE_URL || 'https://oracle.aegis.ai/prices'
};

/**
 * Get real-time oracle prices
 */
app.get('/api/oracle/prices', async (req, res) => {
  try {
    // Fetch from multiple oracles for redundancy
    const prices = await fetchOraclePrices();
    res.json(prices);
  } catch (error) {
    console.error('Oracle price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch oracle prices' });
  }
});

/**
 * Submit collateral deposit
 */
app.post('/api/deposits', async (req, res) => {
  try {
    const { userAddress, asset, amount, sourceChain, targetChain, assetType, tokenId } = req.body;

    // Validate input
    if (!userAddress || !asset || !amount || !sourceChain || !targetChain) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    // Handle NFT deposits differently
    if (assetType === 'nft') {
      return await handleNFTDeposit(req, res);
    }

    // Get contract configuration
    const contractInfo = lendingContracts[targetChain.toLowerCase()];
    if (!contractInfo) {
      return res.status(400).json({ error: `Unsupported target chain: ${targetChain}` });
    }

    // Create contract instance
    const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);

    // Convert amount to proper units (assuming 18 decimals for most tokens)
    const decimals = getAssetDecimals(asset);
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);

    let tx;
    if (sourceChain.toLowerCase() === targetChain.toLowerCase()) {
      // Same chain deposit
      tx = await contract.depositCollateral(asset, amountInWei, userAddress);
    } else {
      // Cross-chain deposit via ZetaChain
      const zetaContract = new ethers.Contract(
        lendingContracts.zetachain.address,
        lendingContracts.zetachain.abi,
        signer
      );
      tx = await zetaContract.crossChainDeposit(
        sourceChain,
        targetChain,
        asset,
        amountInWei,
        userAddress
      );
    }

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Store transaction status
    transactionStatus.set(tx.hash, {
      status: 'confirmed',
      confirmations: receipt.confirmations || 1,
      blockNumber: receipt.blockNumber,
      timestamp: new Date().toISOString()
    });

    // Store in deposit history
    const depositRecord = {
      id: tx.hash,
      userAddress,
      asset,
      amount: parseFloat(amount),
      sourceChain,
      targetChain,
      assetType: assetType || 'crypto',
      txHash: tx.hash,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      blockNumber: receipt.blockNumber
    };

    if (!depositHistory.has(userAddress)) {
      depositHistory.set(userAddress, []);
    }
    depositHistory.get(userAddress).push(depositRecord);

    // Trigger AI credit scoring update
    await triggerAICreditScoring(userAddress, {
      action: 'deposit',
      asset,
      amount: parseFloat(amount),
      chain: targetChain
    });

    return res.json({
      success: true,
      txHash: tx.hash,
      estimatedConfirmationTime: getEstimatedConfirmationTime(targetChain),
      bridgeFee: sourceChain !== targetChain ? calculateBridgeFee(amount, sourceChain, targetChain) : 0
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Transaction failed'
    });
  }
});

/**
 * Get deposit transaction status
 */
app.get('/api/deposits/status/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    // Check our local storage first
    const localStatus = transactionStatus.get(txHash);
    if (localStatus) {
      return res.json(localStatus);
    }

    // Query blockchain for transaction status
    try {
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt) {
        const status = {
          status: receipt.status === 1 ? 'confirmed' : 'failed',
          confirmations: receipt.confirmations || 0,
          blockNumber: receipt.blockNumber,
          timestamp: new Date().toISOString()
        };
        
        transactionStatus.set(txHash, status);
        return res.json(status);
      } else if (tx) {
        return res.json({
          status: 'pending',
          confirmations: 0,
          estimatedTime: 30 // seconds
        });
      } else {
        return res.status(404).json({ error: 'Transaction not found' });
      }
    } catch (blockchainError) {
      console.error('Blockchain query error:', blockchainError);
      return res.status(500).json({ error: 'Failed to query transaction status' });
    }

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check transaction status' });
  }
});

/**
 * Get user's deposit history
 */
app.get('/api/deposits/history/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    const history = depositHistory.get(userAddress) || [];
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch deposit history' });
  }
});

/**
 * Estimate bridge fees
 */
app.post('/api/bridge/estimate', async (req, res) => {
  try {
    const { sourceChain, targetChain, asset, amount } = req.body;
    
    const fee = calculateBridgeFee(amount, sourceChain, targetChain);
    const estimatedTime = getEstimatedBridgeTime(sourceChain, targetChain);
    
    // Get current asset price for USD conversion
    const prices = await fetchOraclePrices();
    const assetPrice = prices[asset]?.price || 0;
    
    res.json({
      fee,
      feeUSD: fee * assetPrice,
      estimatedTime
    });
  } catch (error) {
    console.error('Bridge estimation error:', error);
    res.status(500).json({ error: 'Failed to estimate bridge fees' });
  }
});

/**
 * Validate NFT ownership
 */
app.post('/api/nft/validate', async (req, res) => {
  try {
    const { userAddress, contractAddress, tokenId, chain } = req.body;
    
    // This would typically query the blockchain to verify ownership
    // For demo purposes, we'll simulate the check
    const isOwner = await validateNFTOwnership(userAddress, contractAddress, tokenId, chain);
    
    res.json({ isOwner });
  } catch (error) {
    console.error('NFT validation error:', error);
    res.status(500).json({ error: 'Failed to validate NFT ownership' });
  }
});

/**
 * Get supported chains
 */
app.get('/api/chains/supported', (req, res) => {
  const chains = Object.keys(lendingContracts).map(chainId => ({
    id: chainId,
    name: chainId.charAt(0).toUpperCase() + chainId.slice(1),
    status: 'healthy', // This would be dynamic in production
    gasPrice: getGasPrice(chainId),
    confirmationTime: getEstimatedConfirmationTime(chainId)
  }));
  
  res.json(chains);
});

/**
 * Trigger AI credit score update
 */
app.post('/api/ai/credit-score/update', async (req, res) => {
  try {
    const { userAddress } = req.body;
    
    await triggerAICreditScoring(userAddress, {
      action: 'manual_update',
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Credit score update triggered' });
  } catch (error) {
    console.error('Credit score update error:', error);
    res.status(500).json({ error: 'Failed to trigger credit score update' });
  }
});

// Helper Functions

async function fetchOraclePrices() {
  try {
    // Simulate fetching from multiple oracles
    const mockPrices = {
      BTC: { price: 52400 + (Math.random() - 0.5) * 1000, change24h: 2.4, source: 'Aegis Oracle' },
      ETH: { price: 2500 + (Math.random() - 0.5) * 100, change24h: -1.2, source: 'Aegis Oracle' },
      SOL: { price: 93 + (Math.random() - 0.5) * 5, change24h: 5.8, source: 'Aegis Oracle' },
      USDC: { price: 1, change24h: 0.1, source: 'Aegis Oracle' },
      MATIC: { price: 0.75 + (Math.random() - 0.5) * 0.05, change24h: 3.2, source: 'Aegis Oracle' },
      AVAX: { price: 18.50 + (Math.random() - 0.5) * 2, change24h: -0.8, source: 'Aegis Oracle' }
    };
    
    // Add timestamp to each price
    Object.keys(mockPrices).forEach(symbol => {
      mockPrices[symbol].lastUpdated = new Date();
    });
    
    return mockPrices;
  } catch (error) {
    console.error('Error fetching oracle prices:', error);
    throw error;
  }
}

async function triggerAICreditScoring(userAddress, activityData) {
  try {
    // This would call your AI service (Google Cloud AI, OpenAI, etc.)
    const aiEndpoint = process.env.AI_CREDIT_ENDPOINT || 'https://ai.aegis.io/credit-score';
    
    const response = await axios.post(aiEndpoint, {
      userAddress,
      activityData,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000 // 5 second timeout
    });
    
    console.log(`AI Credit scoring updated for ${userAddress}:`, response.data);
  } catch (error) {
    console.error('Error in AI Credit Scoring:', error.message);
    // Don't throw - this is non-critical
  }
}

async function handleNFTDeposit(req, res) {
  const { userAddress, asset, tokenId, sourceChain, targetChain } = req.body;
  
  // Validate NFT ownership
  const nftConfig = nftContracts[asset.toLowerCase()];
  if (!nftConfig) {
    return res.status(400).json({ error: `Unsupported NFT collection: ${asset}` });
  }
  
  const isOwner = await validateNFTOwnership(userAddress, nftConfig.address, tokenId, sourceChain);
  if (!isOwner) {
    return res.status(400).json({ error: 'User does not own this NFT' });
  }
  
  // Simulate NFT deposit transaction
  const txHash = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Store transaction
  transactionStatus.set(txHash, {
    status: 'confirmed',
    confirmations: 1,
    timestamp: new Date().toISOString()
  });
  
  return res.json({
    success: true,
    txHash,
    estimatedConfirmationTime: 60, // 1 minute for NFT deposits
    bridgeFee: 0
  });
}

async function validateNFTOwnership(userAddress, contractAddress, tokenId, chain) {
  try {
    // This would query the actual NFT contract
    // For demo purposes, we'll simulate ownership validation
    return Math.random() > 0.2; // 80% chance of ownership for demo
  } catch (error) {
    console.error('NFT ownership validation error:', error);
    return false;
  }
}

function getAssetDecimals(asset) {
  const decimals = {
    'BTC': 8,
    'ETH': 18,
    'SOL': 9,
    'USDC': 6,
    'MATIC': 18,
    'AVAX': 18
  };
  return decimals[asset] || 18;
}

function calculateBridgeFee(amount, sourceChain, targetChain) {
  if (sourceChain === targetChain) return 0;
  
  // Different fee structures for different bridge routes
  const feeRates = {
    'bitcoin-ethereum': 0.001, // 0.1%
    'ethereum-polygon': 0.0005, // 0.05%
    'solana-ethereum': 0.002, // 0.2%
    'default': 0.001 // 0.1%
  };
  
  const route = `${sourceChain.toLowerCase()}-${targetChain.toLowerCase()}`;
  const feeRate = feeRates[route] || feeRates.default;
  
  return amount * feeRate;
}

function getEstimatedConfirmationTime(chain) {
  const times = {
    'bitcoin': 600, // 10 minutes
    'ethereum': 12, // 12 seconds
    'solana': 1, // 1 second
    'polygon': 2, // 2 seconds
    'avalanche': 3, // 3 seconds
    'arbitrum': 1, // 1 second
    'zetachain': 2 // 2 seconds
  };
  return times[chain.toLowerCase()] || 30;
}

function getEstimatedBridgeTime(sourceChain, targetChain) {
  // Cross-chain bridge times are typically longer
  return 300; // 5 minutes average
}

function getGasPrice(chain) {
  const gasPrices = {
    'bitcoin': '1-5 sat/vB',
    'ethereum': '15-25 gwei',
    'solana': '0.000005 SOL',
    'polygon': '30-50 gwei',
    'avalanche': '25-35 gwei',
    'arbitrum': '0.1-0.3 gwei',
    'zetachain': '0.1 gwei'
  };
  return gasPrices[chain] || '10 gwei';
}

// Event listeners for deposit events
function listenToDepositEvents() {
  Object.entries(lendingContracts).forEach(([chainName, { address, abi }]) => {
    try {
      const contract = new ethers.Contract(address, abi, provider);

      contract.on('DepositCollateral', (user, asset, amount, txId) => {
        console.log(`DepositCollateral event on ${chainName}: User ${user} deposited ${ethers.formatUnits(amount, 18)} ${asset}`);
        
        // Update deposit history
        const depositRecord = {
          id: txId,
          userAddress: user,
          asset,
          amount: parseFloat(ethers.formatUnits(amount, 18)),
          sourceChain: chainName,
          targetChain: chainName,
          assetType: 'crypto',
          txHash: txId,
          status: 'confirmed',
          timestamp: new Date().toISOString()
        };
        
        if (!depositHistory.has(user)) {
          depositHistory.set(user, []);
        }
        depositHistory.get(user).push(depositRecord);
      });

      contract.on('CrossChainDeposit', (user, sourceChain, targetChain, asset, amount) => {
        console.log(`CrossChainDeposit event: User ${user} deposited ${ethers.formatUnits(amount, 18)} ${asset} from ${sourceChain} to ${targetChain}`);
      });
      
    } catch (error) {
      console.error(`Error setting up event listeners for ${chainName}:`, error);
    }
  });
}

// Initialize event listeners
listenToDepositEvents();

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Aegis Cross-Chain Lending Backend listening on port ${PORT}`);
  console.log(`📊 Oracle prices endpoint: http://localhost:${PORT}/api/oracle/prices`);
  console.log(`💰 Deposits endpoint: http://localhost:${PORT}/api/deposits`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

export default app;
