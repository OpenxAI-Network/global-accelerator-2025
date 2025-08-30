import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Vote, 
  Settings, 
  Shield, 
  User, 
  Bell, 
  FileText, 
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Key,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  category: 'lending' | 'security' | 'governance' | 'technical';
  status: 'active' | 'passed' | 'rejected' | 'expired';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  endDate: string;
  proposer: string;
  votingPower: number;
  userVote?: 'for' | 'against' | null;
}

interface UserProfile {
  address: string;
  username?: string;
  email?: string;
  avatar?: string;
  connectedWallets: string[];
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  twoFactorEnabled: boolean;
  lastLogin: string;
  memberSince: string;
  governancePower: number;
  votingHistory: {
    proposalId: string;
    vote: 'for' | 'against';
    timestamp: string;
  }[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  category: 'security' | 'governance' | 'transaction' | 'settings';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  details: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireEmailConfirmation: boolean;
  allowMultipleDevices: boolean;
  lastPasswordChange: string;
  passwordStrength: 'weak' | 'medium' | 'strong';
}

const Governance = () => {
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'governance' | 'profile' | 'security' | 'support'>('governance');
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: 'lending' as const
  });

  useEffect(() => {
    if (isConnected) {
      loadGovernanceData();
    }
  }, [isConnected]);

  const loadGovernanceData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock governance proposals
      const mockProposals: GovernanceProposal[] = [
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
          votingPower: 1000
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
          votingPower: 1000
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
          votingPower: 1000
        }
      ];
      setProposals(mockProposals);

      // Mock user profile
      const mockUserProfile: UserProfile = {
        address: address || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
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
        ]
      };
      setUserProfile(mockUserProfile);

      // Mock security settings
      const mockSecuritySettings: SecuritySettings = {
        twoFactorEnabled: true,
        sessionTimeout: 3600,
        maxLoginAttempts: 5,
        requireEmailConfirmation: true,
        allowMultipleDevices: false,
        lastPasswordChange: '2025-07-15T00:00:00Z',
        passwordStrength: 'strong'
      };
      setSecuritySettings(mockSecuritySettings);

      // Mock audit logs
      const mockAuditLogs: AuditLog[] = [
        {
          id: 'log1',
          timestamp: '2025-08-21T16:30:00Z',
          event: 'Login successful',
          category: 'security',
          severity: 'low',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          details: 'User logged in from trusted device'
        },
        {
          id: 'log2',
          timestamp: '2025-08-21T15:45:00Z',
          event: 'Vote cast on proposal P1',
          category: 'governance',
          severity: 'low',
          details: 'Voted FOR on proposal: Adjust Baseline Interest Rate to 4.5%'
        },
        {
          id: 'log3',
          timestamp: '2025-08-21T14:20:00Z',
          event: 'Two-factor authentication enabled',
          category: 'security',
          severity: 'medium',
          details: '2FA enabled for enhanced account security'
        },
        {
          id: 'log4',
          timestamp: '2025-08-21T13:15:00Z',
          event: 'Password changed',
          category: 'security',
          severity: 'high',
          details: 'Account password successfully updated'
        },
        {
          id: 'log5',
          timestamp: '2025-08-21T12:00:00Z',
          event: 'New wallet connected',
          category: 'security',
          severity: 'medium',
          details: 'Wallet 0x8ba1f109551bD432803012645Hac136c772c3c7c connected'
        }
      ];
      setAuditLogs(mockAuditLogs);

    } catch (error) {
      console.error('Error loading governance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const voteOnProposal = (proposalId: string, vote: 'for' | 'against') => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        const newVotesFor = vote === 'for' ? p.votesFor + 1 : p.votesFor;
        const newVotesAgainst = vote === 'against' ? p.votesAgainst + 1 : p.votesAgainst;
        const newTotalVotes = newVotesFor + newVotesAgainst;
        
        return {
          ...p,
          votesFor: newVotesFor,
          votesAgainst: newVotesAgainst,
          totalVotes: newTotalVotes,
          userVote: vote
        };
      }
      return p;
    }));

    // Update user profile voting history
    if (userProfile) {
      setUserProfile(prev => prev ? {
        ...prev,
        votingHistory: [
          ...prev.votingHistory,
          { proposalId, vote, timestamp: new Date().toISOString() }
        ]
      } : null);
    }
  };

  const createProposal = () => {
    if (!newProposal.title || !newProposal.description) {
      alert('Please fill in all fields');
      return;
    }

    const proposal: GovernanceProposal = {
      id: `p${Date.now()}`,
      title: newProposal.title,
      description: newProposal.description,
      category: newProposal.category,
      status: 'active',
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      quorum: 2000,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      proposer: address || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      votingPower: userProfile?.governancePower || 0
    };

    setProposals(prev => [proposal, ...prev]);
    setNewProposal({ title: '', description: '', category: 'lending' });
    setShowCreateProposal(false);
  };

  const toggleNotificationSetting = (setting: keyof Pick<UserProfile, 'notificationsEnabled' | 'emailNotifications' | 'pushNotifications'>) => {
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, [setting]: !prev[setting] } : null);
    }
  };

  const toggleTwoFactor = () => {
    if (securitySettings) {
      setSecuritySettings(prev => prev ? { ...prev, twoFactorEnabled: !prev.twoFactorEnabled } : null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'passed': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lending': return 'text-purple-600 bg-purple-100';
      case 'security': return 'text-red-600 bg-red-100';
      case 'governance': return 'text-blue-600 bg-blue-100';
      case 'technical': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateVotingProgress = (proposal: GovernanceProposal) => {
    const progress = (proposal.totalVotes / proposal.quorum) * 100;
    return Math.min(progress, 100);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to access governance and settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Governance & Settings</h1>
          <p className="text-gray-300">Participate in DAO governance, manage your profile, and configure security settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('governance')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'governance' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Vote className="w-4 h-4" />
              <span>Governance</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'profile' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'support' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
            <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </div>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading governance data...</p>
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === 'governance' && !isLoading && (
          <div className="space-y-8">
            {/* Create Proposal Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">DAO Governance Proposals</h2>
              <button
                onClick={() => setShowCreateProposal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Proposal</span>
              </button>
            </div>

            {/* Create Proposal Modal */}
            {showCreateProposal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl mx-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Create New Proposal</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={newProposal.title}
                        onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                        placeholder="Enter proposal title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={newProposal.description}
                        onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                        placeholder="Enter detailed proposal description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={newProposal.category}
                        onChange={(e) => setNewProposal(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <option value="lending">Lending</option>
                        <option value="security">Security</option>
                        <option value="governance">Governance</option>
                        <option value="technical">Technical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowCreateProposal(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createProposal}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      Create Proposal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Proposals List */}
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                          {proposal.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                          {proposal.category.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{proposal.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Proposer:</span>
                          <p className="text-white font-mono">{proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-6)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">End Date:</span>
                          <p className="text-white">{formatDate(proposal.endDate)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Quorum:</span>
                          <p className="text-white">{proposal.quorum.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Your Power:</span>
                          <p className="text-white">{proposal.votingPower.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Voting Progress</span>
                      <span>{proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${calculateVotingProgress(proposal)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Vote Results */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{proposal.votesFor.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Votes For</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-400">{proposal.votesAgainst.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Votes Against</div>
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  {proposal.status === 'active' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => voteOnProposal(proposal.id, 'for')}
                        disabled={proposal.userVote === 'for'}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                          proposal.userVote === 'for'
                            ? 'bg-green-700 text-green-300 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Vote For</span>
                      </button>
                      <button
                        onClick={() => voteOnProposal(proposal.id, 'against')}
                        disabled={proposal.userVote === 'against'}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                          proposal.userVote === 'against'
                            ? 'bg-red-700 text-red-300 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Vote Against</span>
                      </button>
                    </div>
                  )}

                  {/* User Vote Status */}
                  {proposal.userVote && (
                    <div className="mt-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proposal.userVote === 'for' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        You voted {proposal.userVote === 'for' ? 'FOR' : 'AGAINST'} this proposal
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && !isLoading && userProfile && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">User Profile & Preferences</h2>
            
            {/* Profile Header */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-6">
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full border-4 border-blue-500"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{userProfile.username}</h3>
                  <p className="text-gray-400">{userProfile.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-400">Member since: {formatDate(userProfile.memberSince)}</span>
                    <span className="text-sm text-gray-400">Last login: {formatDate(userProfile.lastLogin)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">{userProfile.governancePower.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Governance Power</div>
                </div>
              </div>
            </div>

            {/* Connected Wallets */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Connected Wallets
              </h3>
              <div className="space-y-3">
                {userProfile.connectedWallets.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300 font-mono">{wallet}</span>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button className="w-full py-2 px-4 border-2 border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Enable Notifications</div>
                    <div className="text-sm text-gray-400">Receive alerts for important events</div>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting('notificationsEnabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userProfile.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      userProfile.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Email Notifications</div>
                    <div className="text-sm text-gray-400">Receive updates via email</div>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting('emailNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userProfile.emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      userProfile.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Push Notifications</div>
                    <div className="text-sm text-gray-400">Receive browser push notifications</div>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting('pushNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userProfile.pushNotifications ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      userProfile.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Voting History */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Vote className="w-5 h-5 mr-2" />
                Voting History
              </h3>
              <div className="space-y-3">
                {userProfile.votingHistory.map((vote, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <div className="text-white">Proposal {vote.proposalId}</div>
                      <div className="text-sm text-gray-400">{formatDate(vote.timestamp)}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vote.vote === 'for' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vote.vote.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && !isLoading && securitySettings && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Security Settings & Audit Logs</h2>
            
            {/* Security Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className="text-gray-400">Two-Factor Auth</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {securitySettings.passwordStrength.toUpperCase()}
                  </div>
                  <div className="text-gray-400">Password Strength</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {securitySettings.maxLoginAttempts}
                  </div>
                  <div className="text-gray-400">Max Login Attempts</div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-400">Add an extra layer of security</div>
                  </div>
                  <button
                    onClick={toggleTwoFactor}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Session Timeout</div>
                    <div className="text-sm text-gray-400">Auto-logout after inactivity</div>
                  </div>
                  <select className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                    <option value="1800">30 minutes</option>
                    <option value="3600" selected>1 hour</option>
                    <option value="7200">2 hours</option>
                    <option value="14400">4 hours</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Email Confirmation</div>
                    <div className="text-sm text-gray-400">Require email confirmation for changes</div>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.requireEmailConfirmation ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.requireEmailConfirmation ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Security Audit Logs
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-3 bg-slate-800/50 rounded-lg">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-white">{log.event}</div>
                        <div className="text-sm text-gray-400">{formatDate(log.timestamp)}</div>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{log.details}</div>
                      {log.ipAddress && (
                        <div className="text-xs text-gray-500 mt-1">
                          IP: {log.ipAddress} • {log.userAgent}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && !isLoading && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Documentation & Support</h2>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <FileText className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Protocol Documentation</h3>
                <p className="text-gray-400 text-sm">Learn about lending mechanics, governance, and security</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <Users className="w-12 h-12 mx-auto text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Community Forum</h3>
                <p className="text-gray-400 text-sm">Connect with other users and developers</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <HelpCircle className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Help Center</h3>
                <p className="text-gray-400 text-sm">Find answers to common questions</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <Zap className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">API Reference</h3>
                <p className="text-gray-400 text-sm">Developer documentation and integration guides</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <BarChart3 className="w-12 h-12 mx-auto text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-gray-400 text-sm">Protocol statistics and performance metrics</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <Shield className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Security Center</h3>
                <p className="text-gray-400 text-sm">Security best practices and audit reports</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Contact Support</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-2">Email Support</h4>
                  <p className="text-gray-400">support@aegisdefi.io</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Discord Community</h4>
                  <p className="text-gray-400">discord.gg/aegisdefi</p>
                  <p className="text-sm text-gray-500">Real-time community support</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Documentation</h4>
                  <p className="text-gray-400">docs.aegisdefi.io</p>
                  <p className="text-sm text-gray-500">Comprehensive guides and tutorials</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">GitHub</h4>
                  <p className="text-gray-400">github.com/aegisdefi</p>
                  <p className="text-sm text-gray-500">Open source contributions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Governance;
