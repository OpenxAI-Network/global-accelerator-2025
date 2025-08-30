import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  BarChart3,
  Zap,
  Network,
  Activity,
  Globe,
  Users,
  Award,
  Clock,
  Hash
} from 'lucide-react';

interface OracleProvider {
  id: string;
  name: string;
  type: 'government' | 'consortium' | 'decentralized' | 'reputation-based';
  reputation: number;
  uptime: number;
  responseTime: number;
  dataSources: string[];
  lastUpdate: string;
  status: 'active' | 'degraded' | 'inactive';
  stake: number;
  validations: number;
}

interface OracleData {
  dataId: string;
  type: 'death-verification' | 'price-feed' | 'identity-verification' | 'risk-assessment';
  value: any;
  confidence: number;
  providers: string[];
  consensus: number;
  timestamp: string;
  blockchain: string;
}

interface OracleNetwork {
  totalProviders: number;
  activeProviders: number;
  totalStake: number;
  averageReputation: number;
  consensusThreshold: number;
  lastConsensus: string;
}

const DecentralizedOracleDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'providers' | 'data' | 'consensus'>('overview');
  const [oracleNetwork, setOracleNetwork] = useState<OracleNetwork>({
    totalProviders: 24,
    activeProviders: 21,
    totalStake: 2500000,
    averageReputation: 87.3,
    consensusThreshold: 75,
    lastConsensus: '2024-01-15T10:30:00Z'
  });

  const [oracleProviders, setOracleProviders] = useState<OracleProvider[]>([
    {
      id: 'gov-001',
      name: 'US Social Security Administration',
      type: 'government',
      reputation: 95.2,
      uptime: 99.8,
      responseTime: 0.3,
      dataSources: ['Federal Death Records', 'Social Security Database'],
      lastUpdate: '2024-01-15T10:25:00Z',
      status: 'active',
      stake: 0,
      validations: 15420
    },
    {
      id: 'consortium-001',
      name: 'Global Identity Consortium',
      type: 'consortium',
      reputation: 88.7,
      uptime: 99.5,
      responseTime: 0.8,
      dataSources: ['Multi-national ID databases', 'Biometric verification'],
      lastUpdate: '2024-01-15T10:20:00Z',
      status: 'active',
      stake: 50000,
      validations: 8920
    },
    {
      id: 'decentralized-001',
      name: 'Chainlink Death Oracle',
      type: 'decentralized',
      reputation: 82.3,
      uptime: 99.2,
      responseTime: 1.2,
      dataSources: ['Public records', 'Blockchain data', 'Community verification'],
      lastUpdate: '2024-01-15T10:15:00Z',
      status: 'active',
      stake: 150000,
      validations: 5670
    },
    {
      id: 'reputation-001',
      name: 'Community Validators Network',
      type: 'reputation-based',
      reputation: 79.8,
      uptime: 98.9,
      responseTime: 2.1,
      dataSources: ['Community reports', 'Social media', 'Public records'],
      lastUpdate: '2024-01-15T10:10:00Z',
      status: 'active',
      stake: 25000,
      validations: 3240
    },
    {
      id: 'gov-002',
      name: 'UK General Register Office',
      type: 'government',
      reputation: 93.1,
      uptime: 99.7,
      responseTime: 0.5,
      dataSources: ['UK Death Records', 'National Statistics'],
      lastUpdate: '2024-01-15T10:05:00Z',
      status: 'active',
      stake: 0,
      validations: 12340
    },
    {
      id: 'decentralized-002',
      name: 'Pyth Network Oracle',
      type: 'decentralized',
      reputation: 85.6,
      uptime: 99.4,
      responseTime: 0.9,
      dataSources: ['Real-time data feeds', 'Multi-source aggregation'],
      lastUpdate: '2024-01-15T10:00:00Z',
      status: 'active',
      stake: 200000,
      validations: 7890
    }
  ]);

  const [oracleData, setOracleData] = useState<OracleData[]>([
    {
      dataId: 'DEATH-001',
      type: 'death-verification',
      value: { verified: true, date: '2024-01-10', confidence: 94.2 },
      confidence: 94.2,
      providers: ['gov-001', 'consortium-001', 'decentralized-001'],
      consensus: 92.8,
      timestamp: '2024-01-15T10:25:00Z',
      blockchain: 'ethereum'
    },
    {
      dataId: 'PRICE-001',
      type: 'price-feed',
      value: { asset: 'ETH', price: 2850.50, volume: 1250000 },
      confidence: 98.7,
      providers: ['decentralized-002', 'consortium-001'],
      consensus: 97.3,
      timestamp: '2024-01-15T10:20:00Z',
      blockchain: 'zetachain'
    },
    {
      dataId: 'IDENTITY-001',
      type: 'identity-verification',
      value: { verified: true, method: 'biometric', confidence: 89.5 },
      confidence: 89.5,
      providers: ['consortium-001', 'reputation-001'],
      consensus: 87.2,
      timestamp: '2024-01-15T10:15:00Z',
      blockchain: 'avalanche'
    }
  ]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Database },
    { id: 'providers', name: 'Oracle Providers', icon: Network },
    { id: 'data', name: 'Data Feeds', icon: Activity },
    { id: 'consensus', name: 'Consensus', icon: Shield },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'government': return 'text-blue-400';
      case 'consortium': return 'text-green-400';
      case 'decentralized': return 'text-purple-400';
      case 'reputation-based': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'government': return 'bg-blue-500/20 border-blue-500/30';
      case 'consortium': return 'bg-green-500/20 border-green-500/30';
      case 'decentralized': return 'bg-purple-500/20 border-purple-500/30';
      case 'reputation-based': return 'bg-orange-500/20 border-orange-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'inactive': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 border-green-500/30';
      case 'degraded': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'inactive': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Network Status */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network size={20} className="text-blue-400" />
          Oracle Network Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{oracleNetwork.activeProviders}</div>
            <div className="text-sm text-gray-400">Active Providers</div>
            <div className="text-xs text-gray-500 mt-1">of {oracleNetwork.totalProviders}</div>
          </div>
          
          <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{oracleNetwork.averageReputation}%</div>
            <div className="text-sm text-gray-400">Avg Reputation</div>
            <div className="text-xs text-gray-500 mt-1">Network Quality</div>
          </div>
          
          <div className="text-center p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">${(oracleNetwork.totalStake / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-400">Total Stake</div>
            <div className="text-xs text-gray-500 mt-1">Economic Security</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Consensus Threshold:</span>
            <span className="font-medium">{oracleNetwork.consensusThreshold}%</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-400">Last Consensus:</span>
            <span className="font-medium">{new Date(oracleNetwork.lastConsensus).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Provider Distribution */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} className="text-green-400" />
          Provider Distribution by Type
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['government', 'consortium', 'decentralized', 'reputation-based'].map(type => {
            const count = oracleProviders.filter(p => p.type === type).length;
            const total = oracleProviders.length;
            const percentage = ((count / total) * 100).toFixed(1);
            
            return (
              <div key={type} className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400 capitalize">{type.replace('-', ' ')}</div>
                <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Data Feeds */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} className="text-cyan-400" />
          Recent Data Feeds
        </h3>
        
        <div className="space-y-3">
          {oracleData.slice(0, 3).map((data, index) => (
            <div key={data.dataId} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-blue-400">{data.dataId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.confidence >= 90 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    data.confidence >= 80 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {data.confidence}% Confidence
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(data.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Type: {data.type.replace('-', ' ')}</div>
                  <div className="text-sm text-gray-400 mb-1">Blockchain: {data.blockchain}</div>
                  <div className="text-sm text-gray-400 mb-2">Providers: {data.providers.length}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Consensus: {data.consensus}%</div>
                  <div className="text-sm text-gray-400 mb-1">Value:</div>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                    {JSON.stringify(data.value, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProviders = () => (
    <div className="space-y-6">
      {/* Provider List */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} className="text-purple-400" />
          Oracle Providers
        </h3>
        
        <div className="space-y-4">
          {oracleProviders.map(provider => (
            <div key={provider.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBgColor(provider.type)} ${getTypeColor(provider.type)}`}>
                    {provider.type.replace('-', ' ').toUpperCase()}
                  </div>
                  <h4 className="font-medium text-white">{provider.name}</h4>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(provider.status)} ${getStatusColor(provider.status)}`}>
                    {provider.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-400">ID: {provider.id}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{provider.reputation}%</div>
                  <div className="text-xs text-gray-400">Reputation</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">{provider.uptime}%</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-400">{provider.responseTime}s</div>
                  <div className="text-xs text-gray-400">Response</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">{provider.validations}</div>
                  <div className="text-xs text-gray-400">Validations</div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Data Sources:</div>
                <div className="flex flex-wrap gap-2">
                  {provider.dataSources.map((source, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                <span>Last Update: {new Date(provider.lastUpdate).toLocaleString()}</span>
                {provider.stake > 0 && (
                  <span>Stake: ${provider.stake.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderData = () => (
    <div className="space-y-6">
      {/* Data Feed Types */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} className="text-cyan-400" />
          Data Feed Types & Quality
        </h3>
        
        <div className="space-y-4">
          {['death-verification', 'price-feed', 'identity-verification', 'risk-assessment'].map(type => {
            const typeData = oracleData.filter(d => d.type === type);
            const avgConfidence = typeData.length > 0 
              ? (typeData.reduce((sum, d) => sum + d.confidence, 0) / typeData.length).toFixed(1)
              : '0';
            
            return (
              <div key={type} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white capitalize">{type.replace('-', ' ')}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Avg Confidence:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      parseFloat(avgConfidence) >= 90 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      parseFloat(avgConfidence) >= 80 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {avgConfidence}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Feeds:</span>
                    <span className="ml-2 text-white">{typeData.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Providers Used:</span>
                    <span className="ml-2 text-white">
                      {new Set(typeData.flatMap(d => d.providers)).size}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Update:</span>
                    <span className="ml-2 text-white">
                      {typeData.length > 0 ? new Date(typeData[0].timestamp).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Data Feeds */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          Recent Data Feeds
        </h3>
        
        <div className="space-y-3">
          {oracleData.map((data, index) => (
            <div key={data.dataId} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-blue-400">{data.dataId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.confidence >= 90 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    data.confidence >= 80 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {data.confidence}% Confidence
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(data.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Type: {data.type.replace('-', ' ')}</div>
                  <div className="text-sm text-gray-400 mb-1">Blockchain: {data.blockchain}</div>
                  <div className="text-sm text-gray-400 mb-1">Consensus: {data.consensus}%</div>
                  <div className="text-sm text-gray-400 mb-2">Providers: {data.providers.join(', ')}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Data Value:</div>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                    {JSON.stringify(data.value, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConsensus = () => (
    <div className="space-y-6">
      {/* Consensus Mechanism */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-green-400" />
          Consensus Mechanism
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 text-gray-300">Multi-Provider Consensus</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Data is validated across multiple oracle providers to ensure accuracy and reliability. 
                The system requires {oracleNetwork.consensusThreshold}% agreement for data validation.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-gray-300">Reputation-Weighted Voting</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Providers with higher reputation scores have greater influence on consensus decisions. 
                This incentivizes quality and reliability in the oracle network.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-300">Consensus Process:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Data request initiated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Multiple providers queried</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">Responses aggregated and validated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">Consensus reached if threshold met</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-300">Final data published to blockchain</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award size={20} className="text-yellow-400" />
          Security & Anti-Corruption
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Stake-based economic incentives</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Reputation scoring system</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Multi-source validation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Automated slashing for bad actors</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Decentralized governance</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Community oversight</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Regular security audits</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Bug bounty programs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Health */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-400" />
          Network Health Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-300">Provider Health</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Providers:</span>
                <span className="text-green-400">{oracleNetwork.activeProviders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Providers:</span>
                <span className="text-white">{oracleNetwork.totalProviders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime Rate:</span>
                <span className="text-blue-400">{((oracleNetwork.activeProviders / oracleNetwork.totalProviders) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-300">Quality Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Reputation:</span>
                <span className="text-green-400">{oracleNetwork.averageReputation}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Stake:</span>
                <span className="text-purple-400">${(oracleNetwork.totalStake / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Consensus Threshold:</span>
                <span className="text-yellow-400">{oracleNetwork.consensusThreshold}%</span>
              </div>
            </div>
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
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Database size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Decentralized Oracle Network</h1>
            <p className="text-gray-400">
              Multi-source, reputation-based oracle system for enhanced data reliability and censorship resistance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Network Status:</span>
          <span className="font-medium text-green-400">Healthy</span>
          <span>•</span>
          <span>Last Consensus:</span>
          <span className="font-medium text-white">{new Date(oracleNetwork.lastConsensus).toLocaleDateString()}</span>
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
          {selectedTab === 'providers' && renderProviders()}
          {selectedTab === 'data' && renderData()}
          {selectedTab === 'consensus' && renderConsensus()}
        </div>
      </div>
    </div>
  );
};

export default DecentralizedOracleDashboard;
