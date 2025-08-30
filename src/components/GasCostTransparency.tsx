import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  Zap, 
  Calculator, 
  BarChart3, 
  Clock,
  Network,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Settings,
  PieChart,
  Activity,
  TrendingUp,
  Wallet,
  GasPump
} from 'lucide-react';

interface GasCost {
  chainId: string;
  chainName: string;
  gasPrice: number;
  gasLimit: number;
  estimatedCost: number;
  currency: string;
  lastUpdated: string;
  networkStatus: 'fast' | 'normal' | 'slow' | 'congested';
}

interface TransactionType {
  id: string;
  name: string;
  description: string;
  estimatedGas: number;
  complexity: 'low' | 'medium' | 'high';
  optimizationTips: string[];
  batchable: boolean;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  potentialSavings: number;
  implementation: string;
  risk: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'advanced';
}

const GasCostTransparency: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'costs' | 'optimization' | 'strategies'>('overview');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const gasCosts: GasCost[] = [
    {
      chainId: '1',
      chainName: 'Ethereum',
      gasPrice: 25,
      gasLimit: 21000,
      estimatedCost: 0.000525,
      currency: 'ETH',
      lastUpdated: '2024-01-15T10:30:00Z',
      networkStatus: 'normal'
    },
    {
      chainId: '137',
      chainName: 'Polygon',
      gasPrice: 30,
      gasLimit: 21000,
      estimatedCost: 0.00063,
      currency: 'MATIC',
      lastUpdated: '2024-01-15T10:30:00Z',
      networkStatus: 'fast'
    },
    {
      chainId: '56',
      chainName: 'BSC',
      gasPrice: 5,
      gasLimit: 21000,
      estimatedCost: 0.000105,
      currency: 'BNB',
      lastUpdated: '2024-01-15T10:30:00Z',
      networkStatus: 'fast'
    },
    {
      chainId: '8453',
      chainName: 'Base',
      gasPrice: 0.1,
      gasLimit: 21000,
      estimatedCost: 0.0000021,
      currency: 'ETH',
      lastUpdated: '2024-01-15T10:30:00Z',
      networkStatus: 'fast'
    },
    {
      chainId: '43114',
      chainName: 'Avalanche',
      gasPrice: 25,
      gasLimit: 21000,
      estimatedCost: 0.000525,
      currency: 'AVAX',
      lastUpdated: '2024-01-15T10:30:00Z',
      networkStatus: 'normal'
    }
  ];

  const transactionTypes: TransactionType[] = [
    {
      id: 'simple-transfer',
      name: 'Simple Transfer',
      description: 'Basic token transfer between addresses',
      estimatedGas: 21000,
      complexity: 'low',
      optimizationTips: [
        'Use optimal gas price based on network conditions',
        'Consider batching multiple transfers',
        'Choose less congested networks for lower costs'
      ],
      batchable: true
    },
    {
      id: 'token-approval',
      name: 'Token Approval',
      description: 'Approve smart contract to spend tokens',
      estimatedGas: 46000,
      complexity: 'low',
      optimizationTips: [
        'Set approval amount to exact needed value',
        'Use infinite approval only when necessary',
        'Batch approvals with other operations'
      ],
      batchable: true
    },
    {
      id: 'cross-chain-bridge',
      name: 'Cross-Chain Bridge',
      description: 'Transfer assets between different blockchains',
      estimatedGas: 150000,
      complexity: 'high',
      optimizationTips: [
        'Use ZetaChain for gas-efficient bridging',
        'Batch multiple bridge operations',
        'Choose optimal bridge timing based on gas prices'
      ],
      batchable: false
    },
    {
      id: 'lending-operation',
      name: 'Lending Operation',
      description: 'Deposit, borrow, or repay on lending protocols',
      estimatedGas: 120000,
      complexity: 'medium',
      optimizationTips: [
        'Combine multiple operations in single transaction',
        'Use flash loans for complex operations',
        'Optimize gas usage with proper parameter encoding'
      ],
      batchable: true
    },
    {
      id: 'ai-risk-assessment',
      name: 'AI Risk Assessment',
      description: 'AI-powered security analysis and threat detection',
      estimatedGas: 80000,
      complexity: 'medium',
      optimizationTips: [
        'Batch multiple assessments together',
        'Use off-chain computation when possible',
        'Optimize AI model parameters for gas efficiency'
      ],
      batchable: true
    }
  ];

  const optimizationStrategies: OptimizationStrategy[] = [
    {
      id: 'transaction-batching',
      name: 'Transaction Batching',
      description: 'Combine multiple operations into single transaction to reduce total gas costs',
      potentialSavings: 40,
      implementation: 'Use multicall contracts to batch multiple function calls',
      risk: 'low',
      complexity: 'simple'
    },
    {
      id: 'off-chain-computation',
      name: 'Off-Chain Computation',
      description: 'Perform complex calculations off-chain and submit only results to blockchain',
      potentialSavings: 60,
      implementation: 'Use zero-knowledge proofs for off-chain AI computations',
      risk: 'medium',
      complexity: 'advanced'
    },
    {
      id: 'gas-price-optimization',
      name: 'Gas Price Optimization',
      description: 'Dynamically adjust gas prices based on network conditions and urgency',
      potentialSavings: 25,
      implementation: 'Real-time gas price monitoring and dynamic adjustment',
      risk: 'low',
      complexity: 'moderate'
    },
    {
      id: 'layer-2-migration',
      name: 'Layer 2 Migration',
      description: 'Move operations to Layer 2 solutions for significantly lower gas costs',
      potentialSavings: 80,
      implementation: 'Integrate with Polygon, Arbitrum, and other L2 solutions',
      risk: 'medium',
      complexity: 'moderate'
    },
    {
      id: 'cross-chain-optimization',
      name: 'Cross-Chain Optimization',
      description: 'Route transactions through most cost-effective chains',
      potentialSavings: 50,
      implementation: 'Multi-chain routing with automatic cost comparison',
      risk: 'low',
      complexity: 'moderate'
    }
  ];

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'fast': return 'text-green-400';
      case 'normal': return 'text-yellow-400';
      case 'slow': return 'text-orange-400';
      case 'congested': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getNetworkStatusBgColor = (status: string) => {
    switch (status) {
      case 'fast': return 'bg-green-500/20 border-green-500/30';
      case 'normal': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'slow': return 'bg-orange-500/20 border-orange-500/30';
      case 'congested': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-green-400" />
          Gas Cost Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">$0.15</div>
            <div className="text-sm text-gray-400">Average Transaction Cost</div>
            <div className="text-xs text-gray-500 mt-1">Across all chains</div>
          </div>
          
          <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">40%</div>
            <div className="text-sm text-gray-400">Potential Savings</div>
            <div className="text-xs text-gray-500 mt-1">With optimization</div>
          </div>
          
          <div className="text-center p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">5</div>
            <div className="text-sm text-gray-400">Supported Chains</div>
            <div className="text-xs text-gray-500 mt-1">For cost optimization</div>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network size={20} className="text-blue-400" />
          Real-Time Network Status
        </h3>
        
        <div className="space-y-3">
          {gasCosts.map(cost => (
            <div key={cost.chainId} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Network size={20} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{cost.chainName}</h4>
                  <p className="text-sm text-gray-400">
                    Gas: {cost.gasPrice} Gwei • Est. Cost: {cost.estimatedCost} {cost.currency}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNetworkStatusBgColor(cost.networkStatus)} ${getNetworkStatusColor(cost.networkStatus)}`}>
                  {cost.networkStatus.toUpperCase()}
                </span>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(cost.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-400" />
          Cost Comparison by Chain
        </h3>
        
        <div className="space-y-4">
          {gasCosts.map(cost => (
            <div key={cost.chainId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-300">{cost.chainName}</span>
                <span className="text-sm text-gray-400">({cost.currency})</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Gas Price: {cost.gasPrice} Gwei</span>
                <span className="text-gray-400">Est. Cost: {cost.estimatedCost} {cost.currency}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkStatusBgColor(cost.networkStatus)} ${getNetworkStatusColor(cost.networkStatus)}`}>
                  {cost.networkStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCosts = () => (
    <div className="space-y-6">
      {/* Transaction Type Costs */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator size={20} className="text-green-400" />
          Transaction Type Costs
        </h3>
        
        <div className="space-y-4">
          {transactionTypes.map(txType => (
            <div key={txType.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{txType.name}</h4>
                  <p className="text-sm text-gray-400">{txType.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-400">{txType.estimatedGas.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Gas Units</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Complexity:</span>
                  <span className={`text-sm font-medium ${getComplexityColor(txType.complexity)}`}>
                    {txType.complexity.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Batchable:</span>
                  <span className={`text-sm font-medium ${txType.batchable ? 'text-green-400' : 'text-red-400'}`}>
                    {txType.batchable ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Est. Cost:</span>
                  <span className="text-sm font-medium text-white">
                    ${(txType.estimatedGas * 0.000000025 * 2000).toFixed(4)} USD
                  </span>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2 text-gray-300">Optimization Tips:</h5>
                <ul className="space-y-1 text-sm">
                  {txType.optimizationTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Calculator */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator size={20} className="text-purple-400" />
          Gas Cost Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Chain</label>
              <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white">
                <option value="">Choose a blockchain</option>
                {gasCosts.map(cost => (
                  <option key={cost.chainId} value={cost.chainId}>
                    {cost.chainName} - {cost.currency}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
              <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white">
                <option value="">Choose transaction type</option>
                {transactionTypes.map(tx => (
                  <option key={tx.id} value={tx.id}>
                    {tx.name} ({tx.estimatedGas.toLocaleString()} gas)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom Gas Price (Gwei)</label>
              <input 
                type="number" 
                placeholder="25" 
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="font-medium mb-3 text-gray-300">Estimated Costs</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Units:</span>
                <span className="text-white">210,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gas Price:</span>
                <span className="text-white">25 Gwei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee:</span>
                <span className="text-white">0.00525 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">USD Equivalent:</span>
                <span className="text-green-400">$10.50</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="text-sm text-blue-400">
                💡 <strong>Tip:</strong> Consider batching multiple operations to reduce per-transaction costs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOptimization = () => (
    <div className="space-y-6">
      {/* Optimization Strategies */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown size={20} className="text-green-400" />
          Gas Optimization Strategies
        </h3>
        
        <div className="space-y-4">
          {optimizationStrategies.map(strategy => (
            <div key={strategy.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{strategy.name}</h4>
                  <p className="text-sm text-gray-400">{strategy.description}</p>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-400">{strategy.potentialSavings}%</div>
                  <div className="text-sm text-gray-400">Savings</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Risk:</span>
                  <span className={`text-sm font-medium ${getRiskColor(strategy.risk)}`}>
                    {strategy.risk.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Complexity:</span>
                  <span className="text-sm font-medium text-gray-300">
                    {strategy.complexity.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Implementation:</span>
                  <span className="text-sm font-medium text-blue-400">
                    {strategy.implementation}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="text-sm text-green-400">
                  🚀 <strong>Ready to implement:</strong> This strategy can be activated immediately for gas cost savings
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Calculator */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" />
          Savings Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Monthly Gas Costs</label>
              <input 
                type="number" 
                placeholder="100" 
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Optimization Strategies</label>
              <div className="space-y-2">
                {optimizationStrategies.map(strategy => (
                  <label key={strategy.id} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-blue-500" />
                    <span className="text-sm text-gray-300">{strategy.name}</span>
                    <span className="text-xs text-green-400">({strategy.potentialSavings}% savings)</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="font-medium mb-3 text-gray-300">Projected Savings</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Costs:</span>
                <span className="text-white">$100/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Optimized Costs:</span>
                <span className="text-white">$60/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Savings:</span>
                <span className="text-green-400">$40/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Annual Savings:</span>
                <span className="text-green-400">$480/year</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="text-sm text-green-400">
                💰 <strong>ROI:</strong> Significant cost savings with minimal implementation effort
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategies = () => (
    <div className="space-y-6">
      {/* Implementation Roadmap */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target size={20} className="text-purple-400" />
          Implementation Roadmap
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
            <div>
              <h4 className="font-medium text-gray-300">Immediate (Week 1)</h4>
              <p className="text-sm text-gray-400">Gas price optimization and transaction batching</p>
            </div>
            <div className="ml-auto">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                Ready
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
            <div>
              <h4 className="font-medium text-gray-300">Short-term (Month 1)</h4>
              <p className="text-sm text-gray-400">Cross-chain optimization and Layer 2 integration</p>
            </div>
            <div className="ml-auto">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                In Progress
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
            <div>
              <h4 className="font-medium text-gray-300">Medium-term (Month 3)</h4>
              <p className="text-sm text-gray-400">Off-chain computation and advanced batching</p>
            </div>
            <div className="ml-auto">
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                Planned
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">4</div>
            <div>
              <h4 className="font-medium text-gray-300">Long-term (Month 6)</h4>
              <p className="text-sm text-gray-400">AI-powered gas optimization and predictive routing</p>
            </div>
            <div className="ml-auto">
              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full border border-gray-500/30">
                Research
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-400" />
          Best Practices for Gas Optimization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-300">Transaction Optimization</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Batch multiple operations into single transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Use optimal gas prices based on network conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Choose less congested networks for lower costs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Implement gas price prediction algorithms</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-300">Protocol Integration</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Use ZetaChain for efficient cross-chain operations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Integrate with Layer 2 solutions for scaling</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Implement smart contract gas optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Use off-chain computation when possible</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <GasPump size={24} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gas Cost Transparency & Optimization</h1>
            <p className="text-gray-400">
              Complete transparency into cross-chain transaction costs with optimization strategies for maximum savings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Current Average Cost:</span>
          <span className="font-medium text-white">$0.15 per transaction</span>
          <span>•</span>
          <span>Potential Savings:</span>
          <span className="font-medium text-green-400">Up to 80% with optimization</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'overview'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <BarChart3 size={16} />
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('costs')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'costs'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Calculator size={16} />
            Costs
          </button>
          <button
            onClick={() => setSelectedTab('optimization')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'optimization'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <TrendingDown size={16} />
            Optimization
          </button>
          <button
            onClick={() => setSelectedTab('strategies')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'strategies'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Target size={16} />
            Strategies
          </button>
        </div>
        
        <div className="p-6">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'costs' && renderCosts()}
          {selectedTab === 'optimization' && renderOptimization()}
          {selectedTab === 'strategies' && renderStrategies()}
        </div>
      </div>
    </div>
  );
};

export default GasCostTransparency;
