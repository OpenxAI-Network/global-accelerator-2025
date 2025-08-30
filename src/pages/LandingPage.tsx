import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Globe, 
  Brain, 
  TrendingUp, 
  Lock, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  DollarSign,
  BarChart3,
  Bitcoin,
  Coins,
  Network
} from 'lucide-react';


const LandingPage = () => {
  const navigate = useNavigate();
  
  // Interactive demo state
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState<number[]>([1]);

  const features = [
    {
      icon: Shield,
      title: 'AI-Shielded Liquidity',
      description: 'Advanced AI algorithms protect your assets across all chains with real-time risk monitoring'
    },
    {
      icon: Globe,
      title: 'Cross-Chain Native',
      description: 'Deposit BTC, borrow ETH, collateralize SOL - all through advanced cross-chain contracts'
    },
    {
      icon: Brain,
      title: 'Smart Credit Scoring',
      description: 'AI-powered credit assessment that adapts to market conditions and your portfolio health'
    },
    {
      icon: Zap,
      title: 'Instant Cross-Chain',
      description: 'Lightning-fast asset transfers between chains with zero bridging fees'
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Rates',
      description: 'Interest rates that automatically adjust based on risk, liquidity, and market conditions'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Multi-signature governance, circuit breakers, and real-time threat detection'
    }
  ];

  const stats = [
    { label: 'Total Value Locked', value: '$2.4B+', icon: DollarSign },
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Supported Chains', value: '15+', icon: Globe },
    { label: 'Security Score', value: '99.9%', icon: Shield }
  ];

  const chains = [
    { name: 'Bitcoin', color: '#f7931a' },
    { name: 'Ethereum', color: '#627eea' },
    { name: 'Solana', color: '#9945ff' },
    { name: 'Polygon', color: '#8247e5' },
    { name: 'Avalanche', color: '#e84142' },
    { name: 'Arbitrum', color: '#28a0f0' }
  ];

  // Interactive demo functions
  const handleStepClick = (stepNumber: number) => {
    setActiveStep(stepNumber);
    if (!showDetails.includes(stepNumber)) {
      setShowDetails([...showDetails, stepNumber]);
    }
  };

  const handleStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
      // Auto-advance to next step
      if (stepNumber < 4) {
        setTimeout(() => {
          setActiveStep(stepNumber + 1);
          setShowDetails([...showDetails, stepNumber + 1]);
        }, 1000);
      }
    }
  };

  const resetDemo = () => {
    setActiveStep(1);
    setCompletedSteps([]);
    setShowDetails([1]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-dark text-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AEGIS
            </span>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-6">
              <Star size={16} />
              🏆 Cross-Chain Lending Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI-Shielded
              </span>
              <br />
              Liquidity Across
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                All Chains
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The first cross-chain lending platform that uses <span className="text-purple-400 font-semibold">AI</span> to protect your assets, 
              optimize your borrowing power, and provide instant liquidity across any blockchain via <span className="text-green-400 font-semibold">advanced cross-chain technology</span>.
            </p>
            
            {/* Key Innovation Highlights */}
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                <span className="text-orange-400">₿</span>
                <span className="text-orange-200">Native BTC Support</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                <span className="text-purple-400">🧠</span>
                <span className="text-purple-200">AI Risk Engine</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                <span className="text-green-400">🔗</span>
                <span className="text-green-200">Universal Contract</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
            >
              Launch App
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="https://github.com/yourusername/aegis-ai-liquid-vault/blob/main/README.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white/20 text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all text-center cursor-pointer"
            >
              View Documentation
            </a>
          </div>

          {/* Chain logos */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {chains.map((chain) => (
              <div key={chain.name} className="flex items-center gap-2 text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chain.color }}></div>
                <span className="text-sm">{chain.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon size={24} className="text-primary" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Aegis?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built with enterprise-grade security and AI-powered risk management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Aegis transforms native assets into tokenized collateral across chains, uses AI to optimize risk parameters, 
              and distributes loans efficiently across multiple blockchains—all powered by advanced cross-chain interoperability.
            </p>
          </div>

          {/* Interactive Demo Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setShowDetails([1, 2, 3, 4])}
              className="px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
            >
              Show All Steps
            </button>
            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
            >
              Reset Demo
            </button>
          </div>

          {/* Platform Metrics */}
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm rounded-2xl p-8 border border-primary/30 mb-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-primary">🚀 Platform Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <div className="text-sm text-gray-300">Supported Chains</div>
                <div className="text-xs text-gray-400">Bitcoin, Ethereum, Solana, Avalanche, Base</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">15+</div>
                <div className="text-sm text-gray-300">Cross-Chain Messages/Min</div>
                <div className="text-xs text-gray-400">Real-time cross-chain communication</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$2.4B+</div>
                <div className="text-sm text-gray-300">Potential BTC Liquidity</div>
                <div className="text-xs text-gray-400">Unlocking idle Bitcoin value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">&lt;2s</div>
                <div className="text-sm text-gray-300">AI Response Time</div>
                <div className="text-xs text-gray-400">Instant risk assessment</div>
              </div>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-primary">Interactive Demo</h3>
            
            {/* Step 1: Deposit BTC */}
            <div 
              className={`mb-8 p-6 rounded-xl border transition-all cursor-pointer ${
                activeStep === 1 
                  ? 'bg-gray-700/50 border-orange-500/50 shadow-lg shadow-orange-500/20' 
                  : completedSteps.includes(1)
                  ? 'bg-gray-700/30 border-green-500/50'
                  : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => handleStepClick(1)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    completedSteps.includes(1) 
                      ? 'bg-green-500' 
                      : activeStep === 1 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                      : 'bg-gray-600'
                  }`}>
                    {completedSteps.includes(1) ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Bitcoin className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">Deposit Native BTC</h4>
                    <p className="text-gray-400">Lock native asset</p>
                  </div>
                </div>
                {activeStep === 1 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-400 text-sm">Active</span>
                  </div>
                )}
              </div>
              
              {showDetails.includes(1) && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm">
                      Users can deposit their native Bitcoin (BTC) directly into the Aegis protocol. The protocol locks the native asset securely on its home chain (Bitcoin network) without requiring users to swap or bridge it.
                    </p>
                    
                    {/* Feature Highlight Box */}
                    <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/30">
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-orange-200">
                        <div className="flex items-center gap-1">
                          <span>⚡</span>
                          <span>No wrapped tokens</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🔒</span>
                          <span>Native security</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⚡</span>
                          <span>Instant processing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!completedSteps.includes(1) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStepComplete(1); }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Complete Step 1
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Tokenize Collateral */}
            <div 
              className={`mb-8 p-6 rounded-xl border transition-all cursor-pointer ${
                activeStep === 2 
                  ? 'bg-gray-700/50 border-green-500/50 shadow-lg shadow-green-500/20' 
                  : completedSteps.includes(2)
                  ? 'bg-gray-700/30 border-green-500/50'
                  : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => handleStepClick(2)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    completedSteps.includes(2) 
                      ? 'bg-green-500' 
                      : activeStep === 2 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gray-600'
                  }`}>
                    {completedSteps.includes(2) ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Coins className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">Collateral Token Creation</h4>
                    <p className="text-gray-400">Tokenize collateral</p>
                  </div>
                </div>
                {activeStep === 2 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                )}
              </div>
              
              {showDetails.includes(2) && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Once the native asset is locked, Aegis creates a tokenized representation of the collateral on another blockchain. This token acts as proof of the locked asset and can be used seamlessly within the DeFi ecosystem.
                  </p>
                  
                  {!completedSteps.includes(2) && completedSteps.includes(1) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStepComplete(2); }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Complete Step 2
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: AI Risk Analysis */}
            <div 
              className={`mb-8 p-6 rounded-xl border transition-all cursor-pointer ${
                activeStep === 3 
                  ? 'bg-gray-700/50 border-purple-500/50 shadow-lg shadow-purple-500/20' 
                  : completedSteps.includes(3)
                  ? 'bg-gray-700/30 border-green-500/50'
                  : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => handleStepClick(3)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    completedSteps.includes(3) 
                      ? 'bg-green-500' 
                      : activeStep === 3 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                      : 'bg-gray-600'
                  }`}>
                    {completedSteps.includes(3) ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Brain className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">AI Risk Analysis</h4>
                    <p className="text-gray-400">AI-optimized risk parameters</p>
                  </div>
                </div>
                {activeStep === 3 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-purple-400 text-sm">Active</span>
                  </div>
                )}
              </div>
              
              {showDetails.includes(3) && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Aegis leverages real-time AI-powered risk analysis to assess creditworthiness and liquidation risk. The AI considers wallet history, behavioral patterns, and liquidity profiles across chains.
                  </p>
                  
                  {!completedSteps.includes(3) && completedSteps.includes(2) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStepComplete(3); }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Complete Step 3
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 4: Loan Distribution */}
            <div 
              className={`p-6 rounded-xl border transition-all cursor-pointer ${
                activeStep === 4 
                  ? 'bg-gray-700/50 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                  : completedSteps.includes(4)
                  ? 'bg-gray-700/30 border-green-500/50'
                  : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => handleStepClick(4)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    completedSteps.includes(4) 
                      ? 'bg-green-500' 
                      : activeStep === 4 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                      : 'bg-gray-600'
                  }`}>
                    {completedSteps.includes(4) ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Network className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">Loan Distribution</h4>
                    <p className="text-gray-400">Cross-chain lending</p>
                  </div>
                </div>
                {activeStep === 4 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 text-sm">Active</span>
                  </div>
                )}
              </div>
              
              {showDetails.includes(4) && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Loans are distributed seamlessly across multiple blockchains based on collateral and AI risk assessment. Users can borrow on different chains without manual bridging.
                  </p>
                  
                  {!completedSteps.includes(4) && completedSteps.includes(3) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStepComplete(4); }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Complete Step 4
                    </button>
                  )}
                  
                  {completedSteps.includes(4) && (
                    <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30 text-center">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-200 font-semibold">Demo Complete! 🎉</p>
                      <p className="text-green-200 text-sm">You've successfully completed the Aegis cross-chain lending flow</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Real-World Use Cases */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-primary">Real-World Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-400 font-bold">₿</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Bitcoin Miners</h4>
                    <p className="text-gray-400 text-sm">Operational Funding Solution</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  Deposit BTC to borrow stablecoins for operational costs without selling Bitcoin
                </p>
                <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-500/30">
                  <p className="text-orange-200 text-xs">
                    <b>Impact:</b> $2.4B+ idle BTC can now generate yield
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Cross-Chain DeFi Users</h4>
                    <p className="text-gray-400 text-sm">Liquidity Access</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  Access liquidity on any chain without manual bridging or asset wrapping
                </p>
                <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
                  <p className="text-blue-200 text-xs">
                    <b>Efficiency:</b> Reduces 5+ manual steps into 1 transaction
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Chain Integration Showcase */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-green-400">Cross-Chain Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Universal Contract</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Single universal contract manages all cross-chain operations
                  </p>
                  <div className="bg-green-900/30 p-2 rounded-lg">
                    <p className="text-green-200 text-xs font-mono">0x7f3...a2b1</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Network className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Cross-Chain Messages</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Real-time communication between 5+ blockchain networks
                  </p>
                  <div className="bg-blue-900/30 p-2 rounded-lg">
                    <p className="text-blue-200 text-xs">15+ messages/minute</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-400 font-bold text-xl">₿</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Native BTC Support</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Direct Bitcoin integration without wrapping or bridging
                  </p>
                  <div className="bg-orange-900/30 p-2 rounded-lg">
                    <p className="text-orange-200 text-xs">No Wrapped Tokens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-primary">Key Benefits</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-400">Asset Security</h4>
                    <p className="text-gray-300 text-sm">Native assets remain on their home chain, preserving security and integrity</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-400">Cross-Chain Efficiency</h4>
                    <p className="text-gray-300 text-sm">Access liquidity across multiple blockchains without manual bridging</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-400">AI Optimization</h4>
                    <p className="text-gray-300 text-sm">Dynamic risk parameters continuously optimized for safety and access</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-secondary">Technical Architecture</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-300">Bitcoin Network - Native BTC Locking</span>
                </div>
                <div className="w-5 h-5 text-gray-500 mx-auto">↓</div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Cross-Chain Communication Layer</span>
                </div>
                <div className="w-5 h-5 text-gray-500 mx-auto">↓</div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Target Chains - Tokenized Collateral & Loans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience the Future of Lending?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users already benefiting from AI-shielded cross-chain liquidity
          </p>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mx-auto group"
          >
            Launch App
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold">AEGIS</span>
          </div>
          <p className="mb-4">AI-Powered Cross-Chain Lending Platform</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Community</a>
            <a href="#" className="hover:text-white transition-colors">Governance</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
