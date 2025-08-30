import React from 'react';
import { Threat } from '../../types';

interface TransactionListProps {
  threats: Threat[];
  onSelect: (threat: Threat) => void;
  selectedId?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ threats, onSelect, selectedId }) => {
  const getThreatLevelColor = (severity: number) => {
    if (severity > 80) return 'bg-red-100 text-red-800 border-red-200';
    if (severity > 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (severity > 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getThreatLevelText = (severity: number) => {
    if (severity > 80) return 'Critical';
    if (severity > 60) return 'High';
    if (severity > 40) return 'Medium';
    return 'Low';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (threats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Transactions</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-gray-500">No transactions found for the selected filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Transactions ({threats.length})</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {threats.map((threat) => (
          <div
            key={threat.id}
            onClick={() => onSelect(threat)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedId === threat.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {threat.txHash.substring(0, 16)}...
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getThreatLevelColor(threat.severity)}`}>
                {getThreatLevelText(threat.severity)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{threat.chain}</span>
              <span>{formatTime(threat.timestamp)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">
                <span className="font-medium">{threat.value}</span>
              </div>
              <div className="text-gray-400">
                {threat.from.substring(0, 8)}... → {threat.to.substring(0, 8)}...
              </div>
            </div>
            
            {threat.type && (
              <div className="mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {threat.type}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList; 