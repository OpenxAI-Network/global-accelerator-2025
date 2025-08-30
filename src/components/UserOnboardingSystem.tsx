import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Play, 
  BookOpen, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Home,
  Shield,
  Wallet,
  Network,
  Brain,
  Users,
  Zap,
  Target,
  Award,
  Clock,
  Star,
  HelpCircle,
  Video,
  FileText,
  Interactive,
  BarChart3
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
  videoUrl?: string;
  interactiveDemo?: boolean;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: string[];
  totalTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  rewards: string[];
}

const UserOnboardingSystem: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('getting-started');
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const [userProgress, setUserProgress] = useState<{[key: string]: boolean}>({});

  const learningPaths: LearningPath[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with AEGIS',
      description: 'Complete beginner guide to understanding and using AEGIS platform',
      steps: ['welcome', 'wallet-setup', 'first-deposit', 'security-basics', 'portfolio-overview'],
      totalTime: 15,
      difficulty: 'beginner',
      prerequisites: [],
      rewards: ['AEGIS Beginner Badge', '100 XP', 'Access to Basic Features']
    },
    {
      id: 'cross-chain-mastery',
      title: 'Cross-Chain Mastery',
      description: 'Learn to navigate and optimize multi-chain operations',
      steps: ['chain-selection', 'asset-bridging', 'cross-chain-lending', 'portfolio-optimization'],
      totalTime: 25,
      difficulty: 'intermediate',
      prerequisites: ['getting-started'],
      rewards: ['Cross-Chain Expert Badge', '250 XP', 'Advanced Features Access']
    },
    {
      id: 'ai-security-expert',
      title: 'AI Security Expert',
      description: 'Master the AI-powered security features and threat detection',
      steps: ['ai-overview', 'threat-detection', 'risk-assessment', 'security-policies', 'incident-response'],
      totalTime: 30,
      difficulty: 'advanced',
      prerequisites: ['getting-started', 'cross-chain-mastery'],
      rewards: ['AI Security Master Badge', '500 XP', 'Premium Features Access']
    },
    {
      id: 'defi-integration',
      title: 'DeFi Protocol Integration',
      description: 'Learn to integrate with popular DeFi protocols and optimize yields',
      steps: ['protocol-overview', 'aave-integration', 'compound-integration', 'yield-optimization', 'risk-management'],
      totalTime: 35,
      difficulty: 'advanced',
      prerequisites: ['getting-started', 'cross-chain-mastery'],
      rewards: ['DeFi Integration Expert Badge', '400 XP', 'Protocol Access']
    }
  ];

  const tutorialSteps: {[key: string]: TutorialStep} = {
    welcome: {
      id: 'welcome',
      title: 'Welcome to AEGIS',
      description: 'Introduction to the AEGIS AI Liquid Vault platform',
      icon: Home,
      content: `
        <h2>Welcome to AEGIS AI Liquid Vault!</h2>
        <p>AEGIS is a revolutionary multi-chain DeFi platform that combines:</p>
        <ul>
          <li><strong>AI-Powered Security:</strong> Advanced threat detection using Google Gemini 2.5</li>
          <li><strong>Cross-Chain Integration:</strong> Seamless operation across Ethereum, Solana, Bitcoin, and more</li>
          <li><strong>Unified Asset Management:</strong> Single dashboard for all your cross-chain assets</li>
          <li><strong>Digital Inheritance:</strong> Secure asset succession planning</li>
        </ul>
        <p>This tutorial will guide you through everything you need to know to get started safely and confidently.</p>
      `,
      estimatedTime: 3,
      difficulty: 'beginner'
    },
    'wallet-setup': {
      id: 'wallet-setup',
      title: 'Wallet Setup & Connection',
      description: 'Connect your wallets and set up multi-chain identity',
      icon: Wallet,
      content: `
        <h2>Setting Up Your Wallets</h2>
        <p>AEGIS supports multiple wallet types across different blockchains:</p>
        
        <h3>EVM Wallets (Ethereum, Polygon, BSC)</h3>
        <ul>
          <li>MetaMask - Most popular and secure</li>
          <li>WalletConnect - Mobile-friendly</li>
          <li>Coinbase Wallet - User-friendly</li>
        </ul>
        
        <h3>Solana Wallets</h3>
        <ul>
          <li>Phantom - Feature-rich Solana wallet</li>
          <li>Solflare - Advanced features</li>
        </ul>
        
        <h3>Bitcoin Wallets</h3>
        <ul>
          <li>Hardware wallets (Ledger, Trezor)</li>
          <li>Software wallets with message signing</li>
        </ul>
        
        <p><strong>Security Tip:</strong> Always verify you're on the official AEGIS platform before connecting wallets.</p>
      `,
      videoUrl: 'https://example.com/wallet-setup-tutorial',
      estimatedTime: 5,
      difficulty: 'beginner'
    },
    'first-deposit': {
      id: 'first-deposit',
      title: 'Making Your First Deposit',
      description: 'Learn to deposit assets safely across different chains',
      icon: Target,
      content: `
        <h2>Your First Deposit</h2>
        <p>Follow these steps to make your first deposit safely:</p>
        
        <h3>Step 1: Select Your Asset</h3>
        <ul>
          <li>Choose from supported tokens on each chain</li>
          <li>Verify token contract addresses</li>
          <li>Check current market prices</li>
        </ul>
        
        <h3>Step 2: Choose Your Chain</h3>
        <ul>
          <li>Ethereum: High security, higher fees</li>
          <li>Polygon: Lower fees, good security</li>
          <li>Solana: Fast transactions, low fees</li>
          <li>Bitcoin: Store of value, long-term</li>
        </ul>
        
        <h3>Step 3: Set Deposit Amount</h3>
        <ul>
          <li>Start with small amounts to test</li>
          <li>Consider gas fees and network conditions</li>
          <li>Set appropriate security parameters</li>
        </ul>
        
        <p><strong>Remember:</strong> Never deposit more than you can afford to lose, especially when starting out.</p>
      `,
      interactiveDemo: true,
      estimatedTime: 7,
      difficulty: 'beginner'
    },
    'security-basics': {
      id: 'security-basics',
      title: 'Security Fundamentals',
      description: 'Essential security practices for safe DeFi usage',
      icon: Shield,
      content: `
        <h2>Security Fundamentals</h2>
        <p>Protecting your assets is crucial in DeFi. Here are the essential security practices:</p>
        
        <h3>Wallet Security</h3>
        <ul>
          <li>Use hardware wallets for large amounts</li>
          <li>Never share private keys or seed phrases</li>
          <li>Enable 2FA on all accounts</li>
          <li>Regularly update wallet software</li>
        </ul>
        
        <h3>Platform Security</h3>
        <ul>
          <li>Always verify you're on the official site</li>
          <li>Check for HTTPS and security certificates</li>
          <li>Be wary of unsolicited offers</li>
          <li>Use bookmarks for important sites</li>
        </ul>
        
        <h3>AEGIS Security Features</h3>
        <ul>
          <li>AI-powered threat detection</li>
          <li>Multi-signature requirements</li>
          <li>Time-lock mechanisms</li>
          <li>Circuit breakers for emergencies</li>
        </ul>
      `,
      estimatedTime: 8,
      difficulty: 'beginner'
    },
    'portfolio-overview': {
      id: 'portfolio-overview',
      title: 'Portfolio Overview & Management',
      description: 'Understanding your cross-chain portfolio and performance',
      icon: BarChart3,
      content: `
        <h2>Portfolio Overview</h2>
        <p>Your AEGIS dashboard provides a comprehensive view of all your cross-chain assets:</p>
        
        <h3>Portfolio Components</h3>
        <ul>
          <li><strong>Total Value:</strong> USD equivalent across all chains</li>
          <li><strong>Asset Allocation:</strong> Distribution across different tokens</li>
          <li><strong>Chain Distribution:</strong> Assets per blockchain</li>
          <li><strong>Performance Metrics:</strong> Gains, losses, and APY</li>
        </ul>
        
        <h3>Real-Time Updates</h3>
        <ul>
          <li>Live price updates from multiple sources</li>
          <li>Cross-chain transaction monitoring</li>
          <li>Security alerts and notifications</li>
          <li>Portfolio rebalancing suggestions</li>
        </ul>
        
        <h3>Analytics & Insights</h3>
        <ul>
          <li>Historical performance charts</li>
          <li>Risk assessment scores</li>
          <li>Yield optimization recommendations</li>
          <li>Tax reporting tools</li>
        </ul>
      `,
      estimatedTime: 6,
      difficulty: 'beginner'
    }
  };

  const getCurrentStep = () => tutorialSteps[currentStep];
  const getCurrentPath = () => learningPaths.find(p => p.id === selectedPath);

  const markStepComplete = (stepId: string) => {
    setUserProgress(prev => ({ ...prev, [stepId]: true }));
  };

  const getProgressPercentage = () => {
    const currentPath = getCurrentPath();
    if (!currentPath) return 0;
    
    const completedSteps = currentPath.steps.filter(step => userProgress[step]);
    return Math.round((completedSteps.length / currentPath.steps.length) * 100);
  };

  const renderTutorialContent = () => {
    const step = getCurrentStep();
    if (!step) return null;

    return (
      <div className="space-y-6">
        {/* Step Header */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              step.difficulty === 'beginner' ? 'bg-green-500/20 border-green-500/30' :
              step.difficulty === 'intermediate' ? 'bg-yellow-500/20 border-yellow-500/30' :
              'bg-red-500/20 border-red-500/30'
            }`}>
              <step.icon size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{step.title}</h2>
              <p className="text-gray-400">{step.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Difficulty</div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                step.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                step.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {step.difficulty.toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{step.estimatedTime} minutes</span>
            </div>
            {step.videoUrl && (
              <div className="flex items-center gap-2">
                <Video size={16} />
                <span>Video Tutorial Available</span>
              </div>
            )}
            {step.interactiveDemo && (
              <div className="flex items-center gap-2">
                <Interactive size={16} />
                <span>Interactive Demo</span>
              </div>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: step.content }}
          />
        </div>

        {/* Interactive Demo */}
        {step.interactiveDemo && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Interactive size={20} className="text-blue-400" />
              Interactive Demo
            </h3>
            
            {!showInteractiveDemo ? (
              <button
                onClick={() => setShowInteractiveDemo(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Launch Interactive Demo
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <h4 className="font-medium mb-2 text-gray-300">Demo: First Deposit Simulation</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Practice making a deposit without using real funds. This demo shows you exactly what to expect.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Select Asset</label>
                      <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
                        <option>ETH (Ethereum)</option>
                        <option>MATIC (Polygon)</option>
                        <option>SOL (Solana)</option>
                        <option>BTC (Bitcoin)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                      <input 
                        type="number" 
                        placeholder="0.0" 
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Security Level</label>
                      <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
                        <option>Basic</option>
                        <option>Enhanced</option>
                        <option>Maximum</option>
                      </select>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors">
                    Simulate Deposit
                  </button>
                </div>
                
                <button
                  onClick={() => setShowInteractiveDemo(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                >
                  Close Demo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Video Tutorial */}
        {step.videoUrl && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Video size={20} className="text-purple-400" />
              Video Tutorial
            </h3>
            
            <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Video tutorial would be embedded here</p>
                <p className="text-sm text-gray-500">URL: {step.videoUrl}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const currentPath = getCurrentPath();
              if (currentPath) {
                const currentIndex = currentPath.steps.indexOf(currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(currentPath.steps[currentIndex - 1]);
                }
              }
            }}
            disabled={getCurrentPath()?.steps.indexOf(currentStep) === 0}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => markStepComplete(currentStep)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Mark Complete
            </button>
            
            <button
              onClick={() => {
                const currentPath = getCurrentPath();
                if (currentPath) {
                  const currentIndex = currentPath.steps.indexOf(currentStep);
                  if (currentIndex < currentPath.steps.length - 1) {
                    setCurrentStep(currentPath.steps[currentIndex + 1]);
                  }
                }
              }}
              disabled={getCurrentPath()?.steps.indexOf(currentStep) === (getCurrentPath()?.steps.length || 0) - 1}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 disabled:text-gray-500 text-white rounded font-medium transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <GraduationCap size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AEGIS Learning Center</h1>
            <p className="text-gray-400">
              Comprehensive tutorials and guides to help you master the AEGIS platform safely and confidently
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Progress:</span>
          <span className="font-medium text-white">{getProgressPercentage()}%</span>
          <span>•</span>
          <span>Current Path:</span>
          <span className="font-medium text-white">{getCurrentPath()?.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Learning Paths Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-green-400" />
              Learning Paths
            </h3>
            
            <div className="space-y-3">
              {learningPaths.map(path => (
                <button
                  key={path.id}
                  onClick={() => {
                    setSelectedPath(path.id);
                    setCurrentStep(path.steps[0]);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPath === path.id
                      ? 'bg-primary border-primary text-white'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{path.title}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      path.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      path.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {path.difficulty}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{path.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{path.totalTime} min</span>
                    <span className="text-gray-400">{path.steps.length} steps</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-400" />
              Your Progress
            </h3>
            
            <div className="space-y-3">
              {learningPaths.map(path => {
                const completedSteps = path.steps.filter(step => userProgress[step]);
                const progress = Math.round((completedSteps.length / path.steps.length) * 100);
                
                return (
                  <div key={path.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{path.title}</span>
                      <span className="text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {renderTutorialContent()}
        </div>
      </div>
    </div>
  );
};

export default UserOnboardingSystem;
