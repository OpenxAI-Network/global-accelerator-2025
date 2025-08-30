import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowDown, 
  ArrowUp,
  Database,
  Shield,
  Brain,
  Wallet,
  Network,
  Server,
  Lock,
  Eye,
  Activity,
  Zap,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  Hash,
  FileText,
  Code,
  Key,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
  Bell,
  Smartphone,
  Monitor,
  Cloud,
  Server as ServerIcon,
  Database as DatabaseIcon,
  Shield as ShieldIcon,
  Brain as BrainIcon,
  Wallet as WalletIcon,
  Network as NetworkIcon,
  Server as ServerIcon2,
  Lock as LockIcon,
  Eye as EyeIcon,
  Activity as ActivityIcon,
  Zap as ZapIcon,
  Globe as GlobeIcon,
  Cpu as CpuIcon,
  HardDrive as HardDriveIcon,
  Wifi as WifiIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Hash as HashIcon,
  FileText as FileTextIcon,
  Code as CodeIcon,
  Key as KeyIcon,
  Users as UsersIcon,
  BarChart3 as BarChart3Icon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Smartphone as SmartphoneIcon,
  Monitor as MonitorIcon,
  Cloud as CloudIcon
} from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  connections: string[];
  data: string[];
  security: string[];
  errors: string[];
}

interface DataFlowSection {
  id: string;
  title: string;
  steps: FlowStep[];
  color: string;
}

const UserDataFlowDiagram: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('entry');
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  const dataFlowSections: DataFlowSection[] = [
    {
      id: 'entry',
      title: 'User Entry Points & Initialization',
      color: 'blue',
      steps: [
        {
          id: 'react-frontend',
          title: 'React Frontend (src/App.tsx)',
          description: 'Main application entry point with Tailwind CSS styling',
          icon: Monitor,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20 border-blue-500/30',
          connections: ['layout-component', 'wallet-connection'],
          data: ['User preferences', 'Session state', 'UI configuration'],
          security: ['HTTPS enforcement', 'CSP headers', 'XSS protection'],
          errors: ['Network timeout', 'Bundle loading failure', 'CSS rendering issues']
        },
        {
          id: 'layout-component',
          title: 'Layout.tsx Component',
          description: 'Navigation sidebar, modals, and main layout structure',
          icon: Settings,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20 border-blue-500/30',
          connections: ['wallet-connection', 'navigation-sidebar'],
          data: ['Navigation state', 'Modal states', 'Theme preferences'],
          security: ['Component isolation', 'State validation', 'Event sanitization'],
          errors: ['Component mounting failure', 'State corruption', 'Memory leaks']
        },
        {
          id: 'wallet-connection',
          title: 'Wallet Connection System',
          description: 'Demo mode vs real wallet connection logic',
          icon: Wallet,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20 border-green-500/30',
          connections: ['metamask-connection', 'phantom-connection', 'bitcoin-connection'],
          data: ['Connection preferences', 'Wallet history', 'Demo settings'],
          security: ['Connection validation', 'Wallet verification', 'Session management'],
          errors: ['Connection timeout', 'Wallet rejection', 'Network failure']
        }
      ]
    },
    {
      id: 'authentication',
      title: 'Wallet Connection & Authentication Flow',
      color: 'green',
      steps: [
        {
          id: 'metamask-connection',
          title: 'MetaMask Connection',
          description: 'EVM wallet connection with RPC calls and network detection',
          icon: Key,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20 border-green-500/30',
          connections: ['use-wallet-hook', 'rpc-calls', 'network-detection'],
          data: ['Account address', 'Chain ID', 'Balance', 'Network info'],
          security: ['Signature verification', 'Account ownership proof', 'Network validation'],
          errors: ['User rejection', 'Network mismatch', 'RPC failure']
        },
        {
          id: 'phantom-connection',
          title: 'Phantom Connection',
          description: 'Solana wallet with Ed25519 signature verification',
          icon: Key,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20 border-purple-500/30',
          connections: ['solana-rpc', 'ed25519-verification', 'account-info'],
          data: ['SOL balance', 'Account info', 'Transaction history'],
          security: ['Ed25519 signature', 'Nonce validation', 'Account verification'],
          errors: ['Signature failure', 'RPC timeout', 'Account not found']
        },
        {
          id: 'bitcoin-connection',
          title: 'Bitcoin Connection',
          description: 'Bitcoin message signing for proof of ownership',
          icon: Key,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20 border-orange-500/30',
          connections: ['bitcoin-message-signing', 'address-validation', 'balance-checking'],
          data: ['BTC address', 'Balance', 'Transaction history'],
          security: ['Message signature', 'Timestamp protection', 'Address validation'],
          errors: ['Signature invalid', 'Address mismatch', 'Network error']
        }
      ]
    },
    {
      id: 'identity',
      title: 'Multi-Chain Identity Unification',
      color: 'purple',
      steps: [
        {
          id: 'primary-identity',
          title: 'Primary Identity Creation',
          description: 'ZetaChain as canonical identity anchor with MultiChainIdentity.sol',
          icon: Users,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20 border-purple-500/30',
          connections: ['zetachain-contract', 'identity-storage', 'wallet-linking'],
          data: ['Root identity', 'Wallet mappings', 'Reputation score'],
          security: ['Cryptographic proof', 'Contract validation', 'Identity verification'],
          errors: ['Contract failure', 'Identity collision', 'Storage error']
        },
        {
          id: 'wallet-linking',
          title: 'Wallet Linking Process',
          description: 'Multi-chain wallet linking with signature verification',
          icon: Network,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20 border-purple-500/30',
          connections: ['signature-verification', 'backend-api', 'cross-chain-events'],
          data: ['Linked wallets', 'Verification proofs', 'Chain mappings'],
          security: ['Multi-signature', 'Chain validation', 'Proof verification'],
          errors: ['Verification failed', 'Chain mismatch', 'API error']
        },
        {
          id: 'identity-resolution',
          title: 'Identity Resolution',
          description: 'Backend services maintaining wallet address mappings',
          icon: Database,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20 border-purple-500/30',
          connections: ['backend-services', 'cross-chain-monitoring', 'real-time-updates'],
          data: ['Address mappings', 'Identity profiles', 'Reputation data'],
          security: ['Access control', 'Data encryption', 'Audit logging'],
          errors: ['Service unavailable', 'Data corruption', 'Sync failure']
        }
      ]
    },
    {
      id: 'frontend',
      title: 'Frontend Data Management & State',
      color: 'cyan',
      steps: [
        {
          id: 'react-context',
          title: 'React Context Management',
          description: 'Global state management through React contexts',
          icon: Cpu,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20 border-cyan-500/30',
          connections: ['wallet-context', 'notification-context', 'theme-context'],
          data: ['Global state', 'User preferences', 'Application settings'],
          security: ['State validation', 'Context isolation', 'Memory management'],
          errors: ['Context error', 'State corruption', 'Memory leak']
        },
        {
          id: 'local-storage',
          title: 'Local Storage Integration',
          description: 'Persistent storage for user preferences and settings',
          icon: HardDrive,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20 border-cyan-500/30',
          connections: ['session-persistence', 'preferences-storage', 'connection-history'],
          data: ['User settings', 'Connection history', 'Demo preferences'],
          security: ['Data encryption', 'Access control', 'Tamper detection'],
          errors: ['Storage full', 'Data corruption', 'Access denied']
        },
        {
          id: 'component-state',
          title: 'Component State Management',
          description: 'Individual component state and lifecycle management',
          icon: Code,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20 border-cyan-500/30',
          connections: ['layout-state', 'dashboard-state', 'asset-monitor'],
          data: ['Component data', 'UI state', 'User interactions'],
          security: ['Input validation', 'State sanitization', 'Event handling'],
          errors: ['State error', 'Component crash', 'Memory leak']
        }
      ]
    },
    {
      id: 'backend',
      title: 'Backend API Architecture',
      color: 'orange',
      steps: [
        {
          id: 'server-infrastructure',
          title: 'Server Infrastructure',
          description: 'Multiple specialized servers with Express.js middleware',
          icon: Server,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20 border-orange-500/30',
          connections: ['express-middleware', 'security-layers', 'cors-config'],
          data: ['Request data', 'Response data', 'Server metrics'],
          security: ['HTTPS enforcement', 'Rate limiting', 'Security headers'],
          errors: ['Server crash', 'Memory overflow', 'Network failure']
        },
        {
          id: 'authentication-middleware',
          title: 'Authentication Middleware',
          description: 'JWT validation, API keys, and role-based access control',
          icon: Lock,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20 border-orange-500/30',
          connections: ['jwt-validation', 'api-key-auth', 'role-based-access'],
          data: ['User tokens', 'API keys', 'Role permissions'],
          security: ['Token validation', 'Key verification', 'Permission checking'],
          errors: ['Token expired', 'Invalid key', 'Access denied']
        },
        {
          id: 'data-validation',
          title: 'Data Validation & Sanitization',
          description: 'Input validation, SQL injection prevention, and XSS protection',
          icon: Shield,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20 border-orange-500/30',
          connections: ['input-validation', 'sql-injection-prevention', 'xss-protection'],
          data: ['User inputs', 'API payloads', 'Database queries'],
          security: ['Input sanitization', 'Query validation', 'Content filtering'],
          errors: ['Validation failed', 'Malicious input', 'Sanitization error']
        }
      ]
    },
    {
      id: 'cross-chain',
      title: 'Cross-Chain Data Processing',
      color: 'red',
      steps: [
        {
          id: 'data-aggregation',
          title: 'Data Aggregation Pipeline',
          description: 'Real-time balance monitoring and transaction aggregation',
          icon: BarChart3,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20 border-red-500/30',
          connections: ['balance-monitoring', 'transaction-aggregation', 'portfolio-calculation'],
          data: ['Multi-chain balances', 'Transaction history', 'Portfolio values'],
          security: ['Data integrity', 'Source validation', 'Tamper detection'],
          errors: ['Data corruption', 'Source failure', 'Calculation error']
        },
        {
          id: 'smart-contracts',
          title: 'Smart Contract Integration',
          description: 'Cross-chain contracts for lending and communication',
          icon: FileText,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20 border-red-500/30',
          connections: ['universal-lending', 'cross-chain-connector', 'solana-integration'],
          data: ['Contract state', 'Transaction data', 'Event logs'],
          security: ['Contract validation', 'Transaction verification', 'Event monitoring'],
          errors: ['Contract failure', 'Transaction revert', 'Event loss']
        },
        {
          id: 'oracle-integration',
          title: 'Oracle Integration',
          description: 'Price feeds and external data sources',
          icon: Globe,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20 border-red-500/30',
          connections: ['price-feeds', 'dex-sources', 'chainlink-integration'],
          data: ['Price data', 'Market data', 'External feeds'],
          security: ['Oracle validation', 'Source verification', 'Data integrity'],
          errors: ['Oracle failure', 'Price manipulation', 'Feed error']
        }
      ]
    },
    {
      id: 'ai-engine',
      title: 'AI & Risk Assessment Engine',
      color: 'pink',
      steps: [
        {
          id: 'credit-scoring',
          title: 'Credit Scoring System',
          description: 'AI-powered credit profile generation and risk assessment',
          icon: Brain,
          color: 'text-pink-400',
          bgColor: 'bg-pink-500/20 border-pink-500/30',
          connections: ['ai-models', 'risk-assessment', 'credit-limits'],
          data: ['Credit scores', 'Risk profiles', 'Transaction patterns'],
          security: ['Model validation', 'Data privacy', 'Bias detection'],
          errors: ['Model failure', 'Data corruption', 'Bias detection']
        },
        {
          id: 'nft-valuation',
          title: 'NFT Valuation Engine',
          description: 'AI-based NFT price estimation and market analysis',
          icon: TrendingUp,
          color: 'text-pink-400',
          bgColor: 'bg-pink-500/20 border-pink-500/30',
          connections: ['price-estimation', 'market-analysis', 'risk-assessment'],
          data: ['NFT metadata', 'Market trends', 'Price predictions'],
          security: ['Metadata validation', 'Source verification', 'Prediction accuracy'],
          errors: ['Metadata error', 'Source failure', 'Prediction error']
        },
        {
          id: 'threat-detection',
          title: 'Threat Detection',
          description: 'AI risk engine for suspicious patterns and anomalies',
          icon: AlertTriangle,
          color: 'text-pink-400',
          bgColor: 'bg-pink-500/20 border-pink-500/30',
          connections: ['pattern-detection', 'anomaly-detection', 'threat-response'],
          data: ['Risk signals', 'Threat indicators', 'Response actions'],
          security: ['Signal validation', 'Threat verification', 'Response validation'],
          errors: ['Detection failure', 'False positive', 'Response error']
        }
      ]
    },
    {
      id: 'storage',
      title: 'Data Storage & Persistence',
      color: 'indigo',
      steps: [
        {
          id: 'backend-storage',
          title: 'Backend Storage',
          description: 'In-memory structures and persistent storage systems',
          icon: Database,
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/20 border-indigo-500/30',
          connections: ['in-memory-data', 'persistent-storage', 'audit-trails'],
          data: ['User profiles', 'Transaction logs', 'Performance metrics'],
          security: ['Data encryption', 'Access control', 'Backup systems'],
          errors: ['Storage failure', 'Data corruption', 'Backup failure']
        },
        {
          id: 'blockchain-storage',
          title: 'Blockchain Storage',
          description: 'Multi-chain data storage and smart contract state',
          icon: Hash,
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/20 border-indigo-500/30',
          connections: ['zetachain-storage', 'ethereum-storage', 'solana-storage'],
          data: ['Contract state', 'Transaction data', 'Event logs'],
          security: ['Blockchain security', 'Contract validation', 'State verification'],
          errors: ['Chain failure', 'Contract error', 'State corruption']
        },
        {
          id: 'cache-management',
          title: 'Cache Management',
          description: 'Redis, in-memory caching, and CDN integration',
          icon: Zap,
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/20 border-indigo-500/30',
          connections: ['redis-cache', 'memory-cache', 'cdn-integration'],
          data: ['Session data', 'Frequently accessed data', 'Static assets'],
          security: ['Cache validation', 'Data integrity', 'Access control'],
          errors: ['Cache failure', 'Data corruption', 'CDN error']
        }
      ]
    },
    {
      id: 'communication',
      title: 'Real-Time Communication',
      color: 'teal',
      steps: [
        {
          id: 'websocket-integration',
          title: 'WebSocket Integration',
          description: 'Real-time updates and live data streaming',
          icon: Wifi,
          color: 'text-teal-400',
          bgColor: 'bg-teal-500/20 border-teal-500/30',
          connections: ['portfolio-updates', 'transaction-notifications', 'market-updates'],
          data: ['Live data', 'Real-time events', 'Streaming updates'],
          security: ['Connection validation', 'Data encryption', 'Rate limiting'],
          errors: ['Connection failure', 'Data loss', 'Rate limit exceeded']
        },
        {
          id: 'webhook-system',
          title: 'Webhook System',
          description: 'External notifications and API integrations',
          icon: Bell,
          color: 'text-teal-400',
          bgColor: 'bg-teal-500/20 border-teal-500/30',
          connections: ['zetachain-events', 'cross-chain-confirmations', 'security-alerts'],
          data: ['Event notifications', 'Transaction confirmations', 'Security alerts'],
          security: ['Webhook validation', 'Signature verification', 'Endpoint security'],
          errors: ['Webhook failure', 'Signature invalid', 'Endpoint error']
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      color: 'yellow',
      steps: [
        {
          id: 'encryption-privacy',
          title: 'Encryption & Privacy',
          description: 'End-to-end encryption and privacy protection',
          icon: Lock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20 border-yellow-500/30',
          connections: ['end-to-end-encryption', 'private-key-protection', 'zero-knowledge-proofs'],
          data: ['Encrypted data', 'Private keys', 'Privacy proofs'],
          security: ['Encryption standards', 'Key management', 'Privacy validation'],
          errors: ['Encryption failure', 'Key compromise', 'Privacy breach']
        },
        {
          id: 'audit-monitoring',
          title: 'Audit & Monitoring',
          description: 'Comprehensive logging and security monitoring',
          icon: Eye,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20 border-yellow-500/30',
          connections: ['operation-logging', 'security-tracking', 'performance-monitoring'],
          data: ['Audit logs', 'Security events', 'Performance metrics'],
          security: ['Log integrity', 'Event validation', 'Metric accuracy'],
          errors: ['Logging failure', 'Event loss', 'Metric error']
        }
      ]
    },
    {
      id: 'user-experience',
      title: 'User Experience & Output',
      color: 'emerald',
      steps: [
        {
          id: 'dashboard-display',
          title: 'Dashboard Display',
          description: 'Real-time portfolio overview and analytics',
          icon: BarChart3,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20 border-emerald-500/30',
          connections: ['portfolio-overview', 'interactive-charts', 'transaction-history'],
          data: ['Portfolio data', 'Chart data', 'Transaction data'],
          security: ['Data validation', 'Display security', 'Access control'],
          errors: ['Display error', 'Data corruption', 'Access denied']
        },
        {
          id: 'notification-system',
          title: 'Notification System',
          description: 'Real-time alerts and user notifications',
          icon: Bell,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20 border-emerald-500/30',
          connections: ['price-alerts', 'transaction-notifications', 'security-warnings'],
          data: ['Alert data', 'Notification content', 'User preferences'],
          security: ['Alert validation', 'Content filtering', 'Preference security'],
          errors: ['Alert failure', 'Content error', 'Preference corruption']
        },
        {
          id: 'mobile-responsiveness',
          title: 'Mobile Responsiveness',
          description: 'Touch-friendly interface and PWA capabilities',
          icon: Smartphone,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20 border-emerald-500/30',
          connections: ['responsive-design', 'touch-interface', 'offline-functionality'],
          data: ['Mobile data', 'Touch events', 'Offline data'],
          security: ['Mobile security', 'Touch validation', 'Offline security'],
          errors: ['Mobile error', 'Touch failure', 'Offline error']
        }
      ]
    }
  ];

  const getSection = () => dataFlowSections.find(s => s.id === selectedSection) || dataFlowSections[0];

  const getStep = (id: string) => getSection().steps.find(s => s.id === id);

  const renderFlowDiagram = () => (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Aegis AI Liquid Vault - User Data Flow</h2>
        <p className="text-gray-400">Complete technical data flow with maximum detail</p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {dataFlowSections.map(section => (
          <button
            key={section.id}
            onClick={() => setSelectedSection(section.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedSection === section.id
                ? 'bg-primary text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Flow Steps */}
      <div className="space-y-4">
        {getSection().steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connection Lines */}
            {index > 0 && (
              <div className="absolute left-6 top-0 w-0.5 h-8 bg-gray-600 transform -translate-y-8"></div>
            )}
            
            {/* Step Card */}
            <div className={`p-4 rounded-lg border ${step.bgColor} hover:scale-105 transition-all duration-200 cursor-pointer`}
                 onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.bgColor} flex-shrink-0`}>
                  <step.icon size={24} className={step.color} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{step.description}</p>
                  
                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Connections:</span>
                      <div className="text-gray-300 mt-1">
                        {step.connections.slice(0, 2).map(conn => (
                          <div key={conn} className="flex items-center gap-1">
                            <ArrowRight size={12} className="text-blue-400" />
                            {conn.replace('-', ' ')}
                          </div>
                        ))}
                        {step.connections.length > 2 && (
                          <div className="text-blue-400">+{step.connections.length - 2} more</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Data:</span>
                      <div className="text-gray-300 mt-1">
                        {step.data.slice(0, 2).map(item => (
                          <div key={item} className="flex items-center gap-1">
                            <Database size={12} className="text-green-400" />
                            {item}
                          </div>
                        ))}
                        {step.data.length > 2 && (
                          <div className="text-green-400">+{step.data.length - 2} more</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Security:</span>
                      <div className="text-gray-300 mt-1">
                        {step.security.slice(0, 2).map(sec => (
                          <div key={sec} className="flex items-center gap-1">
                            <Shield size={12} className="text-yellow-400" />
                            {sec}
                          </div>
                        ))}
                        {step.security.length > 2 && (
                          <div className="text-yellow-400">+{step.security.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Eye size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {selectedStep === step.id && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Connections */}
                    <div>
                      <h4 className="font-medium mb-3 text-gray-300 flex items-center gap-2">
                        <Network size={16} className="text-blue-400" />
                        Connections
                      </h4>
                      <div className="space-y-2">
                        {step.connections.map(conn => (
                          <div key={conn} className="flex items-center gap-2 text-sm">
                            <ArrowRight size={14} className="text-blue-400" />
                            <span className="text-gray-300">{conn.replace('-', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Data Flow */}
                    <div>
                      <h4 className="font-medium mb-3 text-gray-300 flex items-center gap-2">
                        <Database size={16} className="text-green-400" />
                        Data Flow
                      </h4>
                      <div className="space-y-2">
                        {step.data.map(item => (
                          <div key={item} className="flex items-center gap-2 text-sm">
                            <Database size={14} className="text-green-400" />
                            <span className="text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Security Measures */}
                    <div>
                      <h4 className="font-medium mb-3 text-gray-300 flex items-center gap-2">
                        <Shield size={16} className="text-yellow-400" />
                        Security Measures
                      </h4>
                      <div className="space-y-2">
                        {step.security.map(sec => (
                          <div key={sec} className="flex items-center gap-2 text-sm">
                            <Shield size={14} className="text-yellow-400" />
                            <span className="text-gray-300">{sec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Error Handling */}
                    <div>
                      <h4 className="font-medium mb-3 text-gray-300 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        Error Handling
                      </h4>
                      <div className="space-y-2">
                        {step.errors.map(error => (
                          <div key={error} className="flex items-center gap-2 text-sm">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-gray-300">{error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Network size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Data Flow Diagram</h1>
            <p className="text-gray-400">
              Extremely detailed technical diagram showing complete user data processing in Aegis AI Liquid Vault
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Platform:</span>
          <span className="font-medium text-white">Aegis AI Liquid Vault</span>
          <span>•</span>
          <span>Type:</span>
          <span className="font-medium text-white">Multi-Chain DeFi</span>
          <span>•</span>
          <span>Focus:</span>
          <span className="font-medium text-white">User Data Flow</span>
        </div>
      </div>

      {/* Flow Diagram */}
      {renderFlowDiagram()}

      {/* Technical Summary */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code size={20} className="text-blue-400" />
          Technical Implementation Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Frontend Architecture</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• React 18 with TypeScript</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Context API for state management</li>
              <li>• Component-based architecture</li>
              <li>• Responsive design with PWA support</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Backend Infrastructure</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Express.js with TypeScript</li>
              <li>• JWT authentication & API keys</li>
              <li>• Rate limiting & security headers</li>
              <li>• WebSocket for real-time updates</li>
              <li>• Redis caching & CDN integration</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Blockchain Integration</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• ZetaChain as identity anchor</li>
              <li>• Multi-chain smart contracts</li>
              <li>• Cross-chain messaging</li>
              <li>• Oracle price feeds</li>
              <li>• Real-time event monitoring</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-300">AI & Security</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Google Gemini 2.5 integration</li>
              <li>• AI-powered risk assessment</li>
              <li>• Real-time threat detection</li>
              <li>• Multi-factor authentication</li>
              <li>• End-to-end encryption</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDataFlowDiagram;
