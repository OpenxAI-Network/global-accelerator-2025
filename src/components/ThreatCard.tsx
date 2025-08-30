import React from 'react';
import { AlertTriangle, Clock, Shield, TrendingUp, Target, FileText, ExternalLink } from 'lucide-react';
import { ThreatItem } from '../types/threats';

interface ThreatCardProps {
  threat: ThreatItem;
  onResolve: (id: string) => void;
  onInvestigate: (id: string) => void;
  onViewDetails: (threat: ThreatItem) => void;
}

const ThreatCard: React.FC<ThreatCardProps> = ({ threat, onResolve, onInvestigate, onViewDetails }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-500/10';
      case 'high': return 'border-l-orange-500 bg-orange-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-l-blue-500 bg-blue-500/10';
      default: return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return 'ℹ️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-400/20';
      case 'investigating': return 'text-yellow-400 bg-yellow-400/20';
      case 'mitigated': return 'text-blue-400 bg-blue-400/20';
      case 'resolved': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔴';
      case 'investigating': return '🔍';
      case 'mitigated': return '🛡️';
      case 'resolved': return '✅';
      default: return '⚪';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${getSeverityColor(threat.severity)} transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getSeverityIcon(threat.severity)}</span>
          <span className="font-semibold text-white">{threat.title}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(threat.status)}`}>
            {getStatusIcon(threat.status)} {threat.status.charAt(0).toUpperCase() + threat.status.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock size={12} />
          {formatTime(threat.timestamp)}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{threat.description}</p>

      {/* Chain and Category */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <Target size={12} />
          <span className="text-gray-400">Chain:</span>
          <span className="font-medium text-white">{threat.chain}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText size={12} />
          <span className="text-gray-400">Category:</span>
          <span className="font-medium text-white capitalize">{threat.category}</span>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-red-400">{threat.riskScore}</div>
          <div className="text-xs text-gray-400">Risk Score</div>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-blue-400">{threat.confidence}%</div>
          <div className="text-xs text-gray-400">Confidence</div>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-yellow-400">{threat.estimatedLoss}</div>
          <div className="text-xs text-gray-400">Est. Loss</div>
        </div>
      </div>

      {/* Affected Assets */}
      {threat.affectedAssets.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Affected Assets:</div>
          <div className="flex flex-wrap gap-1">
            {threat.affectedAssets.map((asset, index) => (
              <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                {asset}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Details */}
      {(threat.sourceAddress || threat.destinationAddress || threat.transactionHash) && (
        <div className="mb-3 p-3 bg-white/5 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Transaction Details:</div>
          {threat.sourceAddress && (
            <div className="text-xs mb-1">
              <span className="text-gray-400">From:</span>
              <span className="text-white ml-1 font-mono">{threat.sourceAddress.substring(0, 8)}...{threat.sourceAddress.substring(36)}</span>
            </div>
          )}
          {threat.destinationAddress && (
            <div className="text-xs mb-1">
              <span className="text-gray-400">To:</span>
              <span className="text-white ml-1 font-mono">{threat.destinationAddress.substring(0, 8)}...{threat.destinationAddress.substring(36)}</span>
            </div>
          )}
          {threat.transactionHash && (
            <div className="text-xs">
              <span className="text-gray-400">Tx Hash:</span>
              <a
                href={`https://explorer.zetachain.com/cc/tx/${threat.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors ml-1 font-mono cursor-pointer"
                title="View on ZetaScan"
              >
                {threat.transactionHash.substring(0, 8)}...{threat.transactionHash.substring(56)}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Mitigation Steps */}
      {threat.mitigationSteps.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1">Mitigation Steps:</div>
          <div className="space-y-1">
            {threat.mitigationSteps.slice(0, 3).map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                <Shield size={10} className="text-green-400" />
                {step}
              </div>
            ))}
            {threat.mitigationSteps.length > 3 && (
              <div className="text-xs text-gray-500 italic">
                +{threat.mitigationSteps.length - 3} more steps...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(threat)}
          className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink size={14} />
          View Details
        </button>
        
        {threat.status === 'active' && (
          <>
            <button
              onClick={() => onInvestigate(threat.id)}
              className="px-3 py-2 border border-yellow-500/30 text-yellow-400 rounded text-sm hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
            >
              <TrendingUp size={14} />
              Investigate
            </button>
            <button
              onClick={() => onResolve(threat.id)}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Shield size={14} />
              Resolve
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ThreatCard;
