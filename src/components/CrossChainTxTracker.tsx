import React, { useState, useEffect } from 'react';
import { getBlockchainById } from '../config/blockchains';

interface TransactionStatus {
  id: string;
  chainId: string;
  chainName: string;
  status: 'pending' | 'confirmed' | 'failed' | 'processing';
  txHash?: string;
  timestamp: Date;
  description: string;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  confirmations?: number;
  requiredConfirmations?: number;
}

interface CrossChainTxTrackerProps {
  className?: string;
  showCompleted?: boolean;
  autoRefresh?: boolean;
}

const CrossChainTxTracker: React.FC<CrossChainTxTrackerProps> = ({ 
  className = '', 
  showCompleted = true,
  autoRefresh = true
}) => {
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  // Mock transaction data - replace with actual blockchain monitoring
  useEffect(() => {
    const mockTransactions: TransactionStatus[] = [
      {
        id: '1',
        chainId: 'zetachain',
        chainName: 'ZetaChain',
        status: 'confirmed',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        description: 'Deposit 1000 USDC to lending pool',
        gasUsed: '0.001',
        gasPrice: '0.000000001',
        blockNumber: 12345678,
        confirmations: 12,
        requiredConfirmations: 12
      },
      {
        id: '2',
        chainId: 'ethereum',
        chainName: 'Ethereum',
        status: 'processing',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
        description: 'Cross-chain transfer to ZetaChain',
        gasUsed: '0.005',
        gasPrice: '0.00000002',
        blockNumber: 18923456,
        confirmations: 3,
        requiredConfirmations: 12
      },
      {
        id: '3',
        chainId: 'solana',
        chainName: 'Solana',
        status: 'pending',
        timestamp: new Date(Date.now() - 10000), // 10 seconds ago
        description: 'Borrow 500 SOL against ETH collateral',
        requiredConfirmations: 32
      },
      {
        id: '4',
        chainId: 'avalanche',
        chainName: 'Avalanche',
        status: 'failed',
        txHash: '0xfailed1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        timestamp: new Date(Date.now() - 180000), // 3 minutes ago
        description: 'Liquidation attempt - insufficient collateral',
        gasUsed: '0.015',
        gasPrice: '0.000000025',
        blockNumber: 34567890,
        confirmations: 0,
        requiredConfirmations: 20
      }
    ];

    setTransactions(mockTransactions);
  }, []);

  // Auto-refresh pending transactions
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setTransactions(prev => prev.map(tx => {
        if (tx.status === 'pending' || tx.status === 'processing') {
          // Simulate transaction progress
          if (tx.confirmations && tx.requiredConfirmations) {
            const newConfirmations = Math.min(tx.confirmations + Math.floor(Math.random() * 3), tx.requiredConfirmations);
            const newStatus = newConfirmations >= tx.requiredConfirmations ? 'confirmed' : 'processing';
            
            return {
              ...tx,
              confirmations: newConfirmations,
              status: newStatus
            };
          }
        }
        return tx;
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: TransactionStatus['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: TransactionStatus['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'confirmed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getProgressPercentage = (tx: TransactionStatus) => {
    if (tx.status === 'confirmed' || tx.status === 'failed') return 100;
    if (!tx.confirmations || !tx.requiredConfirmations) return 0;
    return (tx.confirmations / tx.requiredConfirmations) * 100;
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterStatus === 'all') return true;
    return tx.status === filterStatus;
  });

  const renderTransaction = (tx: TransactionStatus) => {
    const blockchain = getBlockchainById(tx.chainId);
    const progressPercentage = getProgressPercentage(tx);

    return (
      <div key={tx.id} className="transaction-item border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{blockchain?.icon || '🔗'}</span>
            <div>
              <h4 className="font-medium text-gray-900">{tx.description}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{tx.chainName}</span>
                <span>•</span>
                <span>{tx.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
              {getStatusIcon(tx.status)} {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Transaction Hash */}
        {tx.txHash && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Transaction Hash</div>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
              </code>
              <a
                href={`${blockchain?.blockExplorerUrls[0]}/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View ↗
              </a>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {(tx.status === 'pending' || tx.status === 'processing') && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Confirmations</span>
              <span>{tx.confirmations || 0} / {tx.requiredConfirmations}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Transaction Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {tx.blockNumber && (
            <div>
              <div className="text-gray-500">Block</div>
              <div className="font-medium">{tx.blockNumber.toLocaleString()}</div>
            </div>
          )}
          {tx.gasUsed && (
            <div>
              <div className="text-gray-500">Gas Used</div>
              <div className="font-medium">{tx.gasUsed} {blockchain?.nativeCurrency.symbol}</div>
            </div>
          )}
          {tx.gasPrice && (
            <div>
              <div className="text-gray-500">Gas Price</div>
              <div className="font-medium">{tx.gasPrice} {blockchain?.nativeCurrency.symbol}</div>
            </div>
          )}
          <div>
            <div className="text-gray-500">Time</div>
            <div className="font-medium">{tx.timestamp.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Error Message for Failed Transactions */}
        {tx.status === 'failed' && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              Transaction failed. Please check your wallet and try again.
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStatusCounts = () => {
    const counts = { all: 0, pending: 0, processing: 0, confirmed: 0, failed: 0 };
    transactions.forEach(tx => {
      counts.all++;
      counts[tx.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className={`cross-chain-tx-tracker ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cross-Chain Transactions</h2>
        <p className="text-gray-600">Monitor your transactions across all connected blockchains</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-filters mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'processing', label: 'Processing', count: statusCounts.processing },
            { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
            { key: 'failed', label: 'Failed', count: statusCounts.failed }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterStatus === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
              <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'No transactions found. Start by performing operations on any supported blockchain.'
                : `No ${filterStatus} transactions found.`
              }
            </p>
          </div>
        ) : (
          filteredTransactions.map(renderTransaction)
        )}
      </div>

      {/* Auto-refresh Indicator */}
      {autoRefresh && (
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Auto-refreshing every 5 seconds
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossChainTxTracker;
