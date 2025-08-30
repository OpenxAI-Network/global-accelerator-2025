import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Home, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings,
  Brain,
  Zap,
  Globe,
  Sparkles,
  Target,
  PieChart,
  Image,
  MessageSquare,
  Users,
  CheckCircle
} from 'lucide-react';

const AppWelcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      name: 'Dashboard',
      description: 'AI-powered portfolio overview with risk assessment',
      icon: Home,
      href: '/app/dashboard',
      color: 'from-blue-500 to-blue-600',
      features: ['AI Risk Analysis', 'Portfolio Overview', 'Cross-Chain Summary']
    },
    {
      name: 'Deposit',
      description: 'Lock assets on any chain to borrow',
      icon: Wallet,
      href: '/app/deposit',
      color: 'from-green-500 to-green-600',
      features: ['Multi-Chain Support', 'Intent-Based Lending', 'AI Optimization']
    },
    {
      name: 'Borrow',
      description: 'Get instant loans across chains',
      icon: DollarSign,
      href: '/app/borrow',
      color: 'from-purple-500 to-purple-600',
      features: ['Cross-Chain Credit', 'Dynamic Rates', 'AI Scoring']
    },
    {
      name: 'Loans',
      description: 'Manage active loans and repayments',
      icon: FileText,
      href: '/app/loans',
      color: 'from-orange-500 to-orange-600',
      features: ['Perpetual Loans', 'Auto-Refinancing', 'Health Monitoring']
    },
    {
      name: 'NFT Collateral',
      description: 'Use NFTs as collateral with DeFi fusion',
      icon: Image,
      href: '/app/nft-collateral',
      color: 'from-pink-500 to-pink-600',
      features: ['NFT Locking', 'Borrowing Power', 'Cross-Chain NFTs']
    },
    {
      name: 'Analytics',
      description: 'Advanced portfolio and market analytics',
      icon: BarChart3,
      href: '/app/analytics',
      color: 'from-indigo-500 to-indigo-600',
      features: ['Portfolio Analytics', 'Market Trends', 'Risk Metrics']
    },
    {
      name: 'Governance',
      description: 'Community governance and proposals',
      icon: Settings,
      href: '/app/governance',
      color: 'from-red-500 to-red-600',
      features: ['Voting', 'Proposals', 'Community Stats']
    }
  ];

  const quickActions = [
    {
      name: 'Quick Deposit',
      description: 'Deposit assets to start earning',
      action: () => navigate('/app/deposit'),
      icon: Wallet,
      color: 'bg-green-500'
    },
    {
      name: 'Check Credit Score',
      description: 'View your AI-generated credit score',
      action: () => navigate('/app/dashboard'),
      icon: Brain,
      color: 'bg-blue-500'
    },
    {
      name: 'View Portfolio',
      description: 'See your cross-chain portfolio',
      action: () => navigate('/app/dashboard'),
      icon: PieChart,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mr-4">
            <Shield size={32} className="text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to Aegis
            </h1>
            <p className="text-xl text-gray-300">Your AI-Powered Cross-Chain Lending Platform</p>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          You're now connected and ready to explore the future of decentralized lending. 
          Access AI-optimized rates, cross-chain liquidity, and advanced risk management.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Zap className="text-yellow-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800/70 transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">{action.name}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles className="text-purple-400" />
          Explore Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all hover:scale-105 cursor-pointer group"
              onClick={() => navigate(feature.href)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{feature.name}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {feature.features.map((feat, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features Highlight */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8 mb-12">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">AI-Powered Features</h2>
          <p className="text-blue-200 text-lg">Experience the future of DeFi with intelligent automation</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Risk Assessment</h3>
            <p className="text-blue-200 text-sm">AI analyzes your portfolio and market conditions for optimal lending strategies</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Dynamic Interest Rates</h3>
            <p className="text-purple-200 text-sm">Rates automatically adjust based on risk, liquidity, and market conditions</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Globe size={24} className="text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Cross-Chain Optimization</h3>
            <p className="text-green-200 text-sm">AI finds the best opportunities across multiple blockchains automatically</p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-gray-400 mb-6">
          Choose your first action to begin your DeFi journey with Aegis
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/app/deposit')}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
          >
            Start Depositing
          </button>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
          >
            View Dashboard
          </button>
          <button
            onClick={() => navigate('/app/borrow')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
          >
            Explore Borrowing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppWelcome;
