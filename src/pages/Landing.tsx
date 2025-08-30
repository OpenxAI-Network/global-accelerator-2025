import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Globe, 
  Brain, 
  TrendingUp, 
  Lock, 
  ArrowRight, 
  ExternalLink, 
  Github, 
  Twitter, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Vote,
  ChevronDown,
  Play,
  Star,
  CheckCircle,
  Rocket,
  Coins,
  BarChart3,
  Shield as ShieldIcon,
  Zap as ZapIcon,
  Globe as GlobeIcon,
  Brain as BrainIcon
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const Landing = () => {
  const { isConnected, connect } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (isConnected) {
      // Navigate to dashboard if already connected
      window.location.href = '/dashboard';
    } else {
      // Trigger wallet connection
      connect();
    }
  };

  const features = [
    {
      icon: <GlobeIcon className="w-8 h-8" />,
      title: "Cross-Chain Collateral",
      description: "Use assets from Bitcoin, Solana, Avalanche, and more as collateral seamlessly across chains.",
      benefits: ["Multi-chain asset support", "Unified collateral pool", "Chain-agnostic borrowing"]
    },
    {
      icon: <BrainIcon className="w-8 h-8" />,
      title: "AI Credit Scoring",
      description: "Benefit from real-time AI-powered credit scores that reflect your on-chain behavior and risk profile.",
      benefits: ["Real-time assessment", "Behavioral analysis", "Predictive risk modeling"]
    },
    {
      icon: <ZapIcon className="w-8 h-8" />,
      title: "Dynamic Interest Rates",
      description: "Enjoy optimized, risk-adjusted interest rates balancing borrower incentives and protocol safety.",
      benefits: ["Risk-based pricing", "Market-responsive rates", "Optimized borrowing costs"]
    },
    {
      icon: <ShieldIcon className="w-8 h-8" />,
      title: "NFT & GameFi Lending",
      description: "Lock NFTs on one chain and borrow assets on another — perfect for GameFi players and collectors.",
      benefits: ["NFT collateralization", "Cross-chain liquidity", "GameFi integration"]
    }
  ];

  const stats = [
    { label: "Total Value Locked", value: "$45M+", change: "+12.5%" },
    { label: "Active Users", value: "12.5K+", change: "+8.2%" },
    { label: "Supported Chains", value: "6", change: "New" },
    { label: "Average APY", value: "8.5%", change: "+2.1%" }
  ];

  const chains = [
    { name: "Ethereum", icon: "🔷", status: "active" },
    { name: "Solana", icon: "🟣", status: "active" },
    { name: "Avalanche", icon: "🔴", status: "active" },
    { name: "Base", icon: "🔵", status: "active" },
    { name: "Polygon", icon: "🟣", status: "active" },
    { name: "Arbitrum", icon: "🔵", status: "active" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-lg border-b border-slate-700' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Aegis
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#ecosystem" className="hover:text-blue-400 transition-colors">Ecosystem</a>
              <a href="#community" className="hover:text-blue-400 transition-colors">Community</a>
            </nav>

            <div className="flex items-center space-x-4">
              {isConnected ? (
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Powered by AI & Blockchain</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI-Shielded
              </span>
              <br />
              <span className="text-white">Liquidity Across Chains</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-300 leading-relaxed">
              Unlock cross-chain DeFi lending with real-time AI credit scoring, predictive liquidation risk, 
              and dynamic interest rates — all powered by advanced cross-chain technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-gray-400 mb-1">{stat.label}</div>
                  <div className="text-sm text-green-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Core Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of DeFi with AI-powered cross-chain lending that adapts to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-500 ${
                  activeFeature === index
                    ? 'bg-blue-600/20 border-blue-500/50 scale-105'
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    activeFeature === index ? 'bg-blue-600/30' : 'bg-slate-700/50'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simple steps to unlock cross-chain liquidity with AI-powered risk management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600/20 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect Wallets</h3>
              <p className="text-gray-400">Connect multiple wallets across different chains to access your assets</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600/20 border-2 border-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Deposit Collateral</h3>
              <p className="text-gray-400">Lock your assets as collateral and get AI-powered credit assessment</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Borrow & Earn</h3>
              <p className="text-gray-400">Borrow assets on any chain or earn yield on your collateral</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="py-20 px-6 bg-white/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Multi-Chain Ecosystem</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Seamlessly operate across the most popular blockchain networks
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {chains.map((chain, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 text-center hover:bg-slate-800/70 transition-colors"
              >
                <div className="text-3xl mb-3">{chain.icon}</div>
                <h3 className="font-semibold mb-2">{chain.name}</h3>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">{chain.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users already benefiting from AI-powered cross-chain lending
            </p>
            <button
              onClick={handleGetStarted}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto"
            >
              <Rocket className="w-6 h-6" />
              <span>Launch App</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="community" className="bg-slate-800/50 border-t border-slate-700 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Aegis</h3>
              </div>
              <p className="text-gray-400 mb-4">
                AI-Shielded Liquidity Across Chains. The future of cross-chain DeFi lending.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Documentation
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Protocol Docs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integration Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security Audit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Community
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Discord Server</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Telegram Group</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community Forum</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bug Bounty</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 flex items-center">
                <Vote className="w-5 h-5 mr-2" />
                Governance
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">DAO Proposals</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Voting Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Token Economics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 Aegis DeFi. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
