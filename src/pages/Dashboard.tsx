import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  X, 
  ChevronDown, 
  ExternalLink,
  Activity,
  CreditCard,
  Coins,
  BarChart3,
  Settings,
  Bell,
  RefreshCw,
  Brain,
  MessageSquare,
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Gauge,
  DollarSign,
  Clock,
  Target,
  Globe,
  PieChart,
  Eye,
  Image
} from 'lucide-react';
import unifiedAIService from '../services/unifiedAIService';

// Enhanced mock wallet data with more realistic details
const mockWallets = [
  { 
    id: '1',
    name: 'MetaMask', 
    chain: 'Ethereum', 
    address: '0x2095...28b3',
    fullAddress: '0x2095a8f7c8d9e2f1a3b4c5d6e7f8a9b0c1d2e3f4',
    balance: 0.0020,
    nativeToken: 'ETH',
    status: 'connected',
    icon: '🦊',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: '2',
    name: 'Phantom', 
    chain: 'Solana', 
    address: '5D4Xz...wqEr',
    fullAddress: '5D4Xz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRqXz8JcRq',
    balance: 15.8,
    nativeToken: 'SOL',
    status: 'connected',
    icon: '👻',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    id: '3',
    name: 'WalletConnect', 
    chain: 'Avalanche', 
    address: '0xaBcD...789F',
    fullAddress: '0xaBcD8ba1f109551bD432803012645Hac136c772c3c7c',
    balance: 125.5,
    nativeToken: 'AVAX',
    status: 'connected',
    icon: '🔗',
    color: 'from-red-500 to-red-600'
  },
  { 
    id: '4',
    name: 'BTC Wallet', 
    chain: 'Bitcoin', 
    address: 'bc1qxyz...',
    fullAddress: 'bc1qxyz123456789abcdefghijklmnopqrstuvwxyz',
    balance: 0.0085,
    nativeToken: 'BTC',
    status: 'disconnected',
    icon: '₿',
    color: 'from-orange-500 to-orange-600'
  }
];

// Enhanced portfolio data with per-chain breakdowns
const mockPortfolio = {
  depositedCollateral: {
    Ethereum: { amount: 5000, change24h: 2.3, apy: 8.2 },
    Avalanche: { amount: 2500, change24h: -1.2, apy: 9.1 },
    Solana: { amount: 1200, change24h: 5.7, apy: 7.8 },
    Bitcoin: { amount: 0.8, change24h: 3.1, apy: 6.5 }
  },
  outstandingLoans: {
    Ethereum: { amount: 1200, interestRate: 12.5, dueDate: '2025-10-15' },
    Avalanche: { amount: 800, interestRate: 14.2, dueDate: '2025-09-30' },
    Solana: { amount: 400, interestRate: 13.8, dueDate: '2025-11-05' }
  },
  totalCollateralUSD: 8700,
  totalLoansUSD: 2400,
  borrowingPowerUSD: 5000,
  utilizationPercent: 48,
  creditScore: 78,
  liquidationRiskPercent: 22,
  netWorthUSD: 6300,
  availableCreditUSD: 2600
};

// Enhanced activity feed with more details
const mockActivityFeed = [
  { 
    id: 1, 
    type: 'Deposit', 
    chain: 'Ethereum', 
    asset: 'USDC', 
    amount: 1000, 
    usdValue: 1000,
    timestamp: '2025-08-20 14:36',
    status: 'confirmed',
    txHash: '0x1234...5678',
    icon: '⬇️'
  },
  { 
    id: 2, 
    type: 'Borrow', 
    chain: 'Avalanche', 
    asset: 'USDC', 
    amount: 500, 
    usdValue: 500,
    timestamp: '2025-08-19 11:15',
    status: 'confirmed',
    txHash: '0xabcd...efgh',
    icon: '⬆️'
  },
  { 
    id: 3, 
    type: 'Repay', 
    chain: 'Ethereum', 
    asset: 'ZETA', 
    amount: 300, 
    usdValue: 450,
    timestamp: '2025-08-18 09:42',
    status: 'confirmed',
    txHash: '0x9876...5432',
    icon: '💳'
  },
  { 
    id: 4, 
    type: 'Liquidation Warning', 
    chain: 'Solana', 
    asset: 'SOL', 
    amount: 25, 
    usdValue: 1800,
    timestamp: '2025-08-17 16:20',
    status: 'warning',
    txHash: '0xdef0...1234',
    icon: '⚠️'
  }
];

export const WalletDashboardPage: React.FC = () => {
  const [connectedWallets, setConnectedWallets] = useState<typeof mockWallets>([]);
  const [selectedWallet, setSelectedWallet] = useState<typeof mockWallets[0] | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletsPopup, setShowWalletsPopup] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize with some connected wallets
  useEffect(() => {
    setConnectedWallets(mockWallets.filter(w => w.status === 'connected'));
    setSelectedWallet(mockWallets[0]);
  }, []);

  const connectWallet = (wallet: typeof mockWallets[0]) => {
    if (!connectedWallets.find(w => w.id === wallet.id)) {
      const updatedWallet = { ...wallet, status: 'connected' as const };
      setConnectedWallets([...connectedWallets, updatedWallet]);
      setSelectedWallet(updatedWallet);
    }
    setShowWalletModal(false);
  };

  const disconnectWallet = (walletId: string) => {
    setConnectedWallets(connectedWallets.filter(w => w.id !== walletId));
    if (selectedWallet?.id === walletId) {
      setSelectedWallet(connectedWallets[0] || null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'Deposit': return 'text-green-500';
      case 'Borrow': return 'text-blue-500';
      case 'Repay': return 'text-purple-500';
      case 'Liquidation Warning': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header with Notifications */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Aegis Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                {notifications}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button 
              onClick={() => setShowWalletsPopup(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span>Connected Wallets ({connectedWallets.length})</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span onClick={() => setShowWalletModal(true)}>Add Wallet</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'ai-dashboard', label: 'AI Dashboard', icon: Brain },
            { id: 'ai-risk', label: 'AI Risk Management', icon: Shield },
            { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                console.log('Dashboard: Switching to tab:', tab.id);
                setActiveTab(tab.id);
              }}
              className={`px-4 py-2 rounded-md transition-colors capitalize flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Portfolio Summary Cards */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-blue-500" />
                <span>Cross-Chain Portfolio Overview</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <Coins className="w-8 h-8 text-blue-400" />
                    <span className="text-sm text-blue-400">+2.3%</span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-2">Total Collateral</h3>
                  <p className="text-2xl font-bold">${mockPortfolio.totalCollateralUSD.toLocaleString()}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <CreditCard className="w-8 h-8 text-purple-400" />
                    <span className="text-sm text-purple-400">Active</span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-2">Outstanding Loans</h3>
                  <p className="text-2xl font-bold">${mockPortfolio.totalLoansUSD.toLocaleString()}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <span className="text-sm text-green-400">{mockPortfolio.utilizationPercent}%</span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-2">Borrowing Power</h3>
                  <p className="text-2xl font-bold">${mockPortfolio.borrowingPowerUSD.toLocaleString()}</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-orange-400" />
                    <span className="text-sm text-orange-400">Good</span>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-2">Credit Score</h3>
                  <p className="text-2xl font-bold">{mockPortfolio.creditScore}</p>
                </div>
              </div>
            </section>

            {/* Risk Overview */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Risk Assessment</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-400" />
                    AI Credit Score
                  </h3>
                  <div className="text-center">
                    <div className="relative inline-block">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${(mockPortfolio.creditScore / 100) * 352} 352`}
                          className="text-blue-500 transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{mockPortfolio.creditScore}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">Good Credit Standing</p>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    Liquidation Risk
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Current Risk</span>
                        <span className="text-red-400">{mockPortfolio.liquidationRiskPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${mockPortfolio.liquidationRiskPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Net Worth</p>
                        <p className="text-lg font-semibold">${mockPortfolio.netWorthUSD.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Available Credit</p>
                        <p className="text-lg font-semibold">${mockPortfolio.availableCreditUSD.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

                  {/* AI-Optimized Omnichain Money Market */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-500" />
          <span>AI-Optimized Omnichain Money Market</span>
          <Zap className="w-6 h-6 text-yellow-500" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <Coins className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Native BTC/ETH/SOL</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">3</p>
            <p className="text-sm text-gray-400 mt-2">Native assets supported</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Dynamic LTV</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">75%</p>
            <p className="text-sm text-gray-400 mt-2">AI-optimized ratios</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Risk Score</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">4.2/10</p>
            <p className="text-sm text-gray-400 mt-2">AI-calculated risk</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <Globe className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold">Active Chains</h3>
            </div>
            <p className="text-3xl font-bold text-orange-400">5</p>
            <p className="text-sm text-gray-400 mt-2">Cross-chain liquidity</p>
          </div>
        </div>

        {/* AI Risk Analysis Widget */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>Real-Time AI Risk Analysis</span>
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Collateral Volatility</p>
              <p className="text-2xl font-bold text-blue-400">8.5%</p>
              <p className="text-xs text-gray-500">30-day average</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Optimal Interest Rate</p>
              <p className="text-2xl font-bold text-green-400">4.2%</p>
              <p className="text-xs text-gray-500">AI-optimized</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Liquidation Threshold</p>
              <p className="text-2xl font-bold text-orange-400">75%</p>
              <p className="text-xs text-gray-500">Dynamic adjustment</p>
            </div>
          </div>
        </div>
      </section>

            {/* Recent Activity */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="space-y-4">
                    {mockActivityFeed.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg`}>
                            {activity.icon}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{activity.type}</span>
                              <span className="text-sm text-gray-400">{activity.amount} {activity.asset}</span>
                              <span className="text-xs bg-gray-600 px-2 py-1 rounded">on {activity.chain}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <span>{activity.timestamp}</span>
                              <span>•</span>
                              <span className={`${getActivityIconColor(activity.type)}`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${activity.usdValue.toLocaleString()}</p>
                          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            View TX
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'ai-dashboard' && (
          <>
            {console.log('Dashboard: Rendering AIDashboardTab')}
            <AIDashboardTab />
          </>
        )}

        {activeTab === 'ai-risk' && (
          <AIRiskTab />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTab />
        )}

        {activeTab === 'activity' && (
          <ActivityTab />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}

        {/* Connected Wallets Popup */}
        {showWalletsPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold">Connected Wallets</h3>
                  <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                    {connectedWallets.length} active
                  </span>
                </div>
                <button 
                  onClick={() => setShowWalletsPopup(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Connected Wallets List */}
              <div className="space-y-3 mb-6">
                {connectedWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 bg-gray-700/60 rounded-lg hover:bg-gray-700/80 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${wallet.color} flex items-center justify-center text-white text-lg font-medium`}>
                        {wallet.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-medium text-white truncate">{wallet.name}</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusBgColor(wallet.status)} flex-shrink-0`}></div>
                        </div>
                        <div className="text-sm text-gray-400 truncate">{wallet.address}</div>
                        <div className="text-sm text-gray-300">
                          {wallet.balance.toFixed(4)} {wallet.nativeToken}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors">
                        Switch
                      </button>
                      <button 
                        onClick={() => disconnectWallet(wallet.id)}
                        className="text-sm bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))}
                
                {connectedWallets.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No wallets connected</p>
                  </div>
                )}
              </div>
              
              {/* Add Wallet Button */}
              <button 
                onClick={() => {
                  setShowWalletsPopup(false);
                  setShowWalletModal(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Connect New Wallet</span>
              </button>
            </div>
          </div>
        )}

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Connect Wallet</h3>
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                {mockWallets.filter(w => w.status === 'disconnected').map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => connectWallet(wallet)}
                    className="w-full flex items-center space-x-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${wallet.color} flex items-center justify-center text-white text-lg`}>
                      {wallet.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{wallet.name}</p>
                      <p className="text-sm text-gray-400">{wallet.chain}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// AI Dashboard Tab Component
const AIDashboardTab: React.FC = () => {
  console.log('AIDashboardTab: Component definition reached');
  
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');

  // Mock data for demo
  const mockCreditScoreData = {
    score: 87,
    riskLevel: 'Low Risk',
    maxLoanAmount: 25000,
    factors: [
      'Excellent repayment history (95% on-time)',
      'Strong collateral ratio (78%)',
      'Diversified portfolio across 4 chains',
      'No liquidations in 12 months',
      'Active user for 8 months'
    ],
    recommendations: [
      'Consider increasing BTC collateral for better rates',
      'Eligible for premium lending tier',
      'Can access up to 85% LTV on stable assets'
    ]
  };

  const mockPortfolioAnalysis = {
    totalValue: 18500,
    allocation: {
      'BTC': { value: 8000, percentage: 43.2, risk: 'Low' },
      'ETH': { value: 6500, percentage: 35.1, risk: 'Medium' },
      'SOL': { value: 2500, percentage: 13.5, risk: 'High' },
      'ZETA': { value: 1500, percentage: 8.1, risk: 'Medium' }
    },
    crossChainExposure: {
      'Bitcoin': 43.2,
      'Ethereum': 35.1,
      'Solana': 13.5,
      'ZetaChain': 8.1
    },
    riskMetrics: {
      volatility: 0.28,
      sharpeRatio: 1.85,
      maxDrawdown: -12.5,
      correlation: 0.42
    }
  };

  const mockAIIssues = [
    {
      id: '1',
      type: 'credit' as const,
      title: 'Credit Score Analysis',
      content: `Credit Score: ${mockCreditScoreData.score}/100\nRisk Level: ${mockCreditScoreData.riskLevel}\nMax Loan: $${mockCreditScoreData.maxLoanAmount.toLocaleString()}\n\nKey Factors:\n${mockCreditScoreData.factors.map(f => `• ${f}`).join('\n')}\n\nRecommendations:\n${mockCreditScoreData.recommendations.map(r => `• ${r}`).join('\n')}`,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'success' as const
    },
    {
      id: '2',
      type: 'analysis' as const,
      title: 'Portfolio Risk Assessment',
      content: `Portfolio Value: $${mockPortfolioAnalysis.totalValue.toLocaleString()}\n\nRisk Metrics:\n• Volatility: ${(mockPortfolioAnalysis.riskMetrics.volatility * 100).toFixed(1)}%\n• Sharpe Ratio: ${mockPortfolioAnalysis.riskMetrics.sharpeRatio}\n• Max Drawdown: ${mockPortfolioAnalysis.riskMetrics.maxDrawdown}%\n\nRecommendation: Consider rebalancing SOL position to reduce volatility.`,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'success' as const
    },
    {
      id: '3',
      type: 'recommendation' as const,
      title: 'Cross-Chain Optimization',
      content: 'Based on your portfolio, consider:\n\n• Moving 20% of ETH to ZetaChain for better yields\n• Using BTC as collateral for USDC loans on Avalanche\n• Leveraging cross-chain arbitrage opportunities\n\nEstimated additional yield: 2.3% APY',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'success' as const
    }
  ];

  interface AIInsight {
    id: string;
    type: 'credit' | 'risk' | 'recommendation' | 'analysis';
    title: string;
    content: string;
    timestamp: string;
    status: 'loading' | 'success' | 'error';
  }

  useEffect(() => {
    console.log('AIDashboardTab: useEffect triggered');
    checkServiceHealth();
    // Initialize with mock insights for demo
    setInsights(mockAIIssues);
  }, []);

  const checkServiceHealth = async () => {
    try {
      // Use mock service for demo - always healthy
      console.log('AIDashboardTab: Checking service health...');
      setServiceHealth('healthy');
      console.log('AIDashboardTab: Service health set to healthy');
    } catch (error) {
      setServiceHealth('unhealthy');
      console.error('Service health check failed:', error);
    }
  };

  const addInsight = (insight: Omit<AIInsight, 'id' | 'timestamp'>) => {
    const newInsight: AIInsight = {
      ...insight,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setInsights(prev => [newInsight, ...prev]);
  };

  const generateCreditScore = async () => {
    console.log('AIDashboardTab: generateCreditScore called');
    setIsGenerating(true);
    
          // Add loading insight
      const loadingInsightId = Date.now().toString();
      addInsight({
        type: 'credit' as const,
        title: 'AI Credit Score Analysis',
        content: 'Analyzing your lending profile across all chains...',
        status: 'loading' as const
      });

      try {
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Use mock data for demo
        const newInsight = {
          type: 'credit' as const,
          title: 'AI Credit Score Analysis',
          content: `Credit Score: ${mockCreditScoreData.score}/100\nRisk Level: ${mockCreditScoreData.riskLevel}\nMax Loan: $${mockCreditScoreData.maxLoanAmount.toLocaleString()}\n\nKey Factors:\n${mockCreditScoreData.factors.map(f => `• ${f}`).join('\n')}\n\nRecommendations:\n${mockCreditScoreData.recommendations.map(r => `• ${r}`).join('\n')}`,
          status: 'success' as const
        };
        
        addInsight(newInsight);
        
        // Remove loading insight by finding it by title and status
        setInsights(prev => prev.filter(i => !(i.title === 'AI Credit Score Analysis' && i.status === 'loading')));
        
      } catch (error) {
        console.error('AIDashboardTab: Error generating credit score:', error);
        setInsights(prev => prev.map(i => 
          i.title === 'AI Credit Score Analysis' && i.status === 'loading'
            ? { ...i, content: 'Failed to generate credit score', status: 'error' }
            : i
        ));
      } finally {
        setIsGenerating(false);
      }
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    addInsight({
      type: 'analysis',
      title: 'AI Content Generation',
      content: 'Analyzing your request and generating insights...',
      status: 'loading'
    });

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock content based on prompt
      let mockResponse = '';
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('analysis')) {
        mockResponse = `Portfolio Analysis Report:\n\nTotal Value: $${mockPortfolioAnalysis.totalValue.toLocaleString()}\n\nAsset Allocation:\n${Object.entries(mockPortfolioAnalysis.allocation).map(([asset, data]) => 
          `• ${asset}: $${data.value.toLocaleString()} (${data.percentage}%) - Risk: ${data.risk}`
        ).join('\n')}\n\nCross-Chain Exposure:\n${Object.entries(mockPortfolioAnalysis.crossChainExposure).map(([chain, percentage]) => 
          `• ${chain}: ${percentage}%`
        ).join('\n')}\n\nRisk Metrics:\n• Volatility: ${(mockPortfolioAnalysis.riskMetrics.volatility * 100).toFixed(1)}%\n• Sharpe Ratio: ${mockPortfolioAnalysis.riskMetrics.sharpeRatio}\n• Max Drawdown: ${mockPortfolioAnalysis.riskMetrics.maxDrawdown}%\n\nRecommendation: Your portfolio shows good diversification but consider reducing SOL exposure for better risk-adjusted returns.`;
      } else if (lowerPrompt.includes('loan') || lowerPrompt.includes('borrow')) {
        mockResponse = `Loan Analysis & Recommendations:\n\nBased on your credit score of ${mockCreditScoreData.score}/100:\n\nAvailable Loan Options:\n• USDC: Up to $${Math.floor(mockCreditScoreData.maxLoanAmount * 0.4).toLocaleString()} at 4.2% APY\n• DAI: Up to $${Math.floor(mockCreditScoreData.maxLoanAmount * 0.3).toLocaleString()} at 4.8% APY\n• ZETA: Up to $${Math.floor(mockCreditScoreData.maxLoanAmount * 0.2).toLocaleString()} at 5.2% APY\n\nOptimal Strategy:\n• Use BTC as collateral for stablecoin loans\n• Consider cross-chain borrowing on Avalanche for better rates\n• Leverage your excellent credit for premium lending tiers\n\nEstimated Monthly Payment: $${Math.floor(mockCreditScoreData.maxLoanAmount * 0.05).toLocaleString()}`;
      } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('volatility')) {
        mockResponse = `Risk Assessment Report:\n\nCurrent Risk Level: ${mockCreditScoreData.riskLevel}\n\nPortfolio Risk Metrics:\n• Overall Volatility: ${(mockPortfolioAnalysis.riskMetrics.volatility * 100).toFixed(1)}%\n• Correlation Risk: ${(mockPortfolioAnalysis.riskMetrics.correlation * 100).toFixed(1)}%\n• Liquidation Risk: Low (78% collateral ratio)\n\nRisk Factors:\n• SOL position contributes 35% of total volatility\n• Cross-chain exposure reduces correlation risk\n• Strong collateral ratio provides safety buffer\n\nRisk Mitigation:\n• Consider hedging SOL with stablecoin positions\n• Diversify across more chains for better risk distribution\n• Monitor collateral ratios during market volatility`;
      } else {
        mockResponse = `AI Analysis:\n\nBased on your request "${prompt}", here are the key insights:\n\n• Your portfolio shows strong fundamentals with $${mockPortfolioAnalysis.totalValue.toLocaleString()} in assets\n• Credit score of ${mockCreditScoreData.score}/100 qualifies you for premium rates\n• Cross-chain diversification reduces systemic risk\n• Consider leveraging ZetaChain's omnichain capabilities for better yields\n\nFor more specific analysis, try asking about:\n• Portfolio optimization\n• Loan recommendations\n• Risk assessment\n• Cross-chain strategies`;
      }
      
      setGeneratedText(mockResponse);
      
      // Update the insight with the generated content
      setInsights(prev => prev.map(i => 
        i.title === 'AI Content Generation' && i.status === 'loading'
          ? { ...i, content: mockResponse, status: 'success' }
          : i
      ));
    } catch (error) {
      setInsights(prev => prev.map(i => 
        i.title === 'AI Content Generation' && i.status === 'loading'
          ? { ...i, content: 'Failed to generate content', status: 'error' }
          : i
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  console.log('AIDashboardTab: Rendering component');
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Insights
          </h2>
          <Sparkles className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Leverage advanced AI to analyze your portfolio, assess risks, and get personalized recommendations
        </p>
      </div>

      {/* Service Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${serviceHealth === 'healthy' ? 'bg-green-500' : serviceHealth === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span className="text-lg font-semibold">AI Service Status</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${serviceHealth === 'healthy' ? 'text-green-400' : serviceHealth === 'checking' ? 'text-yellow-400' : 'text-red-400'}`}>
              {serviceHealth === 'healthy' ? 'Healthy' : serviceHealth === 'checking' ? 'Checking...' : 'Unhealthy'}
            </span>
            <button 
              onClick={checkServiceHealth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* AI Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Credit Score Analysis</span>
          </h3>
          <p className="text-gray-400 mb-4">
            Get AI-powered credit scoring based on your lending history and portfolio
          </p>
          <button 
            onClick={generateCreditScore}
            disabled={isGenerating || serviceHealth !== 'healthy'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Generate Credit Score</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            <span>Content Generation</span>
          </h3>
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI to analyze your portfolio, generate reports, or provide insights..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={3}
            />
            <button 
              onClick={generateContent}
              disabled={isGenerating || !prompt.trim() || serviceHealth !== 'healthy'}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI-Powered Natural Language Interface */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>AI Assistant - Natural Language Commands</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Demo Mode - AI Always Available</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* AI Command Input */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Try: 'Show me loan options for my BTC' or 'Borrow 1000 USDC at 70% LTV'"
                className="w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Handle AI command
                    const command = e.currentTarget.value;
                    if (command.includes('borrow') || command.includes('loan')) {
                      // Show transaction preview
                      alert(`AI Command: ${command}\n\nProcessing cross-chain transaction...`);
                    }
                  }
                }}
              />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm">
                  Ask AI
                </button>
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm">
                  Voice Command
                </button>
              </div>
            </div>

            {/* Example Commands */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h4 className="font-semibold text-white mb-3">Example AI Commands:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="text-gray-300">
                  • "Show loan options for my BTC"
                </div>
                <div className="text-gray-300">
                  • "Borrow 1000 USDC at 70% LTV"
                </div>
                <div className="text-gray-300">
                  • "What's my risk across all chains?"
                </div>
                <div className="text-gray-300">
                  • "Optimize my portfolio for yield"
                </div>
              </div>
            </div>

            {/* AI Response */}
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-blue-200 font-semibold">AI Response:</span>
              </div>
              <p className="text-blue-200 text-sm">
                "Based on your BTC collateral and current market conditions, I recommend borrowing USDC on Avalanche at 65% LTV. 
                This gives you the best risk-adjusted borrowing power while maintaining safety margins."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Display */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>AI-Generated Insights</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Real-time AI analysis of your portfolio, credit, and cross-chain opportunities
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No insights generated yet. Use the AI tools above to get started.</p>
              </div>
            ) : (
              insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${
                    insight.status === 'success'
                      ? 'bg-green-900/20 border-green-500/30'
                      : insight.status === 'loading'
                      ? 'bg-blue-900/20 border-blue-500/30'
                      : 'bg-red-900/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {insight.type === 'credit' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                      {insight.type === 'risk' && <Shield className="w-4 h-4 text-yellow-400" />}
                      {insight.type === 'recommendation' && <Zap className="w-4 h-4 text-green-400" />}
                      {insight.type === 'analysis' && <BarChart3 className="w-4 h-4 text-purple-400" />}
                      <span className="font-semibold text-white">{insight.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : insight.status === 'loading'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {insight.status === 'success' ? '✓ Complete' : 
                         insight.status === 'loading' ? '⏳ Processing' : '✗ Error'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(insight.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm whitespace-pre-line">
                    {insight.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ZetaChain Gateway API Integration */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-400" />
            <span>ZetaChain Gateway API - Cross-Chain Messaging</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Live Cross-Chain Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-semibold">BTC.ETH</span>
                </div>
                <p className="text-gray-300 text-xs">Processing cross-chain message</p>
                <p className="text-white text-sm font-mono">0x7f3...a2b1</p>
                <p className="text-xs text-yellow-400 mt-1">Gas: 0.001 gaZETA</p>
              </div>
              
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 text-sm font-semibold">SOL.AVAX</span>
                </div>
                <p className="text-gray-300 text-xs">Liquidity routing</p>
                <p className="text-white text-sm font-mono">0x9c4...d5e6</p>
                <p className="text-xs text-yellow-400 mt-1">Gas: 0.002 gaZETA</p>
              </div>
              
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-400 text-sm font-semibold">POL.BNB</span>
                </div>
                <p className="text-gray-300 text-xs">Collateral verification</p>
                <p className="text-white text-sm font-mono">0x2a1...b3c4</p>
                <p className="text-xs text-yellow-400 mt-1">Gas: 0.0015 gaZETA</p>
              </div>
            </div>

            {/* API Metrics */}
            <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-green-200 font-semibold">ZetaChain API Metrics:</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-200 font-semibold">15+</p>
                  <p className="text-green-300 text-xs">Messages/Min</p>
                </div>
                <div>
                  <p className="text-green-200 font-semibold">&lt;2.3s</p>
                  <p className="text-green-300 text-xs">Avg Response</p>
                </div>
                <div>
                  <p className="text-green-200 font-semibold">99.9%</p>
                  <p className="text-green-300 text-xs">Success Rate</p>
                </div>
              </div>
              
              {/* ZETA Token & Gas Info */}
              <div className="mt-4 pt-4 border-t border-green-500/30">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-300">ZETA Token:</span>
                    <span className="text-green-200 font-semibold">$2.45</span>
                    <span className="text-green-400 text-xs">+5.2%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-300">Gas Price:</span>
                    <span className="text-yellow-400 font-semibold">0.001 gaZETA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Risk Management Tab Component
const AIRiskTab: React.FC = () => {
  const [creditScore, setCreditScore] = useState<any>(null);
  const [liquidationRisk, setLiquidationRisk] = useState<any>(null);
  const [interestRate, setInterestRate] = useState<any>(null);
  const [portfolioRisk, setPortfolioRisk] = useState<any>(null);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // AI-Powered Cross-Chain Risk Engine
  const [aiRiskScore, setAiRiskScore] = useState(85);
  const [crossChainVolatility, setCrossChainVolatility] = useState({
    bitcoin: 0.15,
    ethereum: 0.25,
    solana: 0.35,
    avalanche: 0.30,
    base: 0.20
  });

  // Mock portfolio data for demonstration
  const mockPortfolio = {
    assets: [
      { symbol: 'ETH', value: 5000, chain: 'ethereum', volatility: 0.25 },
      { symbol: 'BTC', value: 3000, chain: 'bitcoin', volatility: 0.20 },
      { symbol: 'SOL', value: 2000, chain: 'solana', volatility: 0.35 },
      { symbol: 'AVAX', value: 1500, chain: 'avalanche', volatility: 0.30 }
    ],
    totalValue: 11500,
    loans: [
      { asset: 'USDC', amount: 3000, interestRate: 0.045, collateralRatio: 0.75 },
      { asset: 'ZETA', amount: 1500, interestRate: 0.052, collateralRatio: 0.80 }
    ],
    userHistory: {
      totalBorrows: 20,
      onTimeRepayments: 18,
      lateRepayments: 2,
      liquidations: 0,
      avgLoanDuration: 45
    }
  };

  useEffect(() => {
    generateRiskAssessment();
    generateMockAlerts();
  }, []);

  const generateRiskAssessment = async () => {
    setIsLoading(true);
    try {
      // Generate AI credit score
      const creditScoreData = await generateCreditScore();
      setCreditScore(creditScoreData);

      // Generate liquidation risk assessment
      const liquidationRiskData = await generateLiquidationRisk();
      setLiquidationRisk(liquidationRiskData);

      // Generate dynamic interest rate
      const interestRateData = await generateDynamicInterestRate(creditScoreData.score);
      setInterestRate(interestRateData);

      // Generate portfolio risk analysis
      const portfolioRiskData = await generatePortfolioRisk();
      setPortfolioRisk(portfolioRiskData);

    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCreditScore = async () => {
    try {
      const response = await unifiedAIService.getCreditScore(
        '0xMockUser123',
        [],
        mockPortfolio.totalValue,
        mockPortfolio.loans.reduce((sum, loan) => sum + loan.amount, 0),
        'Multiple'
      );

      // The unifiedAIService returns the response directly, no need to check response.success
      return {
        score: response.creditScore,
        riskLevel: response.riskLevel,
        factors: response.riskFactors,
        recommendations: response.recommendations,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI credit scoring failed:', error);
    }

    // Fallback mock data
    return {
      score: 78,
      riskLevel: 'Medium',
      factors: ['High ETH concentration', 'Recent market volatility', 'Moderate loan utilization'],
      recommendations: ['Diversify ETH position', 'Add more stablecoin collateral', 'Monitor market conditions'],
      lastUpdated: new Date().toISOString()
    };
  };

  const generateLiquidationRisk = async () => {
    try {
      const response = await unifiedAIService.generateRiskAssessment(
        mockPortfolio,
        { marketVolatility: 'high', gasFees: 'high', correlation: 'medium' },
        { riskTolerance: 'moderate' }
      );

      // Parse the string response from unifiedAIService
      try {
        const riskData = JSON.parse(response);
        const riskScore = riskData.riskScore || 35; // Default fallback
        const probability = Math.min(riskScore * 10, 95);
        
        return {
          probability,
          timeToLiquidation: probability > 80 ? 2 : probability > 60 ? 24 : 168,
          riskFactors: (riskData.threats || ['ETH price volatility', 'High loan utilization', 'Market correlation risk']).slice(0, 3),
          mitigationActions: (riskData.mitigation || ['Add stablecoin collateral', 'Reduce loan amount', 'Monitor ETH price']).slice(0, 3),
          urgency: probability > 80 ? 'Critical' : probability > 60 ? 'High' : probability > 30 ? 'Medium' : 'Low'
        };
      } catch (parseError) {
        console.error('Failed to parse risk assessment response:', parseError);
        // Fallback if parsing fails
        return {
          probability: 35,
          timeToLiquidation: 72,
          riskFactors: ['ETH price volatility', 'High loan utilization', 'Market correlation risk'],
          mitigationActions: ['Add stablecoin collateral', 'Reduce loan amount', 'Monitor ETH price'],
          urgency: 'Medium'
        };
      }
    } catch (error) {
      console.error('AI liquidation risk assessment failed:', error);
    }

    // Fallback mock data
    return {
      probability: 35,
      timeToLiquidation: 72,
      riskFactors: ['ETH price volatility', 'High loan utilization', 'Market correlation risk'],
      mitigationActions: ['Add stablecoin collateral', 'Reduce loan amount', 'Monitor ETH price'],
      urgency: 'Medium'
    };
  };

  const generateDynamicInterestRate = async (creditScore: number) => {
    const baseRate = 0.04;
    const riskPremium = Math.max(0, (100 - creditScore) * 0.001);
    const liquidityPremium = 0.005;
    const finalRate = baseRate + riskPremium + liquidityPremium;

    return {
      baseRate,
      riskPremium,
      liquidityPremium,
      finalRate,
      factors: [
        `Credit score: ${creditScore}/100`,
        'Market liquidity: Moderate',
        'Protocol utilization: 75%'
      ],
      lastCalculated: new Date().toISOString()
    };
  };

  const generatePortfolioRisk = async () => {
    try {
      const response = await unifiedAIService.generateRiskAssessment(
        mockPortfolio,
        { marketVolatility: 'high', correlation: 'medium', smartContractRisk: 'low' },
        { riskTolerance: 'moderate' }
      );

      // Parse the string response from unifiedAIService
      try {
        const riskData = JSON.parse(response);
        return {
          overallRisk: riskData.riskScore || 5, // Default fallback
          chainRisks: {
            ethereum: 4,
            bitcoin: 3,
            solana: 6,
            avalanche: 5
          },
          assetRisks: {
            ETH: 5,
            BTC: 3,
            SOL: 7,
            AVAX: 6
          },
          correlationRisk: 6,
          marketRisk: 7,
          smartContractRisk: 2
        };
      } catch (parseError) {
        console.error('Failed to parse portfolio risk response:', parseError);
        // Fallback if parsing fails
        return {
          overallRisk: 5,
          chainRisks: { ethereum: 4, bitcoin: 3, solana: 6, avalanche: 5 },
          assetRisks: { ETH: 5, BTC: 3, SOL: 7, AVAX: 6 },
          correlationRisk: 6,
          marketRisk: 7,
          smartContractRisk: 2
        };
      }
    } catch (error) {
      console.error('AI portfolio risk assessment failed:', error);
    }

    // Fallback mock data
    return {
      overallRisk: 5,
      chainRisks: { ethereum: 4, bitcoin: 3, solana: 6, avalanche: 5 },
      assetRisks: { ETH: 5, BTC: 3, SOL: 7, AVAX: 6 },
      correlationRisk: 6,
      marketRisk: 7,
      smartContractRisk: 2
    };
  };

  const generateMockAlerts = () => {
    const alerts = [
      {
        id: '1',
        type: 'liquidation',
        severity: 'warning',
        message: 'ETH collateral value decreased by 8% in last 24h',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionRequired: true,
        actionDescription: 'Consider adding collateral or repaying loans'
      },
      {
        id: '2',
        type: 'credit',
        severity: 'info',
        message: 'Credit score improved by 5 points due to on-time repayment',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actionRequired: false
      },
      {
        id: '3',
        type: 'market',
        severity: 'warning',
        message: 'High correlation detected between ETH and SOL positions',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        actionRequired: true,
        actionDescription: 'Consider diversifying across uncorrelated assets'
      }
    ];
    setRiskAlerts(alerts);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-orange-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'High': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  // AI-Powered Dynamic LTV Calculation
  const calculateDynamicLTV = (asset: string, chain: string) => {
    const baseLTV = 0.7; // 70%
    const volatilityAdjustment = crossChainVolatility[chain as keyof typeof crossChainVolatility] * 0.1;
    const aiRiskAdjustment = (100 - aiRiskScore) * 0.002;
    return Math.max(0.3, Math.min(0.9, baseLTV - volatilityAdjustment - aiRiskAdjustment));
  };

  // Real-time AI Risk Monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time AI risk updates
      setAiRiskScore(prev => Math.max(70, Math.min(95, prev + (Math.random() - 0.5) * 2)));
      
      // Update cross-chain volatility
      setCrossChainVolatility(prev => ({
        bitcoin: prev.bitcoin + (Math.random() - 0.5) * 0.02,
        ethereum: prev.ethereum + (Math.random() - 0.5) * 0.02,
        solana: prev.solana + (Math.random() - 0.5) * 0.02,
        avalanche: prev.avalanche + (Math.random() - 0.5) * 0.02,
        base: prev.base + (Math.random() - 0.5) * 0.02
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Analyzing portfolio risks with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Risk Management Dashboard
          </h2>
          <Shield className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real-time AI-powered risk assessment, credit scoring, and predictive liquidation analysis
        </p>
      </div>

      {/* Cross-Chain Portfolio Overview */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary">Cross-Chain Portfolio</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Live Demo Data</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {Object.entries(crossChainVolatility).map(([chain, volatility]) => {
            const ltv = calculateDynamicLTV('', chain);
            const balance = Math.random() * 1000000; // Mock balance
            
            return (
              <div key={chain} className="text-center p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                <div className="w-8 h-8 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary uppercase">{chain.slice(0, 3)}</span>
                </div>
                <p className="text-sm text-gray-400 capitalize">{chain}</p>
                <p className="font-bold text-white">${(balance / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">LTV: {(ltv * 100).toFixed(0)}%</p>
                <p className="text-xs text-gray-500">Vol: {(volatility * 100).toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
        
        {/* Cross-chain flow indicators */}
        <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time liquidity routing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>AI-powered LTV adjustments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>Cross-chain risk monitoring</span>
          </div>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Credit Score */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold">AI Credit Score</h3>
          </div>
          {creditScore && (
            <>
              <p className={`text-3xl font-bold ${getRiskLevelColor(creditScore.riskLevel)}`}>
                {creditScore.score}/100
              </p>
              <p className={`text-sm font-medium ${getRiskLevelColor(creditScore.riskLevel)}`}>
                {creditScore.riskLevel} Risk
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Updated: {new Date(creditScore.lastUpdated).toLocaleTimeString()}
              </p>
            </>
          )}
        </div>

        {/* Liquidation Risk */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold">Liquidation Risk</h3>
          </div>
          {liquidationRisk && (
            <>
              <p className={`text-3xl font-bold ${getRiskLevelColor(liquidationRisk.urgency)}`}>
                {liquidationRisk.probability.toFixed(1)}%
              </p>
              <p className={`text-sm font-medium ${getRiskLevelColor(liquidationRisk.urgency)}`}>
                {liquidationRisk.urgency} Urgency
              </p>
              <p className="text-xs text-gray-400 mt-2">
                ~{liquidationRisk.timeToLiquidation}h to liquidation
              </p>
            </>
          )}
        </div>

        {/* Dynamic Interest Rate */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold">Interest Rate</h3>
          </div>
          {interestRate && (
            <>
              <p className="text-3xl font-bold text-green-400">
                {(interestRate.finalRate * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-400">
                Base: {(interestRate.baseRate * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Risk Premium: +{(interestRate.riskPremium * 100).toFixed(2)}%
              </p>
            </>
          )}
        </div>

        {/* Portfolio Risk */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <Gauge className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold">Portfolio Risk</h3>
          </div>
          {portfolioRisk && (
            <>
              <p className={`text-3xl font-bold ${getRiskLevelColor(portfolioRisk.overallRisk <= 3 ? 'Low' : portfolioRisk.overallRisk <= 6 ? 'Medium' : 'High')}`}>
                {portfolioRisk.overallRisk}/10
              </p>
              <p className="text-sm text-gray-400">
                Overall Risk Score
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Market Risk: {portfolioRisk.marketRisk}/10
              </p>
            </>
          )}
        </div>
      </div>

      {/* AI Risk Assessment */}
      {liquidationRisk && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl border border-orange-500/30">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2 p-6 pb-0">
            {getUrgencyIcon(liquidationRisk.urgency)}
            <span>AI Liquidation Risk Assessment</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div>
              <p className="text-sm text-gray-400 mb-2">Risk Factors</p>
              <ul className="space-y-1">
                {liquidationRisk.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-center space-x-2">
                    <AlertTriangle className="w-3 h-3 text-orange-400" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Mitigation Actions</p>
              <ul className="space-y-1">
                {liquidationRisk.mitigationActions.map((action, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Disaster-Proof Vaults Control Panel */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span>Disaster-Proof Vaults</span>
          <Brain className="w-5 h-5 text-purple-400" />
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          AI predicts chain congestion and fees, automatically moving collateral to safer chains before adverse events.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Current Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Ethereum</span>
                <span className="text-green-400">Safe</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Solana</span>
                <span className="text-yellow-400">Warning</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Base</span>
                <span className="text-green-400">Safe</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">AI Predictions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Gas Fee Trend</span>
                <span className="text-orange-400">↗️ Rising</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Congestion Risk</span>
                <span className="text-yellow-400">Medium</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Next Migration</span>
                <span className="text-blue-400">2 hours</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Migration History</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Last Move</span>
                <span className="text-green-400">$12,500</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Gas Saved</span>
                <span className="text-green-400">$89</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Saved</span>
                <span className="text-green-400">$2,340</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Shield className="w-4 h-4 inline mr-2" />
            Trigger Migration
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <Brain className="w-4 h-4 inline mr-2" />
            AI Analysis
          </button>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span>Risk Alerts & Notifications</span>
          </h3>
        </div>
        <div className="p-6">
          {riskAlerts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No active risk alerts</p>
          ) : (
            <div className="space-y-4">
              {riskAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm opacity-80 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                      {alert.actionRequired && alert.actionDescription && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                          <p className="text-sm font-medium">Action Required:</p>
                          <p className="text-sm">{alert.actionDescription}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {alert.actionRequired && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={generateRiskAssessment}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Refresh Risk Assessment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Portfolio Tab Component
const PortfolioTab: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '1w' | '1m' | '3m' | '1y'>('1m');
  const [showAllocation, setShowAllocation] = useState<boolean | 'nft'>(true);

  const portfolioData = {
    totalValue: 11500,
    change24h: 2.3,
    change7d: -1.2,
    change30d: 8.5,
    assets: [
      { symbol: 'ETH', value: 5000, change24h: 3.2, allocation: 43.5, chain: 'Ethereum' },
      { symbol: 'BTC', value: 3000, change24h: 1.8, allocation: 26.1, chain: 'Bitcoin' },
      { symbol: 'SOL', value: 2000, change24h: 5.7, allocation: 17.4, chain: 'Solana' },
      { symbol: 'AVAX', value: 1500, change24h: -2.1, allocation: 13.0, chain: 'Avalanche' }
    ],
    chains: [
      { name: 'Ethereum', value: 6500, allocation: 56.5, color: '#627eea' },
      { name: 'Bitcoin', value: 3000, allocation: 26.1, color: '#f7931a' },
      { name: 'Solana', value: 2000, allocation: 17.4, color: '#9945ff' }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <TrendingUp className="w-8 h-8 text-green-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Portfolio Analytics
          </h2>
          <BarChart3 className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Track your cross-chain portfolio performance, asset allocation, and historical trends
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <span className={`text-sm ${portfolioData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.change24h >= 0 ? '+' : ''}{portfolioData.change24h}%
            </span>
          </div>
          <h3 className="text-sm text-gray-400 mb-2">Total Portfolio Value</h3>
          <p className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className={`text-sm ${portfolioData.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.change7d >= 0 ? '+' : ''}{portfolioData.change7d}%
            </span>
          </div>
          <h3 className="text-sm text-gray-400 mb-2">7-Day Change</h3>
          <p className="text-2xl font-bold">{portfolioData.change7d >= 0 ? '+' : ''}{portfolioData.change7d}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <span className={`text-sm ${portfolioData.change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.change30d >= 0 ? '+' : ''}{portfolioData.change30d}%
            </span>
          </div>
          <h3 className="text-sm text-gray-400 mb-2">30-Day Change</h3>
          <p className="text-2xl font-bold">{portfolioData.change30d >= 0 ? '+' : ''}{portfolioData.change30d}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 text-orange-400" />
            <span className="text-sm text-orange-400">Active</span>
          </div>
          <h3 className="text-sm text-gray-400 mb-2">Active Chains</h3>
          <p className="text-2xl font-bold">{portfolioData.chains.length}</p>
        </div>
      </div>

              {/* Asset Allocation & NFT Collateral Fusion */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                <span>Asset Allocation</span>
                <span className="text-sm text-purple-400">+ NFT Fusion</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAllocation(true)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    showAllocation ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Assets
                </button>
                <button
                  onClick={() => setShowAllocation(false)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    !showAllocation ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Chains
                </button>
                <button
                  onClick={() => setShowAllocation('nft')}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    showAllocation === 'nft' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  NFTs
                </button>
              </div>
            </div>
          </div>
        <div className="p-6">
          {showAllocation ? (
            <div className="space-y-4">
              {portfolioData.assets.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-lg font-medium">
                      {asset.symbol}
                    </div>
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-gray-400">{asset.chain}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${asset.value.toLocaleString()}</div>
                    <div className={`text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Allocation</div>
                    <div className="font-medium">{asset.allocation}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : showAllocation === 'nft' ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-medium mb-2">NFT Collateral Fusion</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Lock NFTs on one chain, borrow against them on another
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Locked NFTs</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Bored Ape #1234</span>
                        <span className="text-purple-400">$45,000</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Doodle #5678</span>
                        <span className="text-purple-400">$12,500</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h5 className="font-medium mb-2">Borrowing Power</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Available</span>
                        <span className="text-green-400">$28,875</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Used</span>
                        <span className="text-blue-400">$15,200</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Bridge NFT to Another Chain
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolioData.chains.map((chain, index) => (
                <div key={chain.name} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium"
                      style={{ backgroundColor: `${chain.color}20`, color: chain.color }}
                    >
                      {chain.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{chain.name}</div>
                      <div className="text-sm text-gray-400">Blockchain</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${chain.value.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Value</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Allocation</div>
                    <div className="font-medium">{chain.allocation}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Activity Tab Component
const ActivityTab: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deposits' | 'borrows' | 'repayments' | 'liquidations'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | 'all'>('7d');

  const activities = [
    {
      id: '1',
      type: 'deposit',
      asset: 'ETH',
      amount: 2.5,
      usdValue: 8000,
      chain: 'Ethereum',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'confirmed',
      txHash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'borrow',
      asset: 'USDC',
      amount: 5000,
      usdValue: 5000,
      chain: 'Avalanche',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'confirmed',
      txHash: '0xabcd...efgh'
    },
    {
      id: '3',
      type: 'repayment',
      asset: 'ZETA',
      amount: 1000,
      usdValue: 2500,
      chain: 'ZetaChain',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: 'confirmed',
      txHash: '0x9876...5432'
    },
    {
      id: '4',
      type: 'liquidation_warning',
      asset: 'SOL',
      amount: 25,
      usdValue: 1800,
      chain: 'Solana',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'warning',
      txHash: '0xdef0...1234'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <Coins className="w-5 h-5 text-green-400" />;
      case 'borrow': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'repayment': return <CheckCircle className="w-5 h-5 text-purple-400" />;
      case 'liquidation_warning': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'borrow': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'repayment': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'liquidation_warning': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (selectedFilter !== 'all' && activity.type !== selectedFilter) return false;
    if (selectedTimeframe === '1d') return activity.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (selectedTimeframe === '7d') return activity.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (selectedTimeframe === '30d') return activity.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Activity className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Activity Feed
          </h2>
          <Clock className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Monitor your cross-chain transactions, loan activities, and portfolio changes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Type</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Activities</option>
              <option value="deposits">Deposits</option>
              <option value="borrows">Borrows</option>
              <option value="repayments">Repayments</option>
              <option value="liquidations">Liquidations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Recent Activities</span>
          </h3>
        </div>
        <div className="p-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No activities found</p>
              <p className="text-sm">Try adjusting your filters or timeframe</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium capitalize">{activity.type.replace('_', ' ')}</span>
                          <span className="text-sm opacity-80">{activity.amount} {activity.asset}</span>
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded">on {activity.chain}</span>
                        </div>
                        <div className="text-sm opacity-80 mt-1">
                          {activity.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${activity.usdValue.toLocaleString()}</p>
                      <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        View TX
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    liquidationWarnings: true,
    priceAlerts: true,
    weeklyReports: false
  });
  const [riskPreferences, setRiskPreferences] = useState({
    maxLTV: 75,
    liquidationThreshold: 80,
    riskTolerance: 'moderate'
  });
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC'
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Settings className="w-8 h-8 text-gray-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent">
            Settings & Preferences
          </h2>
          <Shield className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Customize your experience, manage notifications, and configure risk preferences
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span>Notification Preferences</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-300">Communication Channels</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm">Email Notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm">Push Notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm">SMS Alerts</span>
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-300">Alert Types</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.liquidationWarnings}
                    onChange={(e) => setNotifications(prev => ({ ...prev, liquidationWarnings: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-line-500"
                  />
                  <span className="text-sm">Liquidation Warnings</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.priceAlerts}
                    onChange={(e) => setNotifications(prev => ({ ...prev, priceAlerts: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm">Price Alerts</span>
                </label>
                <label className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-300">Weekly Reports</h4>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Preferences */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Shield className="w-5 h-5 text-orange-400" />
            <span>Risk Management</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Max Loan-to-Value Ratio: {riskPreferences.maxLTV}%
              </label>
              <input
                type="range"
                min="50"
                max="90"
                value={riskPreferences.maxLTV}
                onChange={(e) => setRiskPreferences(prev => ({ ...prev, maxLTV: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Liquidation Threshold: {riskPreferences.liquidationThreshold}%
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={riskPreferences.liquidationThreshold}
                onChange={(e) => setRiskPreferences(prev => ({ ...prev, liquidationThreshold: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Risk Tolerance</label>
              <select
                value={riskPreferences.riskTolerance}
                onChange={(e) => setRiskPreferences(prev => ({ ...prev, riskTolerance: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-400" />
            <span>Display & Interface</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Theme</label>
              <select
                value={displaySettings.theme}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
              <select
                value={displaySettings.currency}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div>
              <label className="block text-2xl font-medium text-gray-400 mb-2">Language</label>
              <select
                value={displaySettings.language}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
              <select
                value={displaySettings.timezone}
                onChange={(e) => setDisplaySettings(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Social Lending Pools & Governance */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-400" />
            <span>Social Lending Pools & Governance</span>
            <Shield className="w-5 h-5 text-blue-400" />
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-400 mb-4">
            DAO-curated lending pools with cross-chain governance powered by ZetaChain.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-300">Active Proposals</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Increase ETH LTV to 80%</span>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Proposal to increase ETH collateral LTV ratio</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-blue-400">For: 67%</span>
                    <span className="text-red-400">Against: 23%</span>
                    <span className="text-gray-400">Abstain: 10%</span>
                  </div>
                  <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                    Vote
                  </button>
                </div>
                
                <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Add SOL as Collateral</span>
                    <span className="text-sm text-yellow-400">Pending</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Proposal to add Solana as supported collateral</p>
                  <div className="text-xs text-gray-400">Voting starts in 2 days</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-300">Community Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-sm">Total Voters</span>
                  <span className="font-medium text-blue-400">1,247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-sm">Active Pools</span>
                  <span className="font-medium text-green-400">8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-sm">Total TVL</span>
                  <span className="font-medium text-purple-400">$2.4M</span>
                </div>
              </div>
              
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Globe className="w-4 h-4 inline mr-2" />
                Create New Proposal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default WalletDashboardPage;
