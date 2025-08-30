import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  Globe,
  DollarSign,
  Users,
  Clock,
  RefreshCw,
  Eye,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';

interface LiquidityStats {
  chain: string;
  liquidity: number;
  change24h: number;
  totalUsers: number;
  avgAPY: number;
  utilization: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface RiskModelData {
  month: string;
  avgCreditScore: number;
  liquidations: number;
  borrowRepayments: number;
  defaultRate: number;
  marketVolatility: number;
}

interface InterestRateTrends {
  month: string;
  ethereum: number;
  avalanche: number;
  solana: number;
  polygon: number;
  base: number;
  zetachain: number;
}

interface ProtocolHealth {
  overallScore: number;
  liquidityHealth: number;
  creditHealth: number;
  marketHealth: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

interface UserRiskProfile {
  creditScore: number;
  liquidationRisk: number;
  portfolioDiversification: number;
  repaymentHistory: number;
  collateralQuality: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  optimizationTips: string[];
}

const Analytics = () => {
  const { address, isConnected } = useWallet();
  const [selectedChain, setSelectedChain] = useState('all');
  const [timeRange, setTimeRange] = useState('6M');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'trends' | 'profile'>('overview');

  // Mock data - replace with real API calls
  const [liquidityStats, setLiquidityStats] = useState<LiquidityStats[]>([]);
  const [riskModelData, setRiskModelData] = useState<RiskModelData[]>([]);
  const [interestRateTrends, setInterestRateTrends] = useState<InterestRateTrends[]>([]);
  const [protocolHealth, setProtocolHealth] = useState<ProtocolHealth | null>(null);
  const [userRiskProfile, setUserRiskProfile] = useState<UserRiskProfile | null>(null);

  useEffect(() => {
    if (isConnected) {
      loadAnalyticsData();
    }
  }, [isConnected, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock liquidity stats
      const mockLiquidityStats: LiquidityStats[] = [
        { chain: 'Ethereum', liquidity: 1500, change24h: 2.5, totalUsers: 12500, avgAPY: 8.2, utilization: 78, status: 'healthy' },
        { chain: 'Avalanche', liquidity: 850, change24h: -1.2, totalUsers: 6800, avgAPY: 9.1, utilization: 82, status: 'healthy' },
        { chain: 'Solana', liquidity: 500, change24h: 5.8, totalUsers: 4200, avgAPY: 7.8, utilization: 65, status: 'warning' },
        { chain: 'Base', liquidity: 300, change24h: 12.3, totalUsers: 2800, avgAPY: 10.5, utilization: 45, status: 'healthy' },
        { chain: 'Polygon', liquidity: 420, change24h: 3.1, totalUsers: 3500, avgAPY: 8.9, utilization: 71, status: 'healthy' },
        { chain: 'ZetaChain', liquidity: 400, change24h: 8.7, totalUsers: 1800, avgAPY: 11.2, utilization: 38, status: 'healthy' }
      ];
      setLiquidityStats(mockLiquidityStats);

      // Mock risk model data
      const mockRiskModelData: RiskModelData[] = [
        { month: 'Jan', avgCreditScore: 78, liquidations: 4, borrowRepayments: 70, defaultRate: 2.1, marketVolatility: 15 },
        { month: 'Feb', avgCreditScore: 80, liquidations: 5, borrowRepayments: 75, defaultRate: 1.9, marketVolatility: 18 },
        { month: 'Mar', avgCreditScore: 82, liquidations: 3, borrowRepayments: 80, defaultRate: 1.7, marketVolatility: 12 },
        { month: 'Apr', avgCreditScore: 81, liquidations: 4, borrowRepayments: 85, defaultRate: 1.8, marketVolatility: 16 },
        { month: 'May', avgCreditScore: 83, liquidations: 2, borrowRepayments: 88, defaultRate: 1.5, marketVolatility: 14 },
        { month: 'Jun', avgCreditScore: 85, liquidations: 1, borrowRepayments: 92, defaultRate: 1.2, marketVolatility: 11 }
      ];
      setRiskModelData(mockRiskModelData);

      // Mock interest rate trends
      const mockInterestRateTrends: InterestRateTrends[] = [
        { month: 'Jan', ethereum: 0.052, avalanche: 0.048, solana: 0.055, polygon: 0.049, base: 0.061, zetachain: 0.058 },
        { month: 'Feb', ethereum: 0.054, avalanche: 0.050, solana: 0.053, polygon: 0.051, base: 0.059, zetachain: 0.056 },
        { month: 'Mar', ethereum: 0.051, avalanche: 0.047, solana: 0.054, polygon: 0.048, base: 0.057, zetachain: 0.054 },
        { month: 'Apr', ethereum: 0.053, avalanche: 0.049, solana: 0.052, polygon: 0.050, base: 0.055, zetachain: 0.052 },
        { month: 'May', ethereum: 0.050, avalanche: 0.046, solana: 0.051, polygon: 0.047, base: 0.053, zetachain: 0.050 },
        { month: 'Jun', ethereum: 0.048, avalanche: 0.044, solana: 0.049, polygon: 0.045, base: 0.051, zetachain: 0.048 }
      ];
      setInterestRateTrends(mockInterestRateTrends);

      // Mock protocol health
      const mockProtocolHealth: ProtocolHealth = {
        overallScore: 87,
        liquidityHealth: 92,
        creditHealth: 85,
        marketHealth: 78,
        riskLevel: 'low',
        lastUpdated: new Date().toISOString()
      };
      setProtocolHealth(mockProtocolHealth);

      // Mock user risk profile
      const mockUserRiskProfile: UserRiskProfile = {
        creditScore: 82,
        liquidationRisk: 15,
        portfolioDiversification: 78,
        repaymentHistory: 95,
        collateralQuality: 88,
        riskLevel: 'low',
        recommendedActions: [
          'Add collateral to optimize borrowing power',
          'Maintain repayments on time to improve credit score',
          'Monitor volatile collateral assets closely',
          'Consider diversifying across more stable assets'
        ],
        optimizationTips: [
          'Your credit score is above average - leverage this for better rates',
          'Portfolio diversification could be improved by adding more stable assets',
          'Excellent repayment history - maintain this to unlock premium features',
          'Consider increasing collateral on high-volatility positions'
        ]
      };
      setUserRiskProfile(mockUserRiskProfile);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Helper function to get chain colors for charts
  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'Ethereum': return '#3b82f6';
      case 'Avalanche': return '#10b981';
      case 'Solana': return '#f59e0b';
      case 'Polygon': return '#8b5cf6';
      case 'Base': return '#ef4444';
      case 'ZetaChain': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  // Generate mock liquidity trends data for the area chart
  const generateLiquidityTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      ethereum: 1500 + Math.random() * 200 - 100,
      avalanche: 850 + Math.random() * 150 - 75,
      solana: 500 + Math.random() * 100 - 50,
      polygon: 420 + Math.random() * 80 - 40,
      base: 300 + Math.random() * 60 - 30,
      zetachain: 400 + Math.random() * 70 - 35
    }));
  };

  const filteredLiquidityStats = selectedChain === 'all' 
    ? liquidityStats 
    : liquidityStats.filter(stat => stat.chain === selectedChain);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view analytics and insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics & Insights</h1>
          <p className="text-gray-300">Cross-chain liquidity analytics, AI risk modeling, and personalized optimization insights</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'risk' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Risk Analysis</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'trends' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Market Trends</span>
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
              <Target className="w-4 h-4" />
              <span>Risk Profile</span>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
          >
            <option value="all">All Chains</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Avalanche">Avalanche</option>
            <option value="Solana">Solana</option>
            <option value="Base">Base</option>
            <option value="Polygon">Polygon</option>
            <option value="ZetaChain">ZetaChain</option>
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
          </select>

          <button
            onClick={loadAnalyticsData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading analytics data...</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !isLoading && (
          <div className="space-y-8">
            {/* Cross-chain Liquidity Stats */}
            <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white flex items-center">
                  <Globe className="w-6 h-6 mr-3" />
                  Cross-Chain Aggregated Liquidity
                </h3>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(filteredLiquidityStats.reduce((sum, stat) => sum + stat.liquidity, 0))}
                  </p>
                  <p className="text-sm text-gray-400">Total Liquidity</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLiquidityStats.map((stat) => (
                  <div key={stat.chain} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-white">{stat.chain}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stat.status)}`}>
                        {stat.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Liquidity:</span>
                        <span className="text-white font-semibold">{formatCurrency(stat.liquidity)}M</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">24h Change:</span>
                        <span className={`font-semibold ${stat.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change24h >= 0 ? '+' : ''}{stat.change24h}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Users:</span>
                        <span className="text-white">{stat.totalUsers.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg APY:</span>
                        <span className="text-green-400 font-semibold">{stat.avgAPY}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Utilization:</span>
                        <span className="text-white">{stat.utilization}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Protocol Health Overview */}
            {protocolHealth && (
              <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3" />
                  Protocol Health Overview
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{protocolHealth.overallScore}</div>
                    <div className="text-gray-400">Overall Score</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">{protocolHealth.liquidityHealth}</div>
                    <div className="text-gray-400">Liquidity Health</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">{protocolHealth.creditHealth}</div>
                    <div className="text-gray-400">Credit Health</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">{protocolHealth.marketHealth}</div>
                    <div className="text-gray-400">Market Health</div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskLevelColor(protocolHealth.riskLevel)}`}>
                    Risk Level: {protocolHealth.riskLevel.charAt(0).toUpperCase() + protocolHealth.riskLevel.slice(1)}
                  </span>
                  <p className="text-gray-400 text-sm mt-2">
                    Last updated: {new Date(protocolHealth.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Risk Analysis Tab */}
        {activeTab === 'risk' && !isLoading && (
          <div className="space-y-8">
            {/* AI Risk Modeling Dashboard */}
            <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-3" />
                AI Risk Modeling Trends
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Credit Score & Liquidations Chart */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">Credit Score & Liquidations</h4>
                  <div className="h-64 bg-slate-900/50 rounded p-4">
                    <ErrorBoundary fallback={
                      <div className="text-center text-gray-400 py-16">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Chart temporarily unavailable</p>
                        <p className="text-sm">Please refresh the page</p>
                      </div>
                    }>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={riskModelData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="avgCreditScore" fill="#10b981" name="Credit Score" />
                          <Bar dataKey="liquidations" fill="#ef4444" name="Liquidations" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ErrorBoundary>
                  </div>
                </div>
                
                {/* Risk Metrics */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-3">Risk Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Credit Score:</span>
                        <span className="text-white font-semibold">
                          {riskModelData[riskModelData.length - 1]?.avgCreditScore || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Liquidations:</span>
                        <span className="text-red-400 font-semibold">
                          {riskModelData.reduce((sum, data) => sum + data.liquidations, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Default Rate:</span>
                        <span className="text-yellow-400 font-semibold">
                          {(riskModelData.reduce((sum, data) => sum + data.defaultRate, 0) / riskModelData.length).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Market Volatility:</span>
                        <span className="text-blue-400 font-semibold">
                          {(riskModelData.reduce((sum, data) => sum + data.marketVolatility, 0) / riskModelData.length).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-3">Trend Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Credit scores improving over time
                      </div>
                      <div className="flex items-center text-red-400">
                        <TrendingDown className="w-4 h-4 mr-2" />
                        Liquidations decreasing
                      </div>
                      <div className="flex items-center text-blue-400">
                        <Activity className="w-4 h-4 mr-2" />
                        Market volatility stabilizing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Portfolio Distribution Pie Chart */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">Portfolio Distribution</h4>
                  <div className="h-64 bg-slate-900/50 rounded p-4">
                    <ErrorBoundary fallback={
                      <div className="text-center text-gray-400 py-16">
                        <PieChart className="w-12 h-12 mx-auto mb-2" />
                        <p>Chart temporarily unavailable</p>
                        <p className="text-sm">Please refresh the page</p>
                      </div>
                    }>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={liquidityStats.map(stat => ({
                              name: stat.chain,
                              value: stat.liquidity,
                              fill: getChainColor(stat.chain)
                            }))}
                            cx="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {liquidityStats.map((stat, index) => (
                              <Cell key={`cell-${index}`} fill={getChainColor(stat.chain)} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </ErrorBoundary>
                  </div>
                </div>
                
                {/* Liquidity Trends Area Chart */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">Liquidity Trends (6 Months)</h4>
                  <div className="h-64 bg-slate-900/50 rounded p-4">
                    <ErrorBoundary fallback={
                      <div className="text-center text-gray-400 py-16">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                        <p>Chart temporarily unavailable</p>
                        <p className="text-sm">Please refresh the page</p>
                      </div>
                    }>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={generateLiquidityTrends()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #475569',
                              borderRadius: '8px',
                              color: '#f1f5f9'
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="ethereum" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Ethereum" />
                          <Area type="monotone" dataKey="avalanche" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Avalanche" />
                          <Area type="monotone" dataKey="solana" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Solana" />
                          <Area type="monotone" dataKey="polygon" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Polygon" />
                          <Area type="monotone" dataKey="base" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Base" />
                          <Area type="monotone" dataKey="zetachain" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="ZetaChain" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Market Trends Tab */}
        {activeTab === 'trends' && !isLoading && (
          <div className="space-y-8">
            {/* Dynamic Interest Rate Trends */}
            <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3" />
                Dynamic Interest Rate Trends
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">Select Chain for Detailed View:</label>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white w-48"
                >
                  <option value="all">All Chains Overview</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Avalanche">Avalanche</option>
                  <option value="Solana">Solana</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Base">Base</option>
                  <option value="ZetaChain">ZetaChain</option>
                </select>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="h-80 bg-slate-900/50 rounded p-4">
                  <ErrorBoundary fallback={
                    <div className="text-center text-gray-400 py-20">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg">Chart temporarily unavailable</p>
                      <p className="text-sm">Please refresh the page</p>
                    </div>
                  }>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={interestRateTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#f1f5f9'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="ethereum" stroke="#3b82f6" strokeWidth={2} name="Ethereum" />
                        <Line type="monotone" dataKey="avalanche" stroke="#10b981" strokeWidth={2} name="Avalanche" />
                        <Line type="monotone" dataKey="solana" stroke="#f59e0b" strokeWidth={2} name="Solana" />
                        <Line type="monotone" dataKey="polygon" stroke="#8b5cf6" strokeWidth={2} name="Polygon" />
                        <Line type="monotone" dataKey="base" stroke="#ef4444" strokeWidth={2} name="Base" />
                        <Line type="monotone" dataKey="zetachain" stroke="#06b6d4" strokeWidth={2} name="ZetaChain" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ErrorBoundary>
                </div>
              </div>
              
              {/* Rate Summary Table */}
              <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-4">Current Interest Rates</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {['Ethereum', 'Avalanche', 'Solana', 'Polygon', 'Base', 'ZetaChain'].map((chain) => {
                    const latestRate = interestRateTrends[interestRateTrends.length - 1];
                    const chainKey = chain.toLowerCase() as 'ethereum' | 'avalanche' | 'solana' | 'polygon' | 'base' | 'zetachain';
                    const rate = latestRate ? latestRate[chainKey] : 0;
                    return (
                      <div key={chain} className="text-center">
                        <div className="text-sm text-gray-400">{chain}</div>
                        <div className="text-lg font-semibold text-white">{(Number(rate) * 100).toFixed(2)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Risk Profile Tab */}
        {activeTab === 'profile' && !isLoading && userRiskProfile && (
          <div className="space-y-8">
            {/* User Risk Profile Summary */}
            <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3" />
                Your Personalized Risk Profile
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Risk Metrics */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Risk Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Credit Score</span>
                          <span className="text-white font-semibold">{userRiskProfile.creditScore}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(userRiskProfile.creditScore / 100) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Liquidation Risk</span>
                          <span className="text-white font-semibold">{userRiskProfile.liquidationRisk}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${userRiskProfile.liquidationRisk}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Portfolio Diversification</span>
                          <span className="text-white font-semibold">{userRiskProfile.portfolioDiversification}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${userRiskProfile.portfolioDiversification}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Repayment History</span>
                          <span className="text-white font-semibold">{userRiskProfile.repaymentHistory}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${userRiskProfile.repaymentHistory}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Collateral Quality</span>
                          <span className="text-white font-semibold">{userRiskProfile.collateralQuality}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${userRiskProfile.collateralQuality}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Risk Level & Actions */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-4">Risk Assessment</h4>
                    <div className="text-center mb-4">
                      <span className={`px-4 py-2 rounded-full text-lg font-medium ${getRiskLevelColor(userRiskProfile.riskLevel)}`}>
                        {userRiskProfile.riskLevel.charAt(0).toUpperCase() + userRiskProfile.riskLevel.slice(1)} Risk
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm text-center">
                      Your portfolio shows a {userRiskProfile.riskLevel} risk profile based on current market conditions and your borrowing behavior.
                    </p>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                        Add Collateral
                      </button>
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors">
                        Repay Loan
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm transition-colors">
                        Diversify Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recommendations & Tips */}
            <section className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-3" />
                AI-Powered Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recommended Actions */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-3">
                    {userRiskProfile.recommendedActions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Optimization Tips */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
                    Optimization Tips
                  </h4>
                  <ul className="space-y-3">
                    {userRiskProfile.optimizationTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-300">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
