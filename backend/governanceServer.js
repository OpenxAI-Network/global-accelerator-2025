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

// Mock governance data storage (replace with database in production)
const governanceData = {
  proposals: new Map(),
  userProfiles: new Map(),
  securitySettings: new Map(),
  auditLogs: new Map(),
  votingHistory: new Map()
};

// Initialize mock governance data
const initializeMockData = () => {
  // Mock governance proposals
  const mockProposals = [
    {
      id: 'p1',
      title: 'Adjust Baseline Interest Rate to 4.5%',
      description: 'Proposal to increase baseline interest rate from 4% to 4.5% to maintain protocol sustainability and attract more liquidity providers. This adjustment is based on current market conditions and risk assessment.',
      category: 'lending',
      status: 'active',
      votesFor: 1250,
      votesAgainst: 320,
      totalVotes: 1570,
      quorum: 2000,
      endDate: '2025-09-15T23:59:59Z',
      proposer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      votingPower: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p2',
      title: 'Lower Liquidation Threshold to 75%',
      description: 'Reduce liquidation threshold from 80% to 75% for better risk mitigation and to protect the protocol from potential bad debt accumulation during market volatility.',
      category: 'security',
      status: 'active',
      votesFor: 890,
      votesAgainst: 210,
      totalVotes: 1100,
      quorum: 2000,
      endDate: '2025-09-20T23:59:59Z',
      proposer: '0x8ba1f109551bD432803012645Hac136c772c3c7c',
      votingPower: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'p3',
      title: 'Add Support for New Chain: Arbitrum',
      description: 'Proposal to expand protocol support to Arbitrum network, enabling users to access lending services on one of the fastest-growing L2 solutions with lower gas fees.',
      category: 'technical',
      status: 'active',
      votesFor: 2100,
      votesAgainst: 150,
      totalVotes: 2250,
      quorum: 2000,
      endDate: '2025-09-10T23:59:59Z',
      proposer: '0x1234567890123456789012345678901234567890',
      votingPower: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  mockProposals.forEach(proposal => {
    governanceData.proposals.set(proposal.id, proposal);
  });

  // Mock user profiles
  const mockUserProfiles = [
    {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      username: 'AegisUser',
      email: 'user@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AegisUser',
      connectedWallets: [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 (MetaMask)',
        '0x8ba1f109551bD432803012645Hac136c772c3c7c (WalletConnect)'
      ],
      notificationsEnabled: true,
      emailNotifications: true,
      pushNotifications: false,
      securityLevel: 'enhanced',
      twoFactorEnabled: true,
      lastLogin: new Date().toISOString(),
      memberSince: '2024-01-15T00:00:00Z',
      governancePower: 1000,
      votingHistory: [
        { proposalId: 'p1', vote: 'for', timestamp: '2025-08-20T10:30:00Z' },
        { proposalId: 'p2', vote: 'against', timestamp: '2025-08-19T15:45:00Z' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  mockUserProfiles.forEach(profile => {
    governanceData.userProfiles.set(profile.address, profile);
  });

  // Mock security settings
  const mockSecuritySettings = [
    {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      twoFactorEnabled: true,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      requireEmailConfirmation: true,
      allowMultipleDevices: false,
      lastPasswordChange: '2025-07-15T00:00:00Z',
      passwordStrength: 'strong',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  mockSecuritySettings.forEach(settings => {
    governanceData.securitySettings.set(settings.address, settings);
  });

  // Mock audit logs
  const mockAuditLogs = [
    {
      id: 'log1',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      timestamp: '2025-08-21T16:30:00Z',
      event: 'Login successful',
      category: 'security',
      severity: 'low',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'User logged in from trusted device',
      createdAt: new Date().toISOString()
    },
    {
      id: 'log2',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      timestamp: '2025-08-21T15:45:00Z',
      event: 'Vote cast on proposal P1',
      category: 'governance',
      severity: 'low',
      details: 'Voted FOR on proposal: Adjust Baseline Interest Rate to 4.5%',
      createdAt: new Date().toISOString()
    },
    {
      id: 'log3',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      timestamp: '2025-08-21T14:20:00Z',
      event: 'Two-factor authentication enabled',
      category: 'security',
      severity: 'medium',
      details: '2FA enabled for enhanced account security',
      createdAt: new Date().toISOString()
    }
  ];

  mockAuditLogs.forEach(log => {
    governanceData.auditLogs.set(log.id, log);
  });
};

// Initialize mock data
initializeMockData();

// Helper functions
function generateProposalId() {
  return `p${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateAuditLogId() {
  return `log${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function logAuditEvent(address, event, category, severity, details, ipAddress, userAgent) {
  const log = {
    id: generateAuditLogId(),
    address,
    timestamp: new Date().toISOString(),
    event,
    category,
    severity,
    ipAddress,
    userAgent,
    details,
    createdAt: new Date().toISOString()
  };
  
  governanceData.auditLogs.set(log.id, log);
  return log;
}

// API Endpoints

// Get all governance proposals
app.get('/api/governance/proposals', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    let proposals = Array.from(governanceData.proposals.values());
    
    // Filter by status
    if (status && status !== 'all') {
      proposals = proposals.filter(p => p.status === status);
    }
    
    // Filter by category
    if (category && category !== 'all') {
      proposals = proposals.filter(p => p.category === category);
    }
    
    // Sort by creation date (newest first)
    proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProposals = proposals.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProposals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: proposals.length,
        totalPages: Math.ceil(proposals.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch governance proposals'
    });
  }
});

// Get specific proposal
app.get('/api/governance/proposals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = governanceData.proposals.get(id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }
    
    res.json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal'
    });
  }
});

// Create new proposal
app.post('/api/governance/proposals', async (req, res) => {
  try {
    const { title, description, category, proposer } = req.body;
    
    if (!title || !description || !category || !proposer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const proposal = {
      id: generateProposalId(),
      title,
      description,
      category,
      status: 'active',
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      quorum: 2000,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      proposer,
      votingPower: 1000, // Default voting power
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    governanceData.proposals.set(proposal.id, proposal);
    
    // Log audit event
    logAuditEvent(proposer, 'Proposal created', 'governance', 'low', `Created proposal: ${title}`);
    
    res.json({
      success: true,
      data: proposal,
      message: 'Proposal created successfully'
    });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create proposal'
    });
  }
});

// Vote on proposal
app.post('/api/governance/proposals/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { voter, vote, votingPower } = req.body;
    
    if (!voter || !vote || !votingPower) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (!['for', 'against'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote value'
      });
    }
    
    const proposal = governanceData.proposals.get(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }
    
    if (proposal.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Proposal is not active for voting'
      });
    }
    
    // Check if user has already voted
    const userVotingHistory = governanceData.votingHistory.get(voter) || [];
    const hasVoted = userVotingHistory.some(v => v.proposalId === id);
    
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'User has already voted on this proposal'
      });
    }
    
    // Update proposal votes
    if (vote === 'for') {
      proposal.votesFor += votingPower;
    } else {
      proposal.votesAgainst += votingPower;
    }
    proposal.totalVotes = proposal.votesFor + proposal.votesAgainst;
    proposal.updatedAt = new Date().toISOString();
    
    // Record voting history
    const voteRecord = {
      proposalId: id,
      voter,
      vote,
      votingPower,
      timestamp: new Date().toISOString()
    };
    
    userVotingHistory.push(voteRecord);
    governanceData.votingHistory.set(voter, userVotingHistory);
    
    // Check if quorum is reached
    if (proposal.totalVotes >= proposal.quorum) {
      if (proposal.votesFor > proposal.votesAgainst) {
        proposal.status = 'passed';
      } else {
        proposal.status = 'rejected';
      }
      proposal.updatedAt = new Date().toISOString();
    }
    
    // Log audit event
    logAuditEvent(voter, 'Vote cast', 'governance', 'low', `Voted ${vote.toUpperCase()} on proposal: ${proposal.title}`);
    
    res.json({
      success: true,
      data: proposal,
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote'
    });
  }
});

// Get user profile
app.get('/api/governance/profile/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const profile = governanceData.userProfiles.get(address);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
app.put('/api/governance/profile/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const updateData = req.body;
    
    const profile = governanceData.userProfiles.get(address);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    
    // Update profile
    const updatedProfile = {
      ...profile,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    governanceData.userProfiles.set(address, updatedProfile);
    
    // Log audit event
    logAuditEvent(address, 'Profile updated', 'settings', 'low', 'User profile information updated');
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    });
  }
});

// Get security settings
app.get('/api/governance/security/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const settings = governanceData.securitySettings.get(address);
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Security settings not found'
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security settings'
    });
  }
});

// Update security settings
app.put('/api/governance/security/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const updateData = req.body;
    
    const settings = governanceData.securitySettings.get(address);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Security settings not found'
      });
    }
    
    // Update settings
    const updatedSettings = {
      ...settings,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    governanceData.securitySettings.set(address, updatedSettings);
    
    // Log audit event
    logAuditEvent(address, 'Security settings updated', 'security', 'medium', 'Security configuration modified');
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Security settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security settings'
    });
  }
});

// Get audit logs
app.get('/api/governance/audit-logs/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { category, severity, page = 1, limit = 20 } = req.query;
    
    let logs = Array.from(governanceData.auditLogs.values())
      .filter(log => log.address === address);
    
    // Filter by category
    if (category && category !== 'all') {
      logs = logs.filter(log => log.category === category);
    }
    
    // Filter by severity
    if (severity && severity !== 'all') {
      logs = logs.filter(log => log.severity === severity);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length,
        totalPages: Math.ceil(logs.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// Get voting history
app.get('/api/governance/voting-history/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const votingHistory = governanceData.votingHistory.get(address) || [];
    
    // Sort by timestamp (newest first)
    votingHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = votingHistory.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: votingHistory.length,
        totalPages: Math.ceil(votingHistory.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching voting history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voting history'
    });
  }
});

// Get governance statistics
app.get('/api/governance/stats', async (req, res) => {
  try {
    const proposals = Array.from(governanceData.proposals.values());
    const userProfiles = Array.from(governanceData.userProfiles.values());
    const auditLogs = Array.from(governanceData.auditLogs.values());
    
    const stats = {
      totalProposals: proposals.length,
      activeProposals: proposals.filter(p => p.status === 'active').length,
      passedProposals: proposals.filter(p => p.status === 'passed').length,
      rejectedProposals: proposals.filter(p => p.status === 'rejected').length,
      totalUsers: userProfiles.length,
      totalVotes: proposals.reduce((sum, p) => sum + p.totalVotes, 0),
      totalAuditLogs: auditLogs.length,
      averageGovernancePower: userProfiles.reduce((sum, p) => sum + p.governancePower, 0) / userProfiles.length,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching governance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch governance statistics'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      governance: governanceData.proposals.size > 0,
      userProfiles: governanceData.userProfiles.size > 0,
      securitySettings: governanceData.securitySettings.size > 0,
      auditLogs: governanceData.auditLogs.size > 0,
      votingHistory: governanceData.votingHistory.size > 0
    }
  });
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`🚀 Governance & Settings Server running on port ${PORT}`);
  console.log(`🗳️  Managing ${governanceData.proposals.size} governance proposals`);
  console.log(`👥 Supporting ${governanceData.userProfiles.size} user profiles`);
  console.log(`🔗 ZetaChain RPC: ${ZETACHAIN_RPC_URL}`);
  console.log(`🛡️  Security and audit logging enabled`);
});

export default app;
