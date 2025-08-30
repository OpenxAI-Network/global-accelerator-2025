import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createZetaChainGateway, ZetaChainConfig, CrossChainMessage, ChainStatus } from '../services/ZetaChainGateway';

interface ZetaChainContextType {
  // Connection state
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  chainStatus: ChainStatus | null;
  
  // Gateway instance
  gateway: any;
  
  // Data
  messages: CrossChainMessage[];
  contractStats: any;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCrossChainMessage: (toChain: string, messageType: any, data: any) => Promise<string>;
  refreshData: () => Promise<void>;
  
  // Configuration
  config: ZetaChainConfig;
  updateConfig: (newConfig: Partial<ZetaChainConfig>) => void;
  
  // Events
  onMessageQueued: (callback: (message: CrossChainMessage) => void) => void;
  onMessageSent: (callback: (message: CrossChainMessage) => void) => void;
  onMessageConfirmed: (callback: (message: CrossChainMessage) => void) => void;
  onMessageFailed: (callback: (data: { message: CrossChainMessage; error: any }) => void) => void;
  onChainStatusUpdate: (callback: (status: ChainStatus) => void) => void;
  onNewBlock: (callback: (block: any) => void) => void;
  onConnected: (callback: (data: any) => void) => void;
  onDisconnected: (callback: () => void) => void;
  onError: (callback: (error: any) => void) => void;
}

const ZetaChainContext = createContext<ZetaChainContextType | undefined>(undefined);

interface ZetaChainProviderProps {
  children: ReactNode;
  initialConfig?: Partial<ZetaChainConfig>;
}

const DEFAULT_CONFIG: ZetaChainConfig = {
  rpcUrl: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  chainId: 7001, // ZetaChain Athens testnet
  gatewayAddress: '0x0000000000000000000000000000000000000000', // Replace with actual address
  universalLendingAddress: '0x0000000000000000000000000000000000000000', // Replace with actual address
  gasLimit: 500000,
  gasPrice: 20 // gwei
};

export const ZetaChainProvider: React.FC<ZetaChainProviderProps> = ({ 
  children, 
  initialConfig = {} 
}) => {
  const [config, setConfig] = useState<ZetaChainConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [gateway, setGateway] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null);
  const [messages, setMessages] = useState<CrossChainMessage[]>([]);
  const [contractStats, setContractStats] = useState<any>(null);

  // Event callbacks
  const [messageQueuedCallbacks, setMessageQueuedCallbacks] = useState<((message: CrossChainMessage) => void)[]>([]);
  const [messageSentCallbacks, setMessageSentCallbacks] = useState<((message: CrossChainMessage) => void)[]>([]);
  const [messageConfirmedCallbacks, setMessageConfirmedCallbacks] = useState<((message: CrossChainMessage) => void)[]>([]);
  const [messageFailedCallbacks, setMessageFailedCallbacks] = useState<((data: { message: CrossChainMessage; error: any }) => void)[]>([]);
  const [chainStatusUpdateCallbacks, setChainStatusUpdateCallbacks] = useState<((status: ChainStatus) => void)[]>([]);
  const [newBlockCallbacks, setNewBlockCallbacks] = useState<((block: any) => void)[]>([]);
  const [connectedCallbacks, setConnectedCallbacks] = useState<((data: any) => void)[]>([]);
  const [disconnectedCallbacks, setDisconnectedCallbacks] = useState<(() => void)[]>([]);
  const [errorCallbacks, setErrorCallbacks] = useState<((error: any) => void)[]>([]);

  // ============ GATEWAY INITIALIZATION ============

  const initializeGateway = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      const newGateway = createZetaChainGateway(config);
      
      // Set up event listeners
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
        
        // Notify callbacks
        connectedCallbacks.forEach(callback => callback(data));
        
        console.log('Connected to ZetaChain:', data);
      });

      newGateway.on('disconnected', () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setChainStatus(null);
        
        // Notify callbacks
        disconnectedCallbacks.forEach(callback => callback());
        
        console.log('Disconnected from ZetaChain');
      });

      newGateway.on('error', (error: any) => {
        setConnectionStatus('error');
        
        // Notify callbacks
        errorCallbacks.forEach(callback => callback(error));
        
        console.error('ZetaChain error:', error);
      });

      newGateway.on('chainStatusUpdate', (status: ChainStatus) => {
        setChainStatus(status);
        
        // Notify callbacks
        chainStatusUpdateCallbacks.forEach(callback => callback(status));
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
        
        // Notify callbacks
        newBlockCallbacks.forEach(callback => callback(block));
      });

      newGateway.on('messageQueued', (message: CrossChainMessage) => {
        setMessages(prev => [message, ...prev]);
        
        // Notify callbacks
        messageQueuedCallbacks.forEach(callback => callback(message));
      });

      newGateway.on('messageSent', (message: CrossChainMessage) => {
        setMessages(prev => prev.map(msg => 
          msg.messageId === message.messageId ? message : msg
        ));
        
        // Notify callbacks
        messageSentCallbacks.forEach(callback => callback(message));
      });

      newGateway.on('messageConfirmed', (message: CrossChainMessage) => {
        setMessages(prev => prev.map(msg => 
          msg.messageId === message.messageId ? message : msg
        ));
        
        // Notify callbacks
        messageConfirmedCallbacks.forEach(callback => callback(message));
      });

      newGateway.on('messageFailed', (data: { message: CrossChainMessage; error: any }) => {
        setMessages(prev => prev.map(msg => 
          msg.messageId === data.message.messageId ? data.message : msg
        ));
        
        // Notify callbacks
        messageFailedCallbacks.forEach(callback => callback(data));
      });

      setGateway(newGateway);

    } catch (error) {
      console.error('Failed to initialize gateway:', error);
      setConnectionStatus('error');
      
      // Notify error callbacks
      errorCallbacks.forEach(callback => callback(error));
    }
  }, [config, messageQueuedCallbacks, messageSentCallbacks, messageConfirmedCallbacks, messageFailedCallbacks, chainStatusUpdateCallbacks, newBlockCallbacks, connectedCallbacks, disconnectedCallbacks, errorCallbacks]);

  // ============ CONNECTION MANAGEMENT ============

  const connect = useCallback(async () => {
    if (gateway) {
      await gateway.disconnect();
    }
    await initializeGateway();
  }, [gateway, initializeGateway]);

  const disconnect = useCallback(async () => {
    if (gateway) {
      await gateway.disconnect();
      setGateway(null);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setChainStatus(null);
    }
  }, [gateway]);

  // ============ CROSS-CHAIN OPERATIONS ============

  const sendCrossChainMessage = useCallback(async (
    toChain: string,
    messageType: CrossChainMessage['messageType'],
    data: any
  ): Promise<string> => {
    if (!gateway || !isConnected) {
      throw new Error('ZetaChain gateway not connected');
    }

    try {
      const messageId = await gateway.sendCrossChainMessage(toChain, messageType, data);
      return messageId;
    } catch (error) {
      console.error('Failed to send cross-chain message:', error);
      throw error;
    }
  }, [gateway, isConnected]);

  // ============ DATA REFRESH ============

  const refreshData = useCallback(async () => {
    if (!gateway || !isConnected) return;

    try {
      // Fetch contract statistics
      const stats = await gateway.getContractStats();
      setContractStats(stats);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [gateway, isConnected]);

  // ============ CONFIGURATION MANAGEMENT ============

  const updateConfig = useCallback((newConfig: Partial<ZetaChainConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // ============ EVENT REGISTRATION ============

  const onMessageQueued = useCallback((callback: (message: CrossChainMessage) => void) => {
    setMessageQueuedCallbacks(prev => [...prev, callback]);
  }, []);

  const onMessageSent = useCallback((callback: (message: CrossChainMessage) => void) => {
    setMessageSentCallbacks(prev => [...prev, callback]);
  }, []);

  const onMessageConfirmed = useCallback((callback: (message: CrossChainMessage) => void) => {
    setMessageConfirmedCallbacks(prev => [...prev, callback]);
  }, []);

  const onMessageFailed = useCallback((callback: (data: { message: CrossChainMessage; error: any }) => void) => {
    setMessageFailedCallbacks(prev => [...prev, callback]);
  }, []);

  const onChainStatusUpdate = useCallback((callback: (status: ChainStatus) => void) => {
    setChainStatusUpdateCallbacks(prev => [...prev, callback]);
  }, []);

  const onNewBlock = useCallback((callback: (block: any) => void) => {
    setNewBlockCallbacks(prev => [...prev, callback]);
  }, []);

  const onConnected = useCallback((callback: (data: any) => void) => {
    setConnectedCallbacks(prev => [...prev, callback]);
  }, []);

  const onDisconnected = useCallback((callback: () => void) => {
    setDisconnectedCallbacks(prev => [...prev, callback]);
  }, []);

  const onError = useCallback((callback: (error: any) => void) => {
    setErrorCallbacks(prev => [...prev, callback]);
  }, []);

  // ============ EFFECTS ============

  useEffect(() => {
    // Initialize gateway on mount
    initializeGateway();
    
    return () => {
      // Cleanup on unmount
      if (gateway) {
        gateway.disconnect();
      }
    };
  }, [initializeGateway]);

  useEffect(() => {
    // Refresh data when connected
    if (isConnected) {
      refreshData();
    }
  }, [isConnected, refreshData]);

  // ============ CONTEXT VALUE ============

  const contextValue: ZetaChainContextType = {
    // Connection state
    isConnected,
    connectionStatus,
    chainStatus,
    
    // Gateway instance
    gateway,
    
    // Data
    messages,
    contractStats,
    
    // Actions
    connect,
    disconnect,
    sendCrossChainMessage,
    refreshData,
    
    // Configuration
    config,
    updateConfig,
    
    // Events
    onMessageQueued,
    onMessageSent,
    onMessageConfirmed,
    onMessageFailed,
    onChainStatusUpdate,
    onNewBlock,
    onConnected,
    onDisconnected,
    onError
  };

  return (
    <ZetaChainContext.Provider value={contextValue}>
      {children}
    </ZetaChainContext.Provider>
  );
};

// ============ HOOK ============

export const useZetaChain = (): ZetaChainContextType => {
  const context = useContext(ZetaChainContext);
  if (context === undefined) {
    throw new Error('useZetaChain must be used within a ZetaChainProvider');
  }
  return context;
};

// ============ UTILITY HOOKS ============

export const useZetaChainConnection = () => {
  const { isConnected, connectionStatus, chainStatus, connect, disconnect } = useZetaChain();
  return { isConnected, connectionStatus, chainStatus, connect, disconnect };
};

export const useZetaChainMessages = () => {
  const { messages, sendCrossChainMessage } = useZetaChain();
  return { messages, sendCrossChainMessage };
};

export const useZetaChainStats = () => {
  const { contractStats, refreshData } = useZetaChain();
  return { contractStats, refreshData };
};

export const useZetaChainConfig = () => {
  const { config, updateConfig } = useZetaChain();
  return { config, updateConfig };
};

// ============ DEFAULT EXPORT ============

export default ZetaChainContext;
