import React from 'react';
import { Threat } from '../../types';

interface ThreatAnalysisPanelProps {
  threat: Threat;
}

const ThreatAnalysisPanel: React.FC<ThreatAnalysisPanelProps> = ({ threat }) => {
  const renderSeverityBadge = () => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Threat Analysis</h3>
          {renderSeverityBadge()}
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Gemini AI Analysis</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <p className="text-gray-700">{threat.aiAnalysis}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Pattern Recognition</h4>
            <ul className="space-y-2">
              {threat.patterns.map((pattern, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span className="text-gray-700">{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Risk Indicators</h4>
            <div className="space-y-3">
              {threat.riskIndicators.map((indicator, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{indicator.name}</span>
                    <span className="text-sm font-medium text-gray-900">{indicator.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        indicator.value > 80 ? 'bg-red-600' : 
                        indicator.value > 60 ? 'bg-orange-500' : 
                        indicator.value > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${indicator.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Recommended Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {threat.recommendedActions.map((action, idx) => (
              <div key={idx} className="border rounded-lg p-4 flex flex-col">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    action.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {action.priority}
                  </span>
                </div>
                <h5 className="font-medium text-gray-800 mb-1">{action.title}</h5>
                <p className="text-gray-600 text-sm flex-grow">{action.description}</p>
                <div className="mt-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Cross-Chain Security Operations</h4>
          <div className="flex space-x-4">
            <button className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
              Freeze Assets
            </button>
            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
              Reverse Transaction
            </button>
            <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
              Require 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatAnalysisPanel; 