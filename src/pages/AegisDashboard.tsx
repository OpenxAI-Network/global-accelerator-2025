import React, { useState, useEffect } from 'react';
import { Shield, Bitcoin, Coins, Network, Activity, AlertTriangle, Bot, Play, Square, Bell, Filter } from 'lucide-react';
import WalletConnect from '../components/WalletConnect';
import ThreatCard from '../components/ThreatCard';
import DashboardWidget from '../components/DashboardWidget';
import NotificationToast, { Notification } from '../components/NotificationToast';
import ThreatDetailsModal from '../components/ThreatDetailsModal';
import AssetMonitor from '../components/AssetMonitor';
import SecurityControls from '../components/SecurityControls';
import { ThreatItem, RiskMetrics } from '../types/threats';
import { ThreatDetectionService } from '../services/threatDetectionService';
import { useWallet } from '../contexts/WalletContext';

export default function AegisDashboard() {
  const { address, isConnected } = useWallet();
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [selectedChain, setSelectedChain] = useState('bitcoin');
  const [messages, setMessages] = useState<Array<{id: string, text: string, type: 'user' | 'assistant' | 'system'}>>([
    { id: '1', text: 'Hello! I am AEGIS AI Copilot. I am monitoring your cross-chain assets for threats.', type: 'assistant' },
    { id: '2', text: 'Simulation ready. All systems nominal.', type: 'system' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    totalThreats: 0,
    protectedValue: '$2.4M',
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    totalRiskScore: 0,
    averageRiskScore: 0,
    threatsByChain: {},
    threatsByCategory: {},
    lastUpdated: new Date().toISOString()
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatItem | null>(null);
  const [threatFilter, setThreatFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  let simulationInterval: ReturnType<typeof setInterval> | null = null;

  const chains = [
    { id: 'bitcoin', name: 'Bitcoin', icon: Bitcoin, color: '#f7931a' },
    { id: 'ethereum', name: 'Ethereum', icon: Coins, color: '#627eea' },
    { id: 'solana', name: 'Solana', icon: Network, color: '#9945ff' },
    { id: 'polygon', name: 'Polygon', icon: Activity, color: '#8247e5' },
    { id: 'avalanche', name: 'Avalanche', icon: AlertTriangle, color: '#e84142' },
    { id: 'binance', name: 'Binance', icon: Coins, color: '#f0b90b' }
  ];

  const assets = [
    { name: 'Bitcoin', value: '1.2 BTC', threat: 'Low', icon: Bitcoin, color: '#f7931a' },
    { name: 'Ethereum', value: '15 ETH', threat: 'Medium', icon: Coins, color: '#627eea' },
    { name: 'USDC', value: '50,000 USDC', threat: 'None', icon: Coins, color: '#4cc9f0' },
    { name: 'ZetaChain', value: '1000 ZETA', threat: 'None', icon: Network, color: '#7209b7' }
  ];

  const generateThreat = () => {
    return ThreatDetectionService.generateRealisticThreat();
  };

  const startSimulation = () => {
    setIsSimulationRunning(true);
    addMessage('🤖 Advanced AI simulation started. Gemini 2.5 Pro analysis active.', 'system');
    
    // Add initial notification
    addNotification({
      type: 'info',
      title: 'Threat Simulation Started',
      message: 'Advanced AI monitoring is now active. Real-time threat detection enabled.',
      duration: 5000
    });
    
    simulationInterval = setInterval(() => {
      const threat = generateThreat();
      setThreats(prev => {
        const newThreats = [threat, ...prev.slice(0, 9)];
        // Update risk metrics with new threat data
        const newMetrics = ThreatDetectionService.calculateRiskMetrics(newThreats);
        setRiskMetrics(newMetrics);
        return newThreats;
      });

      // Add AI copilot messages
      if (threat.severity === 'critical') {
        addMessage(`🚨 CRITICAL ALERT: ${threat.title} on ${threat.chain}! Initiating autonomous intervention.`, 'assistant');
        addNotification({
          type: 'error',
          title: 'Critical Threat Detected',
          message: `${threat.title} on ${threat.chain}. Estimated loss: ${threat.estimatedLoss}`,
          duration: 10000
        });
        setTimeout(() => {
          addMessage(`✅ Mitigation protocols activated. Threat containment in progress.`, 'assistant');
        }, 2000);
      } else if (threat.severity === 'high') {
        addMessage(`⚠️ High Risk: ${threat.title} on ${threat.chain}. Recommending immediate review.`, 'assistant');
        addNotification({
          type: 'warning',
          title: 'High Risk Threat',
          message: `${threat.title} detected. Confidence: ${threat.confidence}%`,
          duration: 7000
        });
      } else if (threat.severity === 'medium') {
        addNotification({
          type: 'warning',
          title: 'Medium Risk Alert',
          message: `${threat.category} threat on ${threat.chain}. Monitoring...`,
          duration: 5000
        });
      }
    }, 4000); // Slightly slower for better UX
  };

  const stopSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
    setIsSimulationRunning(false);
    addMessage('Simulation stopped. All systems nominal.', 'system');
  };

  const addMessage = (text: string, type: 'user' | 'assistant' | 'system') => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const viewThreatDetails = (threat: ThreatItem) => {
    setSelectedThreat(threat);
    addMessage(`📊 Viewing detailed analysis for: ${threat.title}`, 'system');
  };

  const closeThreatDetails = () => {
    setSelectedThreat(null);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addMessage(inputValue, 'user');
      setInputValue('');
      setTimeout(() => {
        addMessage('Thank you for your command. I am processing your request.', 'assistant');
      }, 1000);
    }
  };

  const resolveThreat = (id: string) => {
    setThreats(prev => {
      const updatedThreats = prev.map(threat => 
        threat.id === id ? { ...threat, status: 'resolved' as const } : threat
      );
      // Update risk metrics
      const newMetrics = ThreatDetectionService.calculateRiskMetrics(updatedThreats);
      setRiskMetrics(newMetrics);
      return updatedThreats;
    });
    
    const threat = threats.find(t => t.id === id);
    if (threat) {
      addMessage(`✅ Threat resolved: ${threat.title}. Security protocols updated.`, 'assistant');
      addNotification({
        type: 'success',
        title: 'Threat Resolved',
        message: `Successfully mitigated ${threat.title} on ${threat.chain}`,
        duration: 5000
      });
    }
  };

  const investigateThreat = (id: string) => {
    setThreats(prev => {
      const updatedThreats = prev.map(threat => 
        threat.id === id ? { ...threat, status: 'investigating' as const } : threat
      );
      // Update risk metrics
      const newMetrics = ThreatDetectionService.calculateRiskMetrics(updatedThreats);
      setRiskMetrics(newMetrics);
      return updatedThreats;
    });
    
    const threat = threats.find(t => t.id === id);
    if (threat) {
      addMessage(`🔍 Investigation started: ${threat.title}. Deep analysis in progress.`, 'assistant');
      addNotification({
        type: 'info',
        title: 'Investigation Started',
        message: `Analyzing ${threat.title} with confidence ${threat.confidence}%`,
        duration: 5000
      });
    }
  };

  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-dark text-white">
      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-5">
        {/* Header */}
        <header className="flex justify-between items-center p-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AEGIS
              </h1>
              <span className="text-sm text-muted-foreground tracking-wide">AI-POWERED SECURITY</span>
            </div>
          </div>
          <div className="flex gap-4">
            <WalletConnect />
            <button className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-2">
              <AlertTriangle size={16} />
              Alerts <span className="ml-1 bg-warning text-warning-foreground px-2 py-1 rounded-full text-xs">3</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-effect border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Network size={20} />
                Monitored Chains
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      selectedChain === chain.id
                        ? 'border-primary bg-primary/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <chain.icon size={20} className="mx-auto mb-1" style={{ color: chain.color }} />
                    <div className="text-xs">{chain.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-effect border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Activity size={20} />
                Risk Matrix
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DashboardWidget
                  title="Total Threats"
                  value={riskMetrics.totalThreats}
                  icon={AlertTriangle}
                  color="#f59e0b"
                  trend={riskMetrics.totalThreats > 0 ? { value: 12, isPositive: false } : undefined}
                />
                <DashboardWidget
                  title="Protected Value"
                  value={riskMetrics.protectedValue}
                  icon={Shield}
                  color="#10b981"
                />
                <DashboardWidget
                  title="Critical"
                  value={riskMetrics.critical}
                  icon={AlertTriangle}
                  color="#ef4444"
                  trend={riskMetrics.critical > 0 ? { value: 25, isPositive: false } : undefined}
                />
                <DashboardWidget
                  title="High Risk"
                  value={riskMetrics.high}
                  icon={Activity}
                  color="#f97316"
                  trend={riskMetrics.high > 0 ? { value: 8, isPositive: false } : undefined}
                />
              </div>
              
              {/* Additional Risk Metrics */}
              {riskMetrics.totalThreats > 0 && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Average Risk Score:</span>
                    <span className={`font-bold ${
                      riskMetrics.averageRiskScore > 80 ? 'text-red-400' :
                      riskMetrics.averageRiskScore > 60 ? 'text-orange-400' :
                      'text-yellow-400'
                    }`}>
                      {riskMetrics.averageRiskScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">
                      {new Date(riskMetrics.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-effect border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Bot size={20} />
                AI Controls
              </h3>
              <div className="space-y-4">
                {isSimulationRunning ? (
                  <button onClick={stopSimulation} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    <Square size={16} />
                    Stop Simulation
                  </button>
                ) : (
                  <button onClick={startSimulation} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <Play size={16} />
                    Start Simulation
                  </button>
                )}
              </div>
            </div>

            {/* Security Controls */}
            <SecurityControls 
              contractAddress="0x1234567890123456789012345678901234567890" // Example contract address
              connectedWallet={isConnected ? address : undefined}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="glass-effect border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Real-time Threat Stream</h2>
                  <p className="text-sm text-muted-foreground">Live monitoring of cross-chain activities</p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={threatFilter}
                    onChange={(e) => setThreatFilter(e.target.value as any)}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Threats</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {threats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium mb-2">No threats detected</h3>
                    <p className="text-sm">Click "Start Simulation" to begin advanced AI monitoring</p>
                  </div>
                ) : (
                  threats
                    .filter(threat => threatFilter === 'all' || threat.severity === threatFilter)
                    .map((threat) => (
                      <ThreatCard
                        key={threat.id}
                        threat={threat}
                        onResolve={resolveThreat}
                        onInvestigate={investigateThreat}
                        onViewDetails={viewThreatDetails}
                      />
                    ))
                )}
              </div>
            </div>

            <AssetMonitor connectedWallet={isConnected ? address : undefined} />
          </div>

          {/* AI Copilot */}
          <div className="lg:col-span-1">
            <div className="glass-effect border border-white/10 rounded-xl h-full flex flex-col">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">AEGIS AI Copilot</h2>
                    <p className="text-sm text-muted-foreground">How can I assist you?</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-2xl max-w-[90%] text-sm ${
                        message.type === 'user'
                          ? 'bg-primary/20 border-primary/30 ml-auto'
                          : message.type === 'assistant'
                          ? 'glass-effect border-white/5'
                          : 'bg-secondary/15 border-secondary/30 mx-auto text-center'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/10 flex gap-2">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask AEGIS a question or give a command..."
                    className="flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={handleSendMessage} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90">
                    <Bot size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Threat Details Modal */}
      <ThreatDetailsModal
        threat={selectedThreat}
        isOpen={selectedThreat !== null}
        onClose={closeThreatDetails}
        onResolve={resolveThreat}
        onInvestigate={investigateThreat}
      />
    </div>
  );
}