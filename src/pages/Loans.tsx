import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Shield,
  Plus,
  Minus,
  Eye,
  BarChart3,
  Bell,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Brain,
  RefreshCw
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface Loan {
  id: string;
  principal: number; // in USD
  interestRate: number; // annual rate as %
  dueDate: string; // ISO string
  collateralAsset: string;
  collateralChain: string;
  collateralValue: number; // USD value of collateral
  liquidationRisk: number; // 0-100 %
  healthStatus: 'healthy' | 'warning' | 'critical';
  interestPaidHistory: { date: string; amount: number; txHash: string }[];
  totalInterestPaid: number;
  remainingBalance: number;
  loanToValue: number; // LTV ratio
  marginCallThreshold: number;
  liquidationThreshold: number;
}

interface Notification {
  id: string;
  type: 'margin_call' | 'liquidation_warning' | 'payment_due' | 'collateral_update';
  message: string;
  timestamp: Date;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const Loans = () => {
  const { address, isConnected } = useWallet();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState<'loans' | 'perpetual' | 'analytics'>('loans');

  // Mock loan data - replace with real API calls
  useEffect(() => {
    const mockLoans: Loan[] = [
      {
        id: 'LOAN-001',
        principal: 5000,
        interestRate: 8.5,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        collateralAsset: 'ETH',
        collateralChain: 'Ethereum',
        collateralValue: 8500,
        liquidationRisk: 35,
        healthStatus: 'healthy',
        interestPaidHistory: [
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), amount: 35.42, txHash: '0x123...abc' },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 35.42, txHash: '0x456...def' }
        ],
        totalInterestPaid: 70.84,
        remainingBalance: 5000,
        loanToValue: 58.8,
        marginCallThreshold: 75,
        liquidationThreshold: 85
      },
      {
        id: 'LOAN-002',
        principal: 12000,
        interestRate: 12.2,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        collateralAsset: 'BTC',
        collateralChain: 'Bitcoin',
        collateralValue: 18000,
        liquidationRisk: 68,
        healthStatus: 'warning',
        interestPaidHistory: [
          { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), amount: 122.00, txHash: '0x789...ghi' }
        ],
        totalInterestPaid: 122.00,
        remainingBalance: 12000,
        loanToValue: 66.7,
        marginCallThreshold: 75,
        liquidationThreshold: 85
      },
      {
        id: 'LOAN-003',
        principal: 8000,
        interestRate: 15.8,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        collateralAsset: 'SOL',
        collateralChain: 'Solana',
        collateralValue: 10000,
        liquidationRisk: 82,
        healthStatus: 'critical',
        interestPaidHistory: [],
        totalInterestPaid: 0,
        remainingBalance: 8000,
        loanToValue: 80.0,
        marginCallThreshold: 75,
        liquidationThreshold: 85
      }
    ];
    setLoans(mockLoans);
  }, []);



  const handleAddCollateral = async () => {
    if (!selectedLoanId || !collateralAmount) {
      alert('Please select a loan and enter collateral amount');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update loan collateral value (mock)
      setLoans(prev => prev.map(loan => 
        loan.id === selectedLoanId 
          ? { ...loan, collateralValue: loan.collateralValue + parseFloat(collateralAmount) * 1.5 }
          : loan
      ));



      setCollateralAmount('');
      alert('Collateral added successfully!');
    } catch (error) {
      alert('Failed to add collateral. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!selectedLoanId || !repayAmount) {
      alert('Please select a loan and enter repayment amount');
      return;
    }

    const loan = loans.find(l => l.id === selectedLoanId);
    if (!loan) return;

    if (parseFloat(repayAmount) > loan.remainingBalance) {
      alert('Repayment amount cannot exceed remaining balance');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update loan (mock)
      setLoans(prev => prev.map(l => 
        l.id === selectedLoanId 
          ? { 
              ...l, 
              remainingBalance: l.remainingBalance - parseFloat(repayAmount),
              interestPaidHistory: [
                ...l.interestPaidHistory,
                { 
                  date: new Date().toISOString(), 
                  amount: parseFloat(repayAmount), 
                  txHash: `0x${Math.random().toString(16).substr(2, 64)}` 
                }
              ]
            }
          : l
      ));



      setRepayAmount('');
      alert('Repayment successful!');
    } catch (error) {
      alert('Failed to process repayment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk > 80) return 'bg-red-500';
    if (risk > 60) return 'bg-yellow-500';
    if (risk > 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
          <p className="text-gray-600">Please connect your wallet to view your loans</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Loan Management</h1>
          <p className="text-gray-300">Reduce debt and improve health across all chains. Monitor loan health and manage repayments with AI-powered risk insights.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'loans' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Active Loans</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('perpetual')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'perpetual' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Perpetual Loans</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Portfolio Analytics</span>
            </div>
          </button>
        </div>

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            {/* Loans Table */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6">Active Loans</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Loan ID</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Principal</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Interest Rate</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Due Date</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Collateral</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Risk Score</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Health</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-mono text-blue-400">{loan.id}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white font-semibold">${loan.principal.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Remaining: ${loan.remainingBalance.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{loan.interestRate}%</div>
                          <div className="text-sm text-gray-400">APR</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{new Date(loan.dueDate).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-400">
                            {Math.ceil((new Date(loan.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-white">{loan.collateralAsset}</div>
                          <div className="text-sm text-gray-400">{loan.collateralChain}</div>
                          <div className="text-xs text-gray-500">${loan.collateralValue.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getRiskColor(loan.liquidationRisk)} transition-all duration-300`}
                                style={{ width: `${loan.liquidationRisk}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${
                              loan.liquidationRisk > 80 ? 'text-red-400' :
                              loan.liquidationRisk > 60 ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {loan.liquidationRisk}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(loan.healthStatus)}`}>
                            {loan.healthStatus.charAt(0).toUpperCase() + loan.healthStatus.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedLoanId(loan.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Loan Management Panel */}
            {selectedLoanId && (() => {
              const selectedLoan = loans.find(l => l.id === selectedLoanId);
              if (!selectedLoan) return null;
              
              return (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Manage Loan: {selectedLoanId}
                    </h3>
                    <button
                      onClick={() => setSelectedLoanId(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Add Collateral */}
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-green-400" />
                        Add Collateral
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Amount (USDC)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={collateralAmount}
                            onChange={(e) => setCollateralAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          onClick={handleAddCollateral}
                          disabled={isLoading || !collateralAmount}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Collateral
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Repay Loan */}
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Minus className="w-5 h-5 mr-2 text-blue-400" />
                        Repay Loan
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Amount (USDC)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={repayAmount}
                            onChange={(e) => setRepayAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          onClick={handleRepay}
                          disabled={isLoading || !repayAmount}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Minus className="w-4 h-4 mr-2" />
                              Repay
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Loan Analytics */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showAnalytics ? 'Hide' : 'Show'} Detailed Analytics
                    </button>
                    
                    {showAnalytics && (
                      <div className="mt-4 bg-slate-800/50 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-white mb-4">Loan Analytics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">LTV Ratio</div>
                            <div className="text-white font-medium">{selectedLoan.loanToValue}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Margin Call</div>
                            <div className="text-white font-medium">{selectedLoan.marginCallThreshold}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Liquidation</div>
                            <div className="text-white font-medium">{selectedLoan.liquidationThreshold}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Total Interest Paid</div>
                            <div className="text-white font-medium">${selectedLoan.totalInterestPaid.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}



        {/* Perpetual Loans Tab */}
        {activeTab === 'perpetual' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span>Perpetual Cross-Chain Loans</span>
              <Brain className="w-6 h-6 text-purple-400" />
            </h2>
            <p className="text-gray-400 mb-6">
              Unlimited loan terms with AI-powered auto-refinancing across chains. Gemini monitors rates and automatically refinances to cheaper chains.
            </p>
            
            {/* Auto-Refinancing Setup */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Auto-Refinancing Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Rate Difference Threshold
                  </label>
                  <input
                    type="number"
                    placeholder="0.5"
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">% difference to trigger refinancing</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Max Gas Fee
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">USD max for gas costs</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Preferred Chains
                  </label>
                  <select className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white">
                    <option>Ethereum, Solana, Avalanche</option>
                    <option>Solana, Ethereum, Base</option>
                    <option>Base, Solana, ZetaChain</option>
                  </select>
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Zap className="w-4 h-4 inline mr-2" />
                Enable Auto-Refinancing
              </button>
            </div>

            {/* Refinancing History */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Recent Refinancing Events</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">ETH Loan Refinanced</p>
                      <p className="text-sm text-gray-400">Ethereum → Solana (Rate: 4.2% → 3.1%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400">$2,100 saved</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">SOL Loan Refinanced</p>
                      <p className="text-sm text-gray-400">Solana → Base (Rate: 5.8% → 4.9%)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-400">$890 saved</p>
                    <p className="text-xs text-gray-400">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Portfolio Analytics</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Loans</p>
                    <p className="text-2xl font-bold text-white">{loans.length}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Principal</p>
                    <p className="text-2xl font-bold text-white">
                      ${loans.reduce((sum, loan) => sum + loan.principal, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Interest Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {(loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length).toFixed(1)}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                {loans.map(loan => (
                  <div key={loan.id} className="flex items-center justify-between">
                    <span className="text-gray-300">{loan.id}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getRiskColor(loan.liquidationRisk)} transition-all duration-300`}
                          style={{ width: `${loan.liquidationRisk}%` }}
                        />
                      </div>
                      <span className="text-white text-sm w-12">{loan.liquidationRisk}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loans;
