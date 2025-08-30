import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  BarChart3,
  Zap,
  Cpu,
  Database,
  Network,
  Activity
} from 'lucide-react';

interface AIModelMetrics {
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  responseTime: number;
  throughput: number;
  modelVersion: string;
  lastUpdated: string;
}

interface ThreatAnalysis {
  threatId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  features: string[];
  chainId: string;
  timestamp: string;
  aiReasoning: string;
}

interface ModelTransparency {
  modelArchitecture: string;
  trainingData: string;
  featureEngineering: string;
  validationMethod: string;
  biasMitigation: string;
  explainability: string;
}

const AITransparencyDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'models' | 'analysis' | 'performance'>('overview');
  const [aiMetrics, setAiMetrics] = useState<AIModelMetrics>({
    accuracy: 94.2,
    falsePositiveRate: 2.1,
    falseNegativeRate: 3.7,
    responseTime: 0.8,
    throughput: 1250,
    modelVersion: 'Gemini 2.5 Pro',
    lastUpdated: '2024-01-15T10:30:00Z'
  });

  const [recentThreats, setRecentThreats] = useState<ThreatAnalysis[]>([
    {
      threatId: 'TH-001',
      severity: 'high',
      confidence: 89.5,
      features: ['Unusual gas patterns', 'Contract interaction anomalies', 'Cross-chain flow irregularities'],
      chainId: 'ethereum',
      timestamp: '2024-01-15T10:25:00Z',
      aiReasoning: 'Detected suspicious contract interactions with high gas consumption patterns consistent with MEV attacks. Cross-chain flow analysis revealed coordinated activity across multiple networks.'
    },
    {
      threatId: 'TH-002',
      severity: 'medium',
      confidence: 76.3,
      features: ['Liquidity pool manipulation', 'Price oracle discrepancies'],
      chainId: 'avalanche',
      timestamp: '2024-01-15T10:20:00Z',
      aiReasoning: 'Identified potential liquidity manipulation through analysis of pool depth changes and price movements. Oracle data validation flagged inconsistencies in price feeds.'
    }
  ]);

  const [modelTransparency, setModelTransparency] = useState<ModelTransparency>({
    modelArchitecture: 'Transformer-based architecture with cross-chain attention mechanisms',
    trainingData: 'Multi-chain transaction data, historical attack patterns, DeFi protocol interactions',
    featureEngineering: 'Dynamic feature extraction based on cross-chain transaction patterns, gas analysis, and temporal correlations',
    validationMethod: 'Cross-validation with holdout sets, adversarial testing, and real-world incident validation',
    biasMitigation: 'Balanced training datasets, fairness constraints, and continuous bias monitoring',
    explainability: 'SHAP analysis, attention visualization, and feature importance ranking for all threat classifications'
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Brain },
    { id: 'models', name: 'AI Models', icon: Cpu },
    { id: 'analysis', name: 'Threat Analysis', icon: Shield },
    { id: 'performance', name: 'Performance', icon: BarChart3 },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI System Status */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain size={20} className="text-purple-400" />
          AI System Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{aiMetrics.accuracy}%</div>
            <div className="text-sm text-gray-400">Accuracy Rate</div>
          </div>
          
          <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{aiMetrics.responseTime}s</div>
            <div className="text-sm text-gray-400">Response Time</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{aiMetrics.throughput}</div>
            <div className="text-sm text-gray-400">TPS Analyzed</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Model Version:</span>
            <span className="font-medium">{aiMetrics.modelVersion}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-400">Last Updated:</span>
            <span className="font-medium">{new Date(aiMetrics.lastUpdated).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Real-time Monitoring */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} className="text-cyan-400" />
          Real-time Threat Monitoring
        </h3>
        
        <div className="space-y-3">
          {recentThreats.map((threat, index) => (
            <div key={threat.threatId} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-blue-400">{threat.threatId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    threat.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    threat.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(threat.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Confidence: {threat.confidence}%</div>
                  <div className="text-sm text-gray-400 mb-1">Chain: {threat.chainId}</div>
                  <div className="text-sm text-gray-400 mb-2">Features Detected:</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {threat.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle size={12} className="text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">AI Reasoning:</div>
                  <p className="text-xs text-gray-300 leading-relaxed">{threat.aiReasoning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparency Features */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye size={20} className="text-green-400" />
          Transparency Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Open-source AI logic components</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Real-time threat scoring methodology</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Feature importance visualization</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Bias detection and mitigation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Community audit capabilities</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Continuous model validation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModels = () => (
    <div className="space-y-6">
      {/* Model Architecture */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu size={20} className="text-blue-400" />
          AI Model Architecture
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Model Overview</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{modelTransparency.modelArchitecture}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Training Data Sources</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{modelTransparency.trainingData}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Feature Engineering</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{modelTransparency.featureEngineering}</p>
          </div>
        </div>
      </div>

      {/* Validation & Bias */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-green-400" />
          Validation & Bias Mitigation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Validation Methodology</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{modelTransparency.validationMethod}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 text-gray-300">Bias Mitigation</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{modelTransparency.biasMitigation}</p>
          </div>
        </div>
      </div>

      {/* Explainability */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye size={20} className="text-cyan-400" />
          Model Explainability
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{modelTransparency.explainability}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="text-lg font-bold text-blue-400">SHAP</div>
            <div className="text-xs text-gray-400">Feature Attribution</div>
          </div>
          
          <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="text-lg font-bold text-green-400">Attention</div>
            <div className="text-xs text-gray-400">Visualization</div>
          </div>
          
          <div className="text-center p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <div className="text-lg font-bold text-purple-400">Importance</div>
            <div className="text-xs text-gray-400">Ranking</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {/* Threat Detection Flow */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          Threat Detection Flow
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
            <div>
              <h4 className="font-medium text-gray-300">Data Collection</h4>
              <p className="text-sm text-gray-400">Real-time monitoring of cross-chain transactions, gas patterns, and contract interactions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
            <div>
              <h4 className="font-medium text-gray-300">Feature Extraction</h4>
              <p className="text-sm text-gray-400">Dynamic feature engineering based on transaction patterns and temporal correlations</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
            <div>
              <h4 className="font-medium text-gray-300">AI Analysis</h4>
              <p className="text-sm text-gray-400">Gemini 2.5 Pro processes features to identify threats and generate confidence scores</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">4</div>
            <div>
              <h4 className="font-medium text-gray-300">Response Generation</h4>
              <p className="text-sm text-gray-400">Automated threat response with human oversight and explainable reasoning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Analysis */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-purple-400" />
          Feature Analysis & Importance
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-300">Transaction Patterns</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas consumption</span>
                  <span className="text-green-400">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequency</span>
                  <span className="text-yellow-400">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timing</span>
                  <span className="text-blue-400">High</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-300">Cross-Chain Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Flow patterns</span>
                  <span className="text-red-400">Critical</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bridge usage</span>
                  <span className="text-orange-400">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Asset movement</span>
                  <span className="text-yellow-400">Medium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-400" />
          Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{aiMetrics.accuracy}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
            <div className="text-xs text-gray-500 mt-1">Target: 95%</div>
          </div>
          
          <div className="text-center p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{aiMetrics.falsePositiveRate}%</div>
            <div className="text-sm text-gray-400">False Positives</div>
            <div className="text-xs text-gray-500 mt-1">Target: <2%</div>
          </div>
          
          <div className="text-center p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{aiMetrics.falseNegativeRate}%</div>
            <div className="text-sm text-gray-400">False Negatives</div>
            <div className="text-xs text-gray-500 mt-1">Target: <3%</div>
          </div>
          
          <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{aiMetrics.responseTime}s</div>
            <div className="text-sm text-gray-400">Response Time</div>
            <div className="text-xs text-gray-500 mt-1">Target: <1s</div>
          </div>
        </div>
      </div>

      {/* Scalability Metrics */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network size={20} className="text-cyan-400" />
          Scalability & Throughput
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300">Current Throughput</span>
            <span className="font-medium text-green-400">{aiMetrics.throughput} TPS</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300">Peak Capacity</span>
            <span className="font-medium text-blue-400">5,000 TPS</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300">Average Response Time</span>
            <span className="font-medium text-yellow-400">{aiMetrics.responseTime}s</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-300">99th Percentile</span>
            <span className="font-medium text-orange-400">2.1s</span>
          </div>
        </div>
      </div>

      {/* Continuous Improvement */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-purple-400" />
          Continuous Improvement
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            <span>Real-time model performance monitoring</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            <span>Automated retraining on new threat patterns</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            <span>Community feedback integration</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle size={16} className="text-green-400" />
            <span>Regular security audits and penetration testing</span>
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
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Brain size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Transparency Dashboard</h1>
            <p className="text-gray-400">
              Complete visibility into AEGIS AI threat detection models, performance metrics, and decision-making processes
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Model Version:</span>
          <span className="font-medium text-white">{aiMetrics.modelVersion}</span>
          <span>•</span>
          <span>Last Updated:</span>
          <span className="font-medium text-white">{new Date(aiMetrics.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-primary text-white border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'models' && renderModels()}
          {selectedTab === 'analysis' && renderAnalysis()}
          {selectedTab === 'performance' && renderPerformance()}
        </div>
      </div>
    </div>
  );
};

export default AITransparencyDashboard;
