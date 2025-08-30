import React from 'react';
import { Threat } from '../../types';

interface TransactionDetailsProps {
  threat: Threat;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ threat }) => {
  const getSeverityBadge = () => {
    if (threat.severity > 80) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Critical
        </span>
      );
    }
    if (threat.severity > 60) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
          High
        </span>
      );
    }
    if (threat.severity > 40) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Low
      </span>
    );
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Transaction Details</h3>
          {getSeverityBadge()}
        </div>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Transaction Information</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Transaction Hash</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {threat.txHash}
                  </code>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Chain</label>
                <div className="mt-1 text-sm text-gray-800 capitalize">{threat.chain}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Value</label>
                <div className="mt-1 text-sm font-semibold text-gray-800">{threat.value}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Timestamp</label>
                <div className="mt-1 text-sm text-gray-800">{formatTimestamp(threat.timestamp)}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">Addresses</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">From Address</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {formatAddress(threat.from)}
                  </code>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">To Address</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                    {formatAddress(threat.to)}
                  </code>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Threat Type</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                    {threat.type}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Risk Score</label>
                <div className="mt-1">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg font-bold text-gray-800">{threat.severity}</div>
                    <div className="text-sm text-gray-500">/ 100</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        threat.severity > 80 ? 'bg-red-600' : 
                        threat.severity > 60 ? 'bg-orange-500' : 
                        threat.severity > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${threat.severity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Quick Actions</h4>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
              View on Explorer
            </button>
            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors">
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails; 