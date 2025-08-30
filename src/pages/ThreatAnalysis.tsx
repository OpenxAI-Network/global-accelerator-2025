import React, { useState } from 'react';
import { Threat } from '../types';

interface ThreatAnalysisProps {
  threats: Threat[];
}

const ThreatAnalysis: React.FC<ThreatAnalysisProps> = ({ threats }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredThreats = threats.filter(threat => {
    const matchesSeverity = selectedSeverity === 'all' || 
      (selectedSeverity === 'critical' && threat.severity > 80) ||
      (selectedSeverity === 'high' && threat.severity > 60 && threat.severity <= 80) ||
      (selectedSeverity === 'medium' && threat.severity > 40 && threat.severity <= 60) ||
      (selectedSeverity === 'low' && threat.severity <= 40);
    
    const matchesChain = selectedChain === 'all' || threat.chain === selectedChain;
    const matchesSearch = threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSeverity && matchesChain && matchesSearch;
  });

  const getSeverityStats = () => {
    const stats = {
      critical: threats.filter(t => t.severity > 80).length,
      high: threats.filter(t => t.severity > 60 && t.severity <= 80).length,
      medium: threats.filter(t => t.severity > 40 && t.severity <= 60).length,
      low: threats.filter(t => t.severity <= 40).length,
    };
    return stats;
  };

  const severityStats = getSeverityStats();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">Critical Threats</p>
              <p className="text-2xl font-bold text-red-800">{severityStats.critical}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">High Threats</p>
              <p className="text-2xl font-bold text-orange-800">{severityStats.high}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600">Medium Threats</p>
              <p className="text-2xl font-bold text-yellow-800">{severityStats.medium}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Low Threats</p>
              <p className="text-2xl font-bold text-green-800">{severityStats.low}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Threat Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blockchain</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Chains</option>
              <option value="ethereum">Ethereum</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="polygon">Polygon</option>
              <option value="solana">Solana</option>
              <option value="avalanche">Avalanche</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search threats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredThreats.length} of {threats.length} threats
        </div>
      </div>

      {/* Threats List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detected
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredThreats.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{threat.type}</div>
                      <div className="text-sm text-gray-500">{threat.description}</div>
                      <div className="text-xs text-gray-400 font-mono">{threat.txHash}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {threat.chain}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        threat.severity > 80 ? 'bg-red-500' :
                        threat.severity > 60 ? 'bg-orange-500' :
                        threat.severity > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        threat.severity > 80 ? 'text-red-800' :
                        threat.severity > 60 ? 'text-orange-800' :
                        threat.severity > 40 ? 'text-yellow-800' : 'text-green-800'
                      }`}>
                        {threat.severity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {threat.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(threat.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-red-600 hover:text-red-900">Freeze</button>
                      <button className="text-green-600 hover:text-green-900">Resolve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredThreats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No threats found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">AI Security Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Pattern Recognition</h3>
            <p className="text-sm text-blue-700">
              AI has identified 3 new threat patterns in the last 24 hours, including 
              sophisticated rug pull techniques and cross-chain money laundering attempts.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Risk Assessment</h3>
            <p className="text-sm text-green-700">
              Overall system risk has decreased by 15% this week due to improved 
              threat detection and automated response systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatAnalysis; 