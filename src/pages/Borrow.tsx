import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Calculator,
  BarChart3,
  Zap,
  Activity,
  CreditCard,
  Target,
  PieChart,
  Calendar,
  ArrowRight,
  Info,
  X,
  Copy,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface BorrowableAsset {
  symbol: string;
  name: string;
  icon: any;
  color: string;
  decimals: number;
  price: number;
  availableLiquidity: number;
  maxLoanToValue: number;
  baseInterestRate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface CreditProfile {
  creditScore: number;
  creditLimit: number;
  aiMaxBorrow: number;
  currentBorrowed: number;
  availableCredit: number;
  riskTier: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: Date;
}

interface LoanTerms {
  amount: number;
  duration: number; // months
  interestRate: number;
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  riskScore: number;
  liquidityRatio: number;
}

interface RepaymentSchedule {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface BorrowTransaction {
  id: string;
  asset: string;
  amount: number;
  duration: number;
  interestRate: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
  usdValue: number;
}

const Borrow = () => {
  const { address, isConnected } = useWallet();
  const [selectedAsset, setSelectedAsset] = useState<BorrowableAsset | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState(12);
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null);
  const [loanTerms, setLoanTerms] = useState<LoanTerms | null>(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentSchedule[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<BorrowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<BorrowTransaction | null>(null);
  const [validationError, setValidationError] = useState('');
  const [showRepaymentChart, setShowRepaymentChart] = useState(true);

  // Mock borrowable assets data
  const borrowableAssets: BorrowableAsset[] = [
    {
      symbol: 'ZETA',
      name: 'Zeta',
      icon: Zap,
      color: '#00d4aa',
      decimals: 18,
      price: 2.45,
      availableLiquidity: 5000000,
      maxLoanToValue: 75,
      baseInterestRate: 0.045,
      riskLevel: 'low'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: DollarSign,
      color: '#4cc9f0',
      decimals: 6,
      price: 1.00,
      availableLiquidity: 25000000,
      maxLoanToValue: 90,
      baseInterestRate: 0.038,
      riskLevel: 'low'
    },
    {
      symbol: 'DAI',
      name: 'Dai',
      icon: DollarSign,
      color: '#f7931a',
      decimals: 18,
      price: 1.00,
      availableLiquidity: 15000000,
      maxLoanToValue: 85,
      baseInterestRate: 0.042,
      riskLevel: 'low'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      icon: DollarSign,
      color: '#26a17b',
      decimals: 6,
      price: 1.00,
      availableLiquidity: 30000000,
      maxLoanToValue: 88,
      baseInterestRate: 0.040,
      riskLevel: 'low'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: TrendingUp,
      color: '#627eea',
      decimals: 18,
      price: 2500,
      availableLiquidity: 8000000,
      maxLoanToValue: 70,
      baseInterestRate: 0.055,
      riskLevel: 'medium'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      icon: TrendingUp,
      color: '#9945ff',
      decimals: 9,
      price: 93,
      availableLiquidity: 3000000,
      maxLoanToValue: 65,
      baseInterestRate: 0.065,
      riskLevel: 'medium'
    }
  ];

  // Loan duration options
  const durationOptions = [
    { value: 3, label: '3 months' },
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months' },
    { value: 18, label: '18 months' },
    { value: 24, label: '24 months' },
    { value: 36, label: '36 months' }
  ];

  // Load user data on component mount
  useEffect(() => {
    if (isConnected) {
      loadUserData();
      loadBorrowHistory();
    }
  }, [isConnected]);

  // Calculate loan terms when inputs change
  useEffect(() => {
    if (selectedAsset && loanAmount && creditProfile) {
      calculateLoanTerms();
    }
  }, [selectedAsset, loanAmount, loanDuration, creditProfile]);

  const loadUserData = async () => {
    // Mock credit profile - in production this would come from AI scoring
    const mockProfile: CreditProfile = {
      creditScore: 85,
      creditLimit: 10000,
      aiMaxBorrow: 8000,
      currentBorrowed: 2500,
      availableCredit: 7500,
      riskTier: 'good',
      lastUpdated: new Date()
    };
    setCreditProfile(mockProfile);
  };

  const loadBorrowHistory = async () => {
    // Mock borrow history
    const mockHistory: BorrowTransaction[] = [
      {
        id: '1',
        asset: 'USDC',
        amount: 1000,
        duration: 12,
        interestRate: 0.038,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        txHash: '0x1234567890abcdef',
        usdValue: 1000
      },
      {
        id: '2',
        asset: 'ZETA',
        amount: 500,
        duration: 6,
        interestRate: 0.045,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        txHash: '0x8765432109fedcba',
        usdValue: 1225
      }
    ];
    setBorrowHistory(mockHistory);
  };

  const calculateLoanTerms = () => {
    if (!selectedAsset || !loanAmount || !creditProfile) return;

    const amount = parseFloat(loanAmount);
    const duration = loanDuration;
    
    // Calculate dynamic interest rate based on risk and liquidity
    const riskScore = creditProfile.creditScore;
    const liquidityRatio = selectedAsset.availableLiquidity / 10000000; // Normalize to 10M
    
    const dynamicRate = calculateDynamicInterestRate(
      selectedAsset.baseInterestRate,
      riskScore,
      liquidityRatio,
      amount,
      creditProfile.currentBorrowed
    );

    // Calculate repayment schedule
    const schedule = calculateRepaymentSchedule(amount, dynamicRate, duration);
    
    const terms: LoanTerms = {
      amount,
      duration,
      interestRate: dynamicRate,
      monthlyPayment: schedule[0]?.payment || 0,
      totalRepayment: schedule.reduce((sum, payment) => sum + payment.payment, 0),
      totalInterest: schedule.reduce((sum, payment) => sum + payment.interest, 0),
      riskScore,
      liquidityRatio
    };

    setLoanTerms(terms);
    setRepaymentSchedule(schedule);
  };

  const calculateDynamicInterestRate = (
    baseRate: number,
    riskScore: number,
    liquidityRatio: number,
    loanAmount: number,
    currentBorrowed: number
  ): number => {
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
  };

  const calculateRepaymentSchedule = (
    principal: number,
    yearlyRate: number,
    months: number
  ): RepaymentSchedule[] => {
    const monthlyRate = yearlyRate / 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    
    const schedule: RepaymentSchedule[] = [];
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
  };

  const validateLoanRequest = (): string | null => {
    if (!selectedAsset) return 'Please select an asset to borrow';
    if (!loanAmount || parseFloat(loanAmount) <= 0) return 'Please enter a valid loan amount';
    
    const amount = parseFloat(loanAmount);
    if (amount > creditProfile!.aiMaxBorrow) return 'Amount exceeds AI-recommended maximum';
    if (amount > creditProfile!.availableCredit) return 'Amount exceeds available credit limit';
    if (amount > selectedAsset.availableLiquidity * 0.1) return 'Amount exceeds 10% of available liquidity';
    
    return null;
  };

  const handleBorrow = async () => {
    const error = validateLoanRequest();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError('');
    setIsLoading(true);
    
    const txId = `borrow_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const newTransaction: BorrowTransaction = {
      id: txId,
      asset: selectedAsset!.symbol,
      amount: parseFloat(loanAmount),
      duration: loanDuration,
      interestRate: loanTerms!.interestRate,
      status: 'pending',
      timestamp: new Date(),
      txHash: `0x${Math.random().toString(36).substring(2, 15)}`,
      usdValue: parseFloat(loanAmount) * selectedAsset!.price
    };

    setCurrentTransaction(newTransaction);
    setShowTransactionModal(true);
    setBorrowHistory(prev => [newTransaction, ...prev]);

    try {
      // Simulate ZetaChain cross-chain borrowing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update transaction status
      setBorrowHistory(prev => 
        prev.map(tx => 
          tx.id === txId ? { ...tx, status: 'confirmed' } : tx
        )
      );
      
      if (currentTransaction?.id === txId) {
        setCurrentTransaction(prev => prev ? { ...prev, status: 'confirmed' } : null);
      }
      
      // Reset form
      setSelectedAsset(null);
      setLoanAmount('');
      setLoanDuration(12);
      
    } catch (error) {
      console.error('Borrow failed:', error);
      setBorrowHistory(prev => 
        prev.map(tx => 
          tx.id === txId ? { ...tx, status: 'failed' } : tx
        )
      );
      
      if (currentTransaction?.id === txId) {
        setCurrentTransaction(prev => prev ? { ...prev, status: 'failed' } : null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRiskTierColor = (tier: string) => {
    switch (tier) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskTierIcon = (tier: string) => {
    switch (tier) {
      case 'excellent': return <CheckCircle size={16} className="text-green-400" />;
      case 'good': return <Shield size={16} className="text-blue-400" />;
      case 'fair': return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'poor': return <AlertTriangle size={16} className="text-red-400" />;
      default: return <Activity size={16} className="text-gray-400" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <Wallet size={64} className="mx-auto mb-6 text-gray-400" />
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to borrow assets</p>
      </div>
    );
  }

  if (!creditProfile) {
    return (
      <div className="text-center py-20">
        <RefreshCw size={64} className="mx-auto mb-6 text-gray-400 animate-spin" />
        <h2 className="text-2xl font-bold mb-4">Loading Credit Profile</h2>
        <p className="text-gray-400">Analyzing your creditworthiness...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Borrow Assets</h1>
        <p className="text-gray-400">Get instant loans across chains using your deposited collateral. Powered by ZetaChain's omnichain infrastructure and AI-powered credit scoring.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Borrow Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Credit Profile Summary */}
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Credit Profile</h3>
              <div className="flex items-center gap-2">
                {getRiskTierIcon(creditProfile.riskTier)}
                <span className={`text-sm font-medium ${getRiskTierColor(creditProfile.riskTier)}`}>
                  {creditProfile.riskTier.charAt(0).toUpperCase() + creditProfile.riskTier.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{creditProfile.creditScore}</div>
                <div className="text-xs text-gray-400">Credit Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  ${creditProfile.creditLimit.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Credit Limit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  ${creditProfile.aiMaxBorrow.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">AI Max Borrow</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  ${creditProfile.availableCredit.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Available Credit</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Info size={16} />
                <span>AI Recommendation: You can safely borrow up to ${creditProfile.aiMaxBorrow.toLocaleString()} based on your credit profile and market conditions.</span>
              </div>
            </div>
          </div>

          {/* Asset Selection */}
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Select Asset to Borrow</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {borrowableAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 border rounded-xl transition-all text-left ${
                    selectedAsset?.symbol === asset.symbol
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: asset.color + '20' }}
                    >
                      <asset.icon size={20} style={{ color: asset.color }} />
                    </div>
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-gray-400">{asset.name}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400">Rate</div>
                      <div className="font-medium">{(asset.baseInterestRate * 100).toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">LTV</div>
                      <div className="font-medium">{asset.maxLoanToValue}%</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Loan Details Form */}
          {selectedAsset && (
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Loan Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount to Borrow</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                      {selectedAsset.symbol}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Available: ${(creditProfile.availableCredit / selectedAsset.price).toFixed(2)} {selectedAsset.symbol}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Loan Duration</label>
                  <select
                    value={loanDuration}
                    onChange={(e) => setLoanDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {validationError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {validationError}
                </div>
              )}

              <button
                onClick={handleBorrow}
                disabled={isLoading || !loanAmount || !selectedAsset}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Borrow ${loanAmount || '0'} ${selectedAsset?.symbol || ''}`
                )}
              </button>
            </div>
          )}

          {/* Loan Terms Preview */}
          {loanTerms && (
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Loan Terms Preview</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(loanTerms.interestRate * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">Interest Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ${loanTerms.monthlyPayment.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">Monthly Payment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    ${loanTerms.totalRepayment.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">Total Repayment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    ${loanTerms.totalInterest.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">Total Interest</div>
                </div>
              </div>

              {/* Repayment Schedule Chart */}
              {showRepaymentChart && repaymentSchedule.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Repayment Schedule</h4>
                    <button
                      onClick={() => setShowRepaymentChart(!showRepaymentChart)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {showRepaymentChart ? 'Hide' : 'Show'} Details
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {repaymentSchedule.slice(0, 6).map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                        <span>Month {payment.month}</span>
                        <span className="text-green-400">${payment.payment.toFixed(2)}</span>
                      </div>
                    ))}
                    {repaymentSchedule.length > 6 && (
                      <div className="text-center text-gray-400 text-sm py-2">
                        +{repaymentSchedule.length - 6} more payments
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Cross-Chain Credit Delegation */}
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe size={20} className="text-blue-400" />
              Cross-Chain Credit
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-400">ETH.USDC</span>
                  <span className="text-sm text-white">$5,000</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-300">Cross-chain path</span>
                  <span className="text-xs text-yellow-400">Gas: 0.001 gaZETA</span>
                </div>
                <div className="w-full bg-blue-500/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-400">SOL.AVAX</span>
                  <span className="text-sm text-white">$2,500</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-purple-300">Cross-chain path</span>
                  <span className="text-xs text-yellow-400">Gas: 0.002 gaZETA</span>
                </div>
                <div className="w-full bg-purple-500/20 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-400">POL.BNB</span>
                  <span className="text-sm text-white">$1,000</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-green-300">Cross-chain path</span>
                  <span className="text-xs text-yellow-400">Gas: 0.0015 gaZETA</span>
                </div>
                <div className="w-full bg-green-500/20 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <button className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                Delegate Credit
              </button>
              <button className="w-full px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm">
                Manage Credit Lines
              </button>
            </div>
          </div>

          {/* Borrow History */}
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Borrows</h3>
            
            <div className="space-y-3">
              {borrowHistory.slice(0, 3).map((tx) => (
                <div key={tx.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{tx.asset}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.amount} {tx.asset} • {tx.duration} months
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {tx.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            
            {borrowHistory.length > 3 && (
              <button className="w-full mt-4 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                View All ({borrowHistory.length})
              </button>
            )}
          </div>

          {/* Risk Management */}
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield size={20} className="text-yellow-400" />
              Risk Management
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={12} className="text-yellow-400" />
                <span>Auto-Liquidation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={12} className="text-yellow-400" />
                <span>Risk Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && currentTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Borrow Transaction</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  {currentTransaction.status === 'pending' ? (
                    <RefreshCw size={32} className="text-primary animate-spin" />
                  ) : currentTransaction.status === 'confirmed' ? (
                    <CheckCircle size={32} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={32} className="text-red-400" />
                  )}
                </div>
                <div className="text-lg font-medium mb-2">
                  {currentTransaction.status === 'pending' && 'Processing Borrow Request...'}
                  {currentTransaction.status === 'confirmed' && 'Borrow Confirmed!'}
                  {currentTransaction.status === 'failed' && 'Borrow Failed'}
                </div>
                <div className="text-gray-400">
                  {currentTransaction.amount} {currentTransaction.asset} for {currentTransaction.duration} months
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span>{currentTransaction.amount} {currentTransaction.asset}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration:</span>
                  <span>{currentTransaction.duration} months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Interest Rate:</span>
                  <span>{(currentTransaction.interestRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Value:</span>
                  <span>${currentTransaction.usdValue.toLocaleString()}</span>
                </div>
                {currentTransaction.txHash && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tx Hash:</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://explorer.zetachain.com/cc/tx/${currentTransaction.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-400 hover:text-blue-300 transition-colors"
                        title="View on ZetaScan"
                      >
                        {currentTransaction.txHash.substring(0, 8)}...
                      </a>
                      <button
                        onClick={() => copyToClipboard(currentTransaction.txHash!)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Copy Transaction Hash"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {currentTransaction.status === 'confirmed' && (
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrow;
