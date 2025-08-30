import React, { useState, useEffect, useCallback } from 'react';
import { 
  Network, 
  MessageSquare, 
  FileText, 
  Activity, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Users,
  BarChart3,
  Send,
  Receive,
  Database,
  Zap,
  Target,
  AlertCircle,
  Play,
  Pause,
  Power,
  Wifi,
  WifiOff,
  HardDrive,
  Cpu,
  Memory,
  HardDriveIcon
} from 'lucide-react';
import { createZetaChainGateway, ZetaChainConfig, CrossChainMessage, ChainStatus } from '../services/ZetaChainGateway';

interface ZetaChainStats {
  totalCollaterals: number;
  totalLoans: number;
  activeLoans: number;
  totalValueLocked: string;
}

interface ContractInteraction {
  id: string;
  type: 'collateral' | 'loan' | 'repayment' | 'liquidation';
  user: string;
  amount: string;
  asset: string;
  chainId: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
}

const ZetaChainDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'messages' | 'contracts' | 'monitoring' | 'settings'>('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null);
  const [stats, setStats] = useState<ZetaChainStats | null>(null);
  const [messages, setMessages] = useState<CrossChainMessage[]>([]);
  const [contractInteractions, setContractInteractions] = useState<ContractInteraction[]>([]);
  const [gateway, setGateway] = useState<any>(null);
  const [config, setConfig] = useState<ZetaChainConfig>({
    rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
    chainId: 7001,
    gatewayAddress: '0x0000000000000000000000000000000000000000',
    universalLendingAddress: '0x0000000000000000000000000000000000000000',
    gasLimit: 500000,
    gasPrice: 20
  });

  // ============ INITIALIZATION ============

  useEffect(() => {
    initializeGateway();
    return () => {
      if (gateway) {
        gateway.disconnect();
      }
    };
  }, []);

  const initializeGateway = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      const newGateway = createZetaChainGateway(config);
      
      newGateway.on('connected', (data: any) => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setChainStatus({
          chainId: data.chainId.toString(),
          chainName: 'ZetaChain',
          isOnline: true,
          blockHeight: 0,
          gasPrice: '0',
          lastUpdate: Date.now(),
          latency: 0
        });
        console.log('Connected to ZetaChain:', data);
      });

      newGateway.on('disconnected', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setChainStatus(null);
        console.log('Disconnected from ZetaChain');
      });

      newGateway.on('error', (error: any) => {
        setConnectionStatus('error');
        console.error('ZetaChain error:', error);
      });

      newGateway.on('chainStatusUpdate', (status: ChainStatus) => {
        setChainStatus(status);
      });

      newGateway.on('newBlock', (block: any) => {
        console.log('New block:', block);
        // Update chain status with new block info
        if (chainStatus) {
          setChainStatus({
            ...chainStatus,
            blockHeight: block.blockNumber,
            lastUpdate: Date.now()
          });
        }
      });

      newGateway.on('messageQueued', (message: CrossChainMessage) => {
        setMessages(prev => [message, ...prev]);
      });

      newGateway.on('messageSent', (message: CrossChainMessage) => {
        setMessages(prev => prev.map(msg => 
          msg.messageId === message.messageId ? message : msg
        ));
      });

      newGateway.on('messageConfirmed', (message: CrossChainMessage) => {
        setMessages(prev => prev.map(msg => 
          msg.messageId === message.messageId ? message : msg
        ));
      });

      newGateway.on('messageFailed', (data: { message: CrossChainMessage; error: any }) => {
        setMessages(prev => prev.map(msg => 
          msg.messageId === data.message.messageId ? data.message : msg
        ));
      });

      setGateway(newGateway);

    } catch (error) {
      console.error('Failed to initialize gateway:', error);
      setConnectionStatus('error');
    }
  }, [config]);

  // ============ DATA FETCHING ============

  useEffect(() => {
    if (gateway && isConnected) {
      fetchContractStats();
      fetchContractInteractions();
    }
  }, [gateway, isConnected]);

  const fetchContractStats = async () => {
    try {
      if (gateway) {
        const contractStats = await gateway.getContractStats();
        setStats(contractStats);
      }
    } catch (error) {
      console.error('Failed to fetch contract stats:', error);
    }
  };

  const fetchContractInteractions = async () => {
    try {
      // Simulate contract interactions for demo
      const mockInteractions: ContractInteraction[] = [
        {
          id: '1',
          type: 'collateral',
          user: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          amount: '1.5',
          asset: 'ETH',
          chainId: 1,
          timestamp: Date.now() - 3600000,
          status: 'confirmed',
          transactionHash: '0x123...abc'
        },
        {
          id: '2',
          type: 'loan',
          user: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          amount: '1000',
          asset: 'USDC',
          chainId: 137,
          timestamp: Date.now() - 1800000,
          status: 'confirmed',
          transactionHash: '0x456...def'
        }
      ];
      setContractInteractions(mockInteractions);
    } catch (error) {
      console.error('Failed to fetch contract interactions:', error);
    }
  };

  // ============ ACTIONS ============

  const handleConnect = () => {
    if (gateway) {
      gateway.disconnect();
    }
    initializeGateway();
  };

  const handleDisconnect = () => {
    if (gateway) {
      gateway.disconnect();
    }
  };

  const handleRefresh = () => {
    fetchContractStats();
    fetchContractInteractions();
  };

  const sendTestMessage = async () => {
    if (!gateway || !isConnected) return;

    try {
      const messageId = await gateway.sendCrossChainMessage(
        'ethereum',
        'DEPOSIT',
        {
          user: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          amount: '1.0',
          asset: 'ETH',
          chainId: 1
        }
      );
      console.log('Test message sent:', messageId);
    } catch (error) {
      console.error('Failed to send test message:', error);
    }
  };

  // ============ RENDER FUNCTIONS ============

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Network size={20} className="text-blue-400" />
            ZetaChain Connection Status
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleConnect}
              disabled={isConnected}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded font-medium transition-colors flex items-center gap-2"
            >
              <Power size={16} />
              Connect
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!isConnected}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded font-medium transition-colors flex items-center gap-2"
            >
              <Power size={16} />
              Disconnect
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${
            connectionStatus === 'connected' ? 'bg-green-500/20 border-green-500/30' :
            connectionStatus === 'connecting' ? 'bg-yellow-500/20 border-yellow-500/30' :
            connectionStatus === 'error' ? 'bg-red-500/20 border-red-500/30' :
            'bg-gray-500/20 border-gray-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {connectionStatus === 'connected' ? <Wifi size={20} className="text-green-400" /> :
               connectionStatus === 'connecting' ? <Clock size={20} className="text-yellow-400" /> :
               connectionStatus === 'error' ? <AlertCircle size={20} className="text-red-400" /> :
               <WifiOff size={20} className="text-gray-400" />}
              <span className="font-medium text-white">Status</span>
            </div>
            <div className="text-lg font-bold text-white capitalize">{connectionStatus}</div>
          </div>
          
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive size={20} className="text-blue-400" />
              <span className="font-medium text-white">Chain ID</span>
            </div>
            <div className="text-lg font-bold text-white">{config.chainId}</div>
          </div>
          
          <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} className="text-purple-400" />
              <span className="font-medium text-white">RPC Endpoint</span>
            </div>
            <div className="text-sm text-white truncate">{config.rpcUrl}</div>
          </div>
        </div>
      </div>

      {/* Chain Status */}
      {chainStatus && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-green-400" />
            Real-Time Chain Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{chainStatus.blockHeight.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Block Height</div>
            </div>
            
            <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{chainStatus.gasPrice} Gwei</div>
              <div className="text-sm text-gray-400">Gas Price</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{chainStatus.latency}ms</div>
              <div className="text-sm text-gray-400">Latency</div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {new Date(chainStatus.lastUpdate).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-400">Last Update</div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Statistics */}
      {stats && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-400" />
            Contract Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{stats.totalCollaterals}</div>
              <div className="text-sm text-gray-400">Total Collaterals</div>
            </div>
            
            <div className="text-center p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{stats.totalLoans}</div>
              <div className="text-sm text-gray-400">Total Loans</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{stats.activeLoans}</div>
              <div className="text-sm text-gray-400">Active Loans</div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">${stats.totalValueLocked}</div>
              <div className="text-sm text-gray-400">Total Value Locked</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          Quick Actions
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={sendTestMessage}
            disabled={!isConnected}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Send size={16} />
            Send Test Message
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={!isConnected}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      {/* Message Queue */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-400" />
          Cross-Chain Message Queue
        </h3>
        
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No messages in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(message => (
              <div key={message.messageId} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-300">#{message.messageId}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      message.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      message.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {message.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">From:</span>
                    <span className="text-white ml-2">{message.fromChain}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">To:</span>
                    <span className="text-white ml-2">{message.toChain}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white ml-2">{message.messageType}</span>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gray-600/50 rounded border border-gray-500">
                  <div className="text-xs text-gray-400 mb-1">Message Data:</div>
                  <div className="text-sm text-gray-300 font-mono">
                    {JSON.stringify(message.data, null, 2)}
                  </div>
                </div>
                
                {message.transactionHash && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-400">Tx Hash:</span>
                    <span className="text-blue-400 ml-2 font-mono">{message.transactionHash}</span>
                  </div>
                )}
                
                {message.gasUsed && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Gas Used:</span>
                    <span className="text-green-400 ml-2">{message.gasUsed.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
      {/* Contract Interactions */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText size={20} className="text-green-400" />
          Recent Contract Interactions
        </h3>
        
        {contractInteractions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No contract interactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contractInteractions.map(interaction => (
              <div key={interaction.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      interaction.type === 'collateral' ? 'bg-green-500/20 border-green-500/30' :
                      interaction.type === 'loan' ? 'bg-blue-500/20 border-blue-500/30' :
                      interaction.type === 'repayment' ? 'bg-yellow-500/20 border-yellow-500/30' :
                      'bg-red-500/20 border-red-500/30'
                    }`}>
                      {interaction.type === 'collateral' ? <Shield size={20} className="text-green-400" /> :
                       interaction.type === 'loan' ? <DollarSign size={20} className="text-blue-400" /> :
                       interaction.type === 'repayment' ? <TrendingUp size={20} className="text-yellow-400" /> :
                       <TrendingDown size={20} className="text-red-400" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white capitalize">{interaction.type}</h4>
                      <p className="text-sm text-gray-400">{interaction.user}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{interaction.amount} {interaction.asset}</div>
                    <div className="text-sm text-gray-400">Chain {interaction.chainId}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {new Date(interaction.timestamp).toLocaleString()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      interaction.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      interaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {interaction.status.toUpperCase()}
                    </span>
                    
                    {interaction.transactionHash && (
                      <span className="text-blue-400 text-xs font-mono">
                        {interaction.transactionHash.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} className="text-green-400" />
          System Health Monitoring
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Connection Health</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <Network size={16} className="text-blue-400" />
                  <span className="text-gray-300">RPC Connection</span>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={16} className="text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    isConnected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-purple-400" />
                  <span className="text-gray-300">Message Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{messages.length}</span>
                  <span className="text-gray-400">messages</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-yellow-400" />
                  <span className="text-gray-300">Block Height</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {chainStatus?.blockHeight.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Performance Metrics</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-green-400" />
                  <span className="text-gray-300">Latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {chainStatus?.latency || 0}ms
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <Memory size={16} className="text-blue-400" />
                  <span className="text-gray-300">Gas Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {chainStatus?.gasPrice || 'N/A'} Gwei
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" />
                  <span className="text-gray-300">Last Update</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {chainStatus?.lastUpdate ? 
                      new Date(chainStatus.lastUpdate).toLocaleTimeString() : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} className="text-gray-400" />
          ZetaChain Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">RPC URL</label>
            <input
              type="text"
              value={config.rpcUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, rpcUrl: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="https://zetachain-rpc-endpoint"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chain ID</label>
              <input
                type="number"
                value={config.chainId}
                onChange={(e) => setConfig(prev => ({ ...prev, chainId: parseInt(e.target.value) }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="7001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gas Limit</label>
              <input
                type="number"
                value={config.gasLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, gasLimit: parseInt(e.target.value) }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="500000"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gas Price (Gwei)</label>
              <input
                type="number"
                value={config.gasPrice}
                onChange={(e) => setConfig(prev => ({ ...prev, gasPrice: parseInt(e.target.value) }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gateway Address</label>
              <input
                type="text"
                value={config.gatewayAddress}
                onChange={(e) => setConfig(prev => ({ ...prev, gatewayAddress: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="0x..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Universal Lending Address</label>
            <input
              type="text"
              value={config.universalLendingAddress}
              onChange={(e) => setConfig(prev => ({ ...prev, universalLendingAddress: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="0x..."
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Apply & Reconnect
            </button>
            
            <button
              onClick={() => setConfig({
                rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
                chainId: 7001,
                gatewayAddress: '0x0000000000000000000000000000000000000000',
                universalLendingAddress: '0x0000000000000000000000000000000000000000',
                gasLimit: 500000,
                gasPrice: 20
              })}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Reset to Defaults
            </button>
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
            <Network size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ZetaChain Integration Dashboard</h1>
            <p className="text-gray-400">
              Real-time monitoring and control of ZetaChain cross-chain operations
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Status:</span>
          <span className={`font-medium ${
            connectionStatus === 'connected' ? 'text-green-400' :
            connectionStatus === 'connecting' ? 'text-yellow-400' :
            connectionStatus === 'error' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {connectionStatus.toUpperCase()}
          </span>
          <span>•</span>
          <span>Messages:</span>
          <span className="font-medium text-white">{messages.length}</span>
          <span>•</span>
          <span>Block Height:</span>
          <span className="font-medium text-white">{chainStatus?.blockHeight.toLocaleString() || 'N/A'}</span>
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
            <Activity size={16} />
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('messages')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'messages'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <MessageSquare size={16} />
            Messages
          </button>
          <button
            onClick={() => setSelectedTab('contracts')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'contracts'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <FileText size={16} />
            Contracts
          </button>
          <button
            onClick={() => setSelectedTab('monitoring')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'monitoring'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Target size={16} />
            Monitoring
          </button>
          <button
            onClick={() => setSelectedTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              selectedTab === 'settings'
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
        
        <div className="p-6">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'messages' && renderMessages()}
          {selectedTab === 'contracts' && renderContracts()}
          {selectedTab === 'monitoring' && renderMonitoring()}
          {selectedTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default ZetaChainDashboard;
