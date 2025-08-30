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
  ethereum: {
    address: '0xYourEthereumLendingContract',
    abi: [
      'function borrow(address asset, uint256 amount, uint256 duration, address borrower) external returns (bytes32)',
      'function getBorrowerInfo(address borrower) external view returns (uint256 creditLimit, uint256 currentBorrowed, uint256 riskScore)',
      'event LoanCreated(address indexed borrower, address asset, uint256 amount, uint256 duration, bytes32 loanId)',
      'event BorrowRepaid(address indexed borrower, bytes32 loanId, uint256 amount)',
      'event LiquidationWarning(address indexed borrower, bytes32 loanId, uint256 riskLevel)'
    ],
  },
  solana: {
    address: '0xYourSolanaLendingContract',
    abi: [
      'function borrow(address asset, uint256 amount, uint256 duration, address borrower) external returns (bytes32)',
      'function getBorrowerInfo(address borrower) external view returns (uint256 creditLimit, uint256 currentBorrowed, uint256 riskScore)',
      'event LoanCreated(address indexed borrower, address asset, uint256 amount, uint256 duration, bytes32 loanId)',
      'event BorrowRepaid(address indexed borrower, bytes32 loanId, uint256 amount)',
      'event LiquidationWarning(address indexed borrower, bytes32 loanId, uint256 riskLevel)'
    ],
  },
  polygon: {
    address: '0xYourPolygonLendingContract',
    abi: [
      'function borrow(address asset, uint256 amount, uint256 duration, address borrower) external returns (bytes32)',
      'function getBorrowerInfo(address borrower) external view returns (uint256 creditLimit, uint256 currentBorrowed, uint256 riskScore)',
      'event LoanCreated(address indexed borrower, address asset, uint256 amount, uint256 duration, bytes32 loanId)',
      'event BorrowRepaid(address indexed borrower, bytes32 loanId, uint256 amount)',
      'event LiquidationWarning(address indexed borrower, bytes32 loanId, uint256 riskLevel)'
    ],
  },
  avalanche: {
    address: '0xYourAvalancheLendingContract',
    abi: [
      'function borrow(address asset, uint256 amount, uint256 duration, address borrower) external returns (bytes32)',
      'function getBorrowerInfo(address borrower) external view returns (uint256 creditLimit, uint256 currentBorrowed, uint256 riskScore)',
      'event LoanCreated(address indexed borrower, address asset, uint256 amount, uint256 duration, bytes32 loanId)',
      'event BorrowRepaid(address indexed borrower, bytes32 loanId, uint256 amount)',
      'event LiquidationWarning(address indexed borrower, bytes32 loanId, uint256 riskLevel)'
    ],
  },
  zetachain: {
    address: '0xYourZetaChainLendingContract',
    abi: [
      'function borrow(address asset, uint256 amount, uint256 duration, address borrower) external returns (bytes32)',
      'function crossChainBorrow(string sourceChain, string targetChain, address asset, uint256 amount, uint256 duration, address borrower) external returns (bytes32)',
      'function getBorrowerInfo(address borrower) external view returns (uint256 creditLimit, uint256 currentBorrowed, uint256 riskScore)',
      'event LoanCreated(address indexed borrower, address asset, uint256 amount, uint256 duration, bytes32 loanId)',
      'event CrossChainBorrow(address indexed borrower, string sourceChain, string targetChain, address asset, uint256 amount, uint256 duration, bytes32 loanId)',
      'event BorrowRepaid(address indexed borrower, bytes32 loanId, uint256 amount)',
      'event LiquidationWarning(address indexed borrower, bytes32 loanId, uint256 riskLevel)'
    ],
  }
};

// Borrowable assets configuration
const borrowableAssets = {
  ZETA: {
    name: 'Zeta',
    price: 2.45,
    availableLiquidity: 5000000,
    maxLoanToValue: 75,
    baseInterestRate: 0.045,
    riskLevel: 'low',
    minBorrowAmount: 100,
    maxBorrowAmount: 100000,
    decimals: 18
  },
  USDC: {
    name: 'USD Coin',
    price: 1.00,
    availableLiquidity: 25000000,
    maxLoanToValue: 90,
    baseInterestRate: 0.038,
    riskLevel: 'low',
    minBorrowAmount: 50,
    maxBorrowAmount: 500000,
    decimals: 6
  },
  DAI: {
    name: 'Dai',
    price: 1.00,
    availableLiquidity: 15000000,
    maxLoanToValue: 85,
    baseInterestRate: 0.042,
    riskLevel: 'low',
    minBorrowAmount: 50,
    maxBorrowAmount: 300000,
    decimals: 18
  },
  USDT: {
    name: 'Tether',
    price: 1.00,
    availableLiquidity: 30000000,
    maxLoanToValue: 88,
    baseInterestRate: 0.040,
    riskLevel: 'low',
    minBorrowAmount: 50,
    maxBorrowAmount: 500000,
    decimals: 6
  },
  ETH: {
    name: 'Ethereum',
    price: 2500,
    availableLiquidity: 8000000,
    maxLoanToValue: 70,
    baseInterestRate: 0.055,
    riskLevel: 'medium',
    minBorrowAmount: 0.1,
    maxBorrowAmount: 1000,
    decimals: 18
  },
  SOL: {
    name: 'Solana',
    price: 93,
    availableLiquidity: 3000000,
    maxLoanToValue: 65,
    baseInterestRate: 0.065,
    riskLevel: 'medium',
    minBorrowAmount: 1,
    maxBorrowAmount: 5000,
    decimals: 9
  }
};

// In-memory storage for demo (use a real database in production)
const borrowHistory = new Map();
const transactionStatus = new Map();
const userCreditProfiles = new Map();

// API Endpoints

/**
 * Get user's credit profile and AI scoring
 */
app.get('/api/borrow/credit-profile/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    // Check if we have a stored profile
    let profile = userCreditProfiles.get(userAddress);
    
    if (!profile) {
      // Generate new AI credit profile
      profile = await generateAICreditProfile(userAddress);
      userCreditProfiles.set(userAddress, profile);
    }

    res.json(profile);
  } catch (error) {
    console.error('Credit profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch credit profile' });
  }
});

/**
 * Get available borrowable assets
 */
app.get('/api/borrow/assets', (req, res) => {
  try {
    const assets = Object.entries(borrowableAssets).map(([symbol, asset]) => ({
      symbol,
      ...asset
    }));
    
    res.json(assets);
  } catch (error) {
    console.error('Assets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch borrowable assets' });
  }
});

/**
 * Calculate loan terms and repayment schedule
 */
app.post('/api/borrow/calculate', async (req, res) => {
  try {
    const { asset, amount, duration, userAddress } = req.body;
    
    if (!asset || !amount || !duration || !userAddress) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get asset configuration
    const assetConfig = borrowableAssets[asset];
    if (!assetConfig) {
      return res.status(400).json({ error: `Unsupported asset: ${asset}` });
    }

    // Get user's credit profile
    const creditProfile = userCreditProfiles.get(userAddress) || await generateAICreditProfile(userAddress);
    
    // Calculate dynamic interest rate
    const interestRate = calculateDynamicInterestRate(
      assetConfig.baseInterestRate,
      creditProfile.creditScore,
      assetConfig.availableLiquidity / 10000000, // Normalize to 10M
      amount,
      creditProfile.currentBorrowed
    );

    // Calculate repayment schedule
    const schedule = calculateRepaymentSchedule(amount, interestRate, duration);
    
    const loanTerms = {
      amount,
      duration,
      interestRate,
      monthlyPayment: schedule[0]?.payment || 0,
      totalRepayment: schedule.reduce((sum, payment) => sum + payment.payment, 0),
      totalInterest: schedule.reduce((sum, payment) => sum + payment.interest, 0),
      riskScore: creditProfile.creditScore,
      liquidityRatio: assetConfig.availableLiquidity / 10000000,
      maxLoanToValue: assetConfig.maxLoanToValue
    };

    res.json(loanTerms);
  } catch (error) {
    console.error('Loan calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate loan terms' });
  }
});

/**
 * Get repayment schedule for loan
 */
app.post('/api/borrow/repayment-schedule', (req, res) => {
  try {
    const { principal, yearlyRate, months } = req.body;
    
    if (!principal || !yearlyRate || !months) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const schedule = calculateRepaymentSchedule(principal, yearlyRate, months);
    res.json(schedule);
  } catch (error) {
    console.error('Repayment schedule error:', error);
    res.status(500).json({ error: 'Failed to calculate repayment schedule' });
  }
});

/**
 * Submit borrow request
 */
app.post('/api/borrow', async (req, res) => {
  try {
    const { userAddress, asset, amount, duration, sourceChain, targetChain, collateralValue } = req.body;

    // Validate input
    if (!userAddress || !asset || !amount || !duration || !sourceChain || !targetChain || !collateralValue) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    // Validate asset
    const assetConfig = borrowableAssets[asset];
    if (!assetConfig) {
      return res.status(400).json({ error: `Unsupported asset: ${asset}` });
    }

    // Validate amount
    if (amount < assetConfig.minBorrowAmount || amount > assetConfig.maxBorrowAmount) {
      return res.status(400).json({ error: `Amount must be between ${assetConfig.minBorrowAmount} and ${assetConfig.maxBorrowAmount}` });
    }

    // Get user's credit profile
    const creditProfile = userCreditProfiles.get(userAddress) || await generateAICreditProfile(userAddress);
    
    // Check credit limits
    if (amount > creditProfile.availableCredit) {
      return res.status(400).json({ error: 'Amount exceeds available credit limit' });
    }

    // Check LTV ratio
    const ltv = (amount / collateralValue) * 100;
    if (ltv > assetConfig.maxLoanToValue) {
      return res.status(400).json({ error: `Loan-to-value ratio ${ltv.toFixed(1)}% exceeds maximum ${assetConfig.maxLoanToValue}%` });
    }

    // Get contract configuration
    const contractInfo = lendingContracts[targetChain.toLowerCase()];
    if (!contractInfo) {
      return res.status(400).json({ error: `Unsupported target chain: ${targetChain}` });
    }

    // Create contract instance
    const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);

    // Convert amount to proper units
    const amountInWei = ethers.parseUnits(amount.toString(), assetConfig.decimals);

    let tx;
    if (sourceChain.toLowerCase() === targetChain.toLowerCase()) {
      // Same chain borrow
      tx = await contract.borrow(asset, amountInWei, duration, userAddress);
    } else {
      // Cross-chain borrow via ZetaChain
      const zetaContract = new ethers.Contract(
        lendingContracts.zetachain.address,
        lendingContracts.zetachain.abi,
        signer
      );
      tx = await zetaContract.crossChainBorrow(
        sourceChain,
        targetChain,
        asset,
        amountInWei,
        duration,
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

    // Store in borrow history
    const borrowRecord = {
      id: tx.hash,
      userAddress,
      asset,
      amount: parseFloat(amount),
      duration,
      sourceChain,
      targetChain,
      collateralValue,
      txHash: tx.hash,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      blockNumber: receipt.blockNumber
    };

    if (!borrowHistory.has(userAddress)) {
      borrowHistory.set(userAddress, []);
    }
    borrowHistory.get(userAddress).push(borrowRecord);

    // Update user's credit profile
    creditProfile.currentBorrowed += parseFloat(amount);
    creditProfile.availableCredit = Math.max(0, creditProfile.creditLimit - creditProfile.currentBorrowed);
    userCreditProfiles.set(userAddress, creditProfile);

    // Trigger AI credit scoring update
    await triggerAICreditScoring(userAddress, {
      action: 'borrow',
      asset,
      amount: parseFloat(amount),
      duration,
      ltv
    });

    // Calculate loan terms for response
    const interestRate = calculateDynamicInterestRate(
      assetConfig.baseInterestRate,
      creditProfile.creditScore,
      assetConfig.availableLiquidity / 10000000,
      amount,
      creditProfile.currentBorrowed
    );

    const schedule = calculateRepaymentSchedule(amount, interestRate, duration);
    const monthlyPayment = schedule[0]?.payment || 0;
    const totalRepayment = schedule.reduce((sum, payment) => sum + payment.payment, 0);

    return res.json({
      success: true,
      txHash: tx.hash,
      estimatedConfirmationTime: getEstimatedConfirmationTime(targetChain),
      interestRate,
      monthlyPayment,
      totalRepayment
    });

  } catch (error) {
    console.error('Borrow error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Transaction failed'
    });
  }
});

/**
 * Get borrow transaction status
 */
app.get('/api/borrow/status/:txHash', async (req, res) => {
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
 * Get user's borrow history
 */
app.get('/api/borrow/history/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    const history = borrowHistory.get(userAddress) || [];
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch borrow history' });
  }
});

/**
 * Estimate borrowing costs
 */
app.post('/api/borrow/estimate-costs', async (req, res) => {
  try {
    const { asset, amount, duration, userAddress } = req.body;
    
    if (!asset || !amount || !duration || !userAddress) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const assetConfig = borrowableAssets[asset];
    if (!assetConfig) {
      return res.status(400).json({ error: `Unsupported asset: ${asset}` });
    }

    const creditProfile = userCreditProfiles.get(userAddress) || await generateAICreditProfile(userAddress);
    
    const interestRate = calculateDynamicInterestRate(
      assetConfig.baseInterestRate,
      creditProfile.creditScore,
      assetConfig.availableLiquidity / 10000000,
      amount,
      creditProfile.currentBorrowed
    );

    const schedule = calculateRepaymentSchedule(amount, interestRate, duration);
    const monthlyPayment = schedule[0]?.payment || 0;
    const totalInterest = schedule.reduce((sum, payment) => sum + payment.interest, 0);
    const totalRepayment = schedule.reduce((sum, payment) => sum + payment.payment, 0);
    
    res.json({
      interestRate,
      monthlyPayment,
      totalInterest,
      totalRepayment,
      originationFee: amount * 0.01, // 1% origination fee
      earlyRepaymentPenalty: amount * 0.005 // 0.5% early repayment penalty
    });
  } catch (error) {
    console.error('Cost estimation error:', error);
    res.status(500).json({ error: 'Failed to estimate borrow costs' });
  }
});

/**
 * Get risk assessment for borrow request
 */
app.post('/api/borrow/risk-assessment', async (req, res) => {
  try {
    const { userAddress, asset, amount, duration } = req.body;
    
    if (!userAddress || !asset || !amount || !duration) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const creditProfile = userCreditProfiles.get(userAddress) || await generateAICreditProfile(userAddress);
    const assetConfig = borrowableAssets[asset];
    
    if (!assetConfig) {
      return res.status(400).json({ error: `Unsupported asset: ${asset}` });
    }

    // Calculate risk factors
    const riskFactors = [];
    const recommendations = [];
    let riskScore = creditProfile.creditScore;
    let riskLevel = 'low';

    // Credit utilization risk
    const utilizationRatio = (creditProfile.currentBorrowed + amount) / creditProfile.creditLimit;
    if (utilizationRatio > 0.8) {
      riskFactors.push('High credit utilization');
      recommendations.push('Consider reducing loan amount');
      riskScore -= 10;
    } else if (utilizationRatio > 0.6) {
      riskFactors.push('Moderate credit utilization');
      recommendations.push('Monitor overall debt levels');
      riskScore -= 5;
    }

    // Loan duration risk
    if (duration > 24) {
      riskFactors.push('Long-term loan commitment');
      recommendations.push('Consider shorter loan term');
      riskScore -= 5;
    }

    // Asset-specific risk
    if (assetConfig.riskLevel === 'medium') {
      riskFactors.push('Medium-risk asset');
      recommendations.push('Monitor asset price volatility');
      riskScore -= 3;
    } else if (assetConfig.riskLevel === 'high') {
      riskFactors.push('High-risk asset');
      recommendations.push('Consider stablecoin alternatives');
      riskScore -= 8;
    }

    // Determine risk level
    if (riskScore < 60) riskLevel = 'high';
    else if (riskScore < 75) riskLevel = 'medium';
    else riskLevel = 'low';

    // Calculate max recommended amount
    const maxRecommendedAmount = Math.min(
      creditProfile.availableCredit * 0.8,
      assetConfig.maxBorrowAmount,
      creditProfile.aiMaxBorrow
    );

    res.json({
      riskScore: Math.max(0, riskScore),
      riskLevel,
      riskFactors,
      recommendations,
      maxRecommendedAmount
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Failed to get risk assessment' });
  }
});

// Helper Functions

async function generateAICreditProfile(userAddress: string) {
  try {
    // This would call your AI service for credit scoring
    const aiEndpoint = process.env.AI_CREDIT_ENDPOINT || 'https://ai.aegis.io/credit-score';
    
    const response = await axios.post(aiEndpoint, {
      userAddress,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000
    });
    
    return response.data;
  } catch (error) {
    console.error('AI credit scoring error:', error.message);
    
    // Return mock profile as fallback
    return {
      creditScore: 75 + Math.floor(Math.random() * 30), // 75-105
      creditLimit: 5000 + Math.floor(Math.random() * 10000), // 5K-15K
      aiMaxBorrow: 4000 + Math.floor(Math.random() * 8000), // 4K-12K
      currentBorrowed: Math.floor(Math.random() * 3000), // 0-3K
      riskTier: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
      lastUpdated: new Date(),
      riskFactors: ['Mock credit profile', 'AI service unavailable']
    };
  }
}

function calculateDynamicInterestRate(
  baseRate: number,
  riskScore: number,
  liquidityRatio: number,
  loanAmount: number,
  currentBorrowed: number
): number {
  let rate = baseRate;
  
  // Risk-based adjustment
  if (riskScore < 50) rate += 0.02; // Poor credit
  else if (riskScore < 70) rate += 0.01; // Fair credit
  else if (riskScore < 85) rate += 0.005; // Good credit
  // Excellent credit (85+) gets base rate
  
  // Liquidity adjustment
  if (liquidityRatio < 0.2) rate += 0.015; // Low liquidity
  else if (liquidityRatio < 0.5) rate += 0.008; // Medium liquidity
  
  // Loan size adjustment
  if (loanAmount > 5000) rate += 0.005; // Large loans
  if (currentBorrowed > 5000) rate += 0.003; // High existing debt
  
  return Math.min(rate, 0.15); // Cap at 15%
}

function calculateRepaymentSchedule(
  principal: number,
  yearlyRate: number,
  months: number
): any[] {
  const monthlyRate = yearlyRate / 12;
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
  
  const schedule = [];
  let remainingBalance = principal;
  
  for (let month = 1; month <= months; month++) {
    const interest = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    remainingBalance -= principalPayment;
    
    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest,
      remainingBalance: Math.max(0, remainingBalance)
    });
  }
  
  return schedule;
}

async function triggerAICreditScoring(userAddress: string, activityData: any) {
  try {
    const aiEndpoint = process.env.AI_CREDIT_ENDPOINT || 'https://ai.aegis.io/credit-score';
    
    const response = await axios.post(aiEndpoint, {
      userAddress,
      activityData,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000
    });
    
    console.log(`AI Credit scoring updated for ${userAddress}:`, response.data);
  } catch (error) {
    console.error('Error in AI Credit Scoring:', error.message);
    // Don't throw - this is non-critical
  }
}

function getEstimatedConfirmationTime(chain: string): number {
  const times = {
    'ethereum': 12, // 12 seconds
    'solana': 1, // 1 second
    'polygon': 2, // 2 seconds
    'avalanche': 3, // 3 seconds
    'arbitrum': 1, // 1 second
    'zetachain': 2 // 2 seconds
  };
  return times[chain.toLowerCase()] || 30;
}

// Event listeners for borrow events
function listenToBorrowEvents() {
  Object.entries(lendingContracts).forEach(([chainName, { address, abi }]) => {
    try {
      const contract = new ethers.Contract(address, abi, provider);

      contract.on('LoanCreated', (borrower, asset, amount, duration, loanId) => {
        console.log(`LoanCreated event on ${chainName}: Borrower ${borrower} borrowed ${ethers.formatUnits(amount, 18)} ${asset} for ${duration} months`);
        
        // Update borrow history
        const borrowRecord = {
          id: loanId,
          userAddress: borrower,
          asset,
          amount: parseFloat(ethers.formatUnits(amount, 18)),
          duration: duration.toNumber(),
          sourceChain: chainName,
          targetChain: chainName,
          txHash: loanId,
          status: 'confirmed',
          timestamp: new Date().toISOString()
        };
        
        if (!borrowHistory.has(borrower)) {
          borrowHistory.set(borrower, []);
        }
        borrowHistory.get(borrower).push(borrowRecord);
      });

      contract.on('CrossChainBorrow', (borrower, sourceChain, targetChain, asset, amount, duration, loanId) => {
        console.log(`CrossChainBorrow event: Borrower ${borrower} borrowed ${ethers.formatUnits(amount, 18)} ${asset} from ${sourceChain} to ${targetChain} for ${duration} months`);
      });

      contract.on('BorrowRepaid', (borrower, loanId, amount) => {
        console.log(`BorrowRepaid event: Borrower ${borrower} repaid ${ethers.formatUnits(amount, 18)} for loan ${loanId}`);
      });

      contract.on('LiquidationWarning', (borrower, loanId, riskLevel) => {
        console.log(`LiquidationWarning event: LoanId ${loanId} Borrower ${borrower} Risk ${riskLevel}`);
        // TODO: Push notifications in real time
      });
      
    } catch (error) {
      console.error(`Error setting up event listeners for ${chainName}:`, error);
    }
  });
}

// Initialize event listeners
listenToBorrowEvents();

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
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
    version: '1.0.0',
    service: 'borrow-api'
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Aegis Borrow API listening on port ${PORT}`);
  console.log(`📊 Credit profiles: http://localhost:${PORT}/api/borrow/credit-profile/:address`);
  console.log(`💰 Borrow endpoint: http://localhost:${PORT}/api/borrow`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});

export default app;
