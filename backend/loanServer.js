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

// Mock lending contracts for different chains (replace with actual deployed contracts)
const lendingContracts = {
  ethereum: {
    address: '0x1234567890123456789012345678901234567890',
    abi: [
      'function depositCollateral(address asset, uint256 amount, address user) external',
      'function borrow(uint256 amount, uint256 duration, address user) external',
      'function repay(uint256 amount, address user) external',
      'function addCollateral(address asset, uint256 amount, uint256 loanId) external',

    ]
  },
  bitcoin: {
    address: '0x2345678901234567890123456789012345678901',
    abi: [
      'function depositCollateral(address asset, uint256 amount, address user) external',
      'function borrow(uint256 amount, uint256 duration, address user) external',
      'function repay(uint256 amount, address user) external',
      'function addCollateral(address asset, uint256 amount, uint256 loanId) external'
    ]
  },
  solana: {
    address: '0x3456789012345678901234567890123456789012',
    abi: [
      'function depositCollateral(address asset, uint256 amount, address user) external',
      'function borrow(uint256 amount, uint256 duration, address user) external',
      'function repay(uint256 amount, address user) external',
      'function addCollateral(address asset, uint256 amount, uint256 loanId) external'
    ]
  },
  avalanche: {
    address: '0x4567890123456789012345678901234567890123',
    abi: [
      'function depositCollateral(address asset, uint256 amount, address user) external',
      'function borrow(uint256 amount, uint256 duration, address user) external',
      'function repay(uint256 amount, address user) external',
      'function addCollateral(address asset, uint256 amount, uint256 loanId) external'
    ]
  }
};

// Mock loan data storage (replace with database in production)
const loans = new Map();
const notifications = new Map();
const userLoans = new Map();

// Initialize mock data
const initializeMockData = () => {
  const mockLoans = [
    {
      id: 'LOAN-001',
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      principal: ethers.parseUnits('5000', 18),
      interestRate: 850, // 8.5% in basis points
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      collateralAsset: 'ETH',
      collateralChain: 'ethereum',
      collateralValue: ethers.parseUnits('8500', 18),
      liquidationRisk: 35,
      healthStatus: 'healthy',
      interestPaidHistory: [],
      totalInterestPaid: 0,
      remainingBalance: ethers.parseUnits('5000', 18),
      loanToValue: 5880, // 58.8% in basis points
      marginCallThreshold: 7500, // 75% in basis points
      liquidationThreshold: 8500, // 85% in basis points
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'LOAN-002',
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      principal: ethers.parseUnits('12000', 18),
      interestRate: 1220, // 12.2% in basis points
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      collateralAsset: 'BTC',
      collateralChain: 'bitcoin',
      collateralValue: ethers.parseUnits('18000', 18),
      liquidationRisk: 68,
      healthStatus: 'warning',
      interestPaidHistory: [],
      totalInterestPaid: 0,
      remainingBalance: ethers.parseUnits('12000', 18),
      loanToValue: 6670, // 66.7% in basis points
      marginCallThreshold: 7500,
      liquidationThreshold: 8500,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'LOAN-003',
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      principal: ethers.parseUnits('8000', 18),
      interestRate: 1580, // 15.8% in basis points
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      collateralAsset: 'SOL',
      collateralChain: 'solana',
      collateralValue: ethers.parseUnits('10000', 18),
      liquidationRisk: 82,
      healthStatus: 'critical',
      interestPaidHistory: [],
      totalInterestPaid: 0,
      remainingBalance: ethers.parseUnits('8000', 18),
      loanToValue: 8000, // 80.0% in basis points
      marginCallThreshold: 7500,
      liquidationThreshold: 8500,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  ];

  mockLoans.forEach(loan => {
    loans.set(loan.id, loan);
    if (!userLoans.has(loan.userAddress)) {
      userLoans.set(loan.userAddress, []);
    }
    userLoans.get(loan.userAddress).push(loan.id);
  });
};

// Initialize mock data
initializeMockData();

// API Endpoints

// Get all loans for a user
app.get('/api/loans/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const userLoanIds = userLoans.get(userAddress) || [];
    const userLoansData = userLoanIds.map(id => loans.get(id)).filter(Boolean);

    // Convert BigInt values to strings for JSON serialization
    const serializedLoans = userLoansData.map(loan => ({
      ...loan,
      principal: ethers.formatUnits(loan.principal, 18),
      collateralValue: ethers.formatUnits(loan.collateralValue, 18),
      remainingBalance: ethers.formatUnits(loan.remainingBalance, 18),
      interestRate: loan.interestRate / 100, // Convert from basis points to percentage
      loanToValue: loan.loanToValue / 100,
      marginCallThreshold: loan.marginCallThreshold / 100,
      liquidationThreshold: loan.liquidationThreshold / 100
    }));

    res.json({
      success: true,
      loans: serializedLoans
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loans'
    });
  }
});

// Get specific loan details
app.get('/api/loans/:userAddress/:loanId', async (req, res) => {
  try {
    const { userAddress, loanId } = req.params;
    const loan = loans.get(loanId);

    if (!loan || loan.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Serialize BigInt values
    const serializedLoan = {
      ...loan,
      principal: ethers.formatUnits(loan.principal, 18),
      collateralValue: ethers.formatUnits(loan.collateralValue, 18),
      remainingBalance: ethers.formatUnits(loan.remainingBalance, 18),
      interestRate: loan.interestRate / 100,
      loanToValue: loan.loanToValue / 100,
      marginCallThreshold: loan.marginCallThreshold / 100,
      liquidationThreshold: loan.liquidationThreshold / 100
    };

    res.json({
      success: true,
      loan: serializedLoan
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan details'
    });
  }
});

// Add collateral to a loan
app.post('/api/loans/:loanId/collateral', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { userAddress, asset, amount, chain } = req.body;

    if (!userAddress || !asset || !amount || !chain) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const loan = loans.get(loanId);
    if (!loan || loan.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    const contractInfo = lendingContracts[chain.toLowerCase()];
    if (!contractInfo) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported chain'
      });
    }

    // Convert amount to wei
    const amountInWei = ethers.parseUnits(amount.toString(), 18);

    try {
      // Call smart contract to add collateral
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
      const tx = await contract.addCollateral(asset, amountInWei, loanId);
      const receipt = await tx.wait();

      // Update loan data
      loan.collateralValue = loan.collateralValue + amountInWei;
      loan.lastUpdated = new Date().toISOString();

      // Calculate new LTV and risk
      const newLTV = (loan.remainingBalance * 10000n) / loan.collateralValue;
      loan.loanToValue = Number(newLTV);
      
      // Update liquidation risk based on new LTV
      if (loan.loanToValue > 80) {
        loan.liquidationRisk = 85;
        loan.healthStatus = 'critical';
      } else if (loan.loanToValue > 70) {
        loan.liquidationRisk = 70;
        loan.healthStatus = 'warning';
      } else {
        loan.liquidationRisk = Math.max(20, loan.loanToValue * 0.8);
        loan.healthStatus = 'healthy';
      }

      // Create notification
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'collateral_update',
        message: `Added ${amount} ${asset} collateral to Loan ${loanId}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        severity: 'low',
        userAddress,
        loanId
      };

      if (!notifications.has(userAddress)) {
        notifications.set(userAddress, []);
      }
      notifications.get(userAddress).push(notification);

      // Trigger AI credit scoring update
      await triggerAICreditScoring(userAddress, {
        action: 'add_collateral',
        loanId,
        amount: parseFloat(amount),
        asset,
        chain
      });

      res.json({
        success: true,
        txHash: tx.hash,
        updatedLoan: {
          ...loan,
          principal: ethers.formatUnits(loan.principal, 18),
          collateralValue: ethers.formatUnits(loan.collateralValue, 18),
          remainingBalance: ethers.formatUnits(loan.remainingBalance, 18),
          interestRate: loan.interestRate / 100,
          loanToValue: loan.loanToValue / 100,
          liquidationRisk: loan.liquidationRisk
        }
      });

    } catch (contractError) {
      console.error('Contract error:', contractError);
      res.status(500).json({
        success: false,
        message: 'Failed to add collateral on blockchain'
      });
    }

  } catch (error) {
    console.error('Error adding collateral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add collateral'
    });
  }
});

// Repay loan
app.post('/api/loans/:loanId/repay', async (req, res) => {
  try {
    const { loanId } = req.params;
    const { userAddress, amount, chain } = req.body;

    if (!userAddress || !amount || !chain) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const loan = loans.get(loanId);
    if (!loan || loan.userAddress !== userAddress) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    const contractInfo = lendingContracts[chain.toLowerCase()];
    if (!contractInfo) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported chain'
      });
    }

    const amountInWei = ethers.parseUnits(amount.toString(), 18);
    const remainingBalance = loan.remainingBalance;

    if (amountInWei > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: 'Repayment amount exceeds remaining balance'
      });
    }

    try {
      // Call smart contract to repay
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
      const tx = await contract.repay(amountInWei, userAddress);
      const receipt = await tx.wait();

      // Update loan data
      loan.remainingBalance = remainingBalance - amountInWei;
      loan.lastUpdated = new Date().toISOString();

      // Add to interest payment history
      loan.interestPaidHistory.push({
        date: new Date().toISOString(),
        amount: parseFloat(amount),
        txHash: tx.hash
      });

      // Update total interest paid
      loan.totalInterestPaid += parseFloat(amount);

      // Recalculate LTV and risk
      const newLTV = (loan.remainingBalance * 10000n) / loan.collateralValue;
      loan.loanToValue = Number(newLTV);
      
      if (loan.loanToValue > 80) {
        loan.liquidationRisk = 85;
        loan.healthStatus = 'critical';
      } else if (loan.loanToValue > 70) {
        loan.liquidationRisk = 70;
        loan.healthStatus = 'warning';
      } else {
        loan.liquidationRisk = Math.max(20, loan.loanToValue * 0.8);
        loan.healthStatus = 'healthy';
      }

      // Create notification
      const notification = {
        id: `notif-${Date.now()}`,
        type: 'payment_due',
        message: `Repaid ${amount} USDC on Loan ${loanId}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        severity: 'low',
        userAddress,
        loanId
      };

      if (!notifications.has(userAddress)) {
        notifications.set(userAddress, []);
      }
      notifications.get(userAddress).push(notification);

      // Trigger AI credit scoring update
      await triggerAICreditScoring(userAddress, {
        action: 'repay',
        loanId,
        amount: parseFloat(amount),
        chain
      });

      res.json({
        success: true,
        txHash: tx.hash,
        updatedLoan: {
          ...loan,
          principal: ethers.formatUnits(loan.principal, 18),
          collateralValue: ethers.formatUnits(loan.collateralValue, 18),
          remainingBalance: ethers.formatUnits(loan.remainingBalance, 18),
          interestRate: loan.interestRate / 100,
          loanToValue: loan.loanToValue / 100,
          liquidationRisk: loan.liquidationRisk
        }
      });

    } catch (contractError) {
      console.error('Contract error:', contractError);
      res.status(500).json({
        success: false,
        message: 'Failed to process repayment on blockchain'
      });
    }

  } catch (error) {
    console.error('Error processing repayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process repayment'
    });
  }
});

// Get notifications for a user
app.get('/api/notifications/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const userNotifications = notifications.get(userAddress) || [];

    res.json({
      success: true,
      notifications: userNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
app.put('/api/notifications/:userAddress/:notificationId', async (req, res) => {
  try {
    const { userAddress, notificationId } = req.params;
    const userNotifications = notifications.get(userAddress) || [];
    
    const notificationIndex = userNotifications.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    userNotifications[notificationIndex].isRead = true;
    notifications.set(userAddress, userNotifications);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification'
    });
  }
});

// Get loan analytics for a user
app.get('/api/analytics/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const userLoanIds = userLoans.get(userAddress) || [];
    const userLoansData = userLoanIds.map(id => loans.get(id)).filter(Boolean);

    if (userLoansData.length === 0) {
      return res.json({
        success: true,
        analytics: {
          totalLoans: 0,
          totalPrincipal: '0',
          averageInterestRate: 0,
          totalCollateralValue: '0',
          riskDistribution: {},
          portfolioHealth: 'healthy'
        }
      });
    }

    // Calculate analytics
    const totalPrincipal = userLoansData.reduce((sum, loan) => sum + loan.principal, 0n);
    const totalCollateralValue = userLoansData.reduce((sum, loan) => sum + loan.collateralValue, 0n);
    const averageInterestRate = userLoansData.reduce((sum, loan) => sum + loan.interestRate, 0) / userLoansData.length;

    // Risk distribution
    const riskDistribution = {
      healthy: userLoansData.filter(loan => loan.healthStatus === 'healthy').length,
      warning: userLoansData.filter(loan => loan.healthStatus === 'warning').length,
      critical: userLoansData.filter(loan => loan.healthStatus === 'critical').length
    };

    // Portfolio health
    let portfolioHealth = 'healthy';
    if (riskDistribution.critical > 0) {
      portfolioHealth = 'critical';
    } else if (riskDistribution.warning > 0) {
      portfolioHealth = 'warning';
    }

    const analytics = {
      totalLoans: userLoansData.length,
      totalPrincipal: ethers.formatUnits(totalPrincipal, 18),
      averageInterestRate: averageInterestRate / 100, // Convert from basis points
      totalCollateralValue: ethers.formatUnits(totalCollateralValue, 18),
      riskDistribution,
      portfolioHealth
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// AI Credit Scoring Integration
async function triggerAICreditScoring(userAddress, action) {
  try {
    // In production, this would call your AI service (e.g., Google Cloud AI)
    const response = await axios.post('https://your-ai-service.com/credit-scoring', {
      userAddress,
      action,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`AI credit scoring updated for ${userAddress}:`, response.data);
  } catch (error) {
    console.error('AI credit scoring error:', error);
    // Don't fail the main operation if AI scoring fails
  }
}

// Event Listeners for Smart Contract Events (commented out for now - requires proper ABI)
function setupEventListeners() {
  console.log('Event listeners disabled - requires proper contract ABI with event definitions');
  // TODO: Implement event listeners when proper contract ABIs are available
  /*
  Object.entries(lendingContracts).forEach(([chain, contractInfo]) => {
    try {
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);

      // Listen for loan creation events
      contract.on('LoanCreated', (borrower, amount, loanId, timestamp) => {
        console.log(`LoanCreated on ${chain}: Borrower=${borrower}, Amount=${ethers.formatUnits(amount, 18)}, LoanId=${loanId}`);
        // Update your database/state here
      });

      // Listen for collateral addition events
      contract.on('CollateralAdded', (user, loanId, amount, timestamp) => {
        console.log(`CollateralAdded on ${chain}: User=${user}, LoanId=${loanId}, Amount=${ethers.formatUnits(amount, 18)}`);
        // Update your database/state here
      });

      // Listen for loan repayment events
      contract.on('LoanRepaid', (user, loanId, amount, timestamp) => {
        console.log(`LoanRepaid on ${chain}: User=${user}, LoanId=${loanId}, Amount=${ethers.formatUnits(amount, 18)}`);
        // Update your database/state here
      });

      // Listen for liquidation warnings
      contract.on('LiquidationWarning', (user, loanId, riskLevel, timestamp) => {
        console.log(`LiquidationWarning on ${chain}: User=${user}, LoanId=${loanId}, RiskLevel=${riskLevel}`);
        
        // Create high-priority notification
        const notification = {
          id: `notif-${Date.now()}`,
          type: 'liquidation_warning',
          message: `🚨 CRITICAL: Loan ${loanId} liquidation risk at ${riskLevel}%`,
          timestamp: new Date().toISOString(),
          isRead: false,
          severity: 'critical',
          userAddress: user,
          loanId: loanId.toString()
        };

        if (!notifications.has(user)) {
          notifications.set(user, []);
        }
        notifications.get(user).push(notification);
      });

      // Listen for margin calls
      contract.on('MarginCall', (user, loanId, ltv, timestamp) => {
        console.log(`MarginCall on ${chain}: User=${user}, LoanId=${loanId}, LTV=${ethers.formatUnits(ltv, 2)}%`);
        
        // Create warning notification
        const notification = {
          id: `notif-${Date.now()}`,
          type: 'margin_call',
          message: `⚠️ WARNING: Loan ${loanId} margin call - LTV at ${ethers.formatUnits(ltv, 2)}%`,
          timestamp: new Date().toISOString(),
          isRead: false,
          severity: 'high',
          userAddress: user,
          loanId: loanId.toString()
        };

        if (!notifications.has(user)) {
          notifications.set(user, []);
        }
        notifications.get(user).push(notification);
      });

    } catch (error) {
      console.error(`Error setting up event listeners for ${chain}:`, error);
    }
  });
  */
}

// Setup event listeners
setupEventListeners();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    chains: Object.keys(lendingContracts)
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Loan Management Server running on port ${PORT}`);
  console.log(`📊 Monitoring ${Object.keys(lendingContracts).length} chains`);
  console.log(`🔗 ZetaChain RPC: ${ZETACHAIN_RPC_URL}`);
});

export default app;
