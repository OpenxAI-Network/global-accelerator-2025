import React from 'react';
import { X, Shield, AlertTriangle, Clock, Target, FileText, Hash, ExternalLink, TrendingUp, Copy } from 'lucide-react';
import { ThreatItem } from '../types/threats';

interface ThreatDetailsModalProps {
  threat: ThreatItem | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (id: string) => void;
  onInvestigate: (id: string) => void;
}

const ThreatDetailsModal: React.FC<ThreatDetailsModalProps> = ({
  threat,
  isOpen,
  onClose,
  onResolve,
  onInvestigate
}) => {
  if (!isOpen || !threat) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-white/10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{threat.title}</h2>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(threat.severity)}`}>
                {threat.severity.toUpperCase()}
              </span>
              <span className="text-gray-400 text-sm">
                {threat.chain} • {formatTime(threat.timestamp)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Threat Description</h3>
            <p className="text-gray-300 leading-relaxed">{threat.description}</p>
          </div>

          {/* Risk Assessment */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Risk Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">{threat.riskScore}</div>
                <div className="text-sm text-gray-400">Risk Score</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{threat.confidence}%</div>
                <div className="text-sm text-gray-400">Confidence</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">{threat.estimatedLoss}</div>
                <div className="text-sm text-gray-400">Est. Loss</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{threat.affectedAssets.length}</div>
                <div className="text-sm text-gray-400">Assets</div>
              </div>
            </div>
          </div>

          {/* Affected Assets */}
          {threat.affectedAssets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Affected Assets</h3>
              <div className="flex flex-wrap gap-2">
                {threat.affectedAssets.map((asset, index) => (
                  <span key={index} className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-medium">
                    {asset}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {(threat.sourceAddress || threat.destinationAddress || threat.transactionHash) && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Transaction Details</h3>
              <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                {threat.sourceAddress && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-gray-400" />
                      <span className="text-gray-400">Source Address:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm">{threat.sourceAddress}</span>
                      <button
                        onClick={() => copyToClipboard(threat.sourceAddress!)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
                
                {threat.destinationAddress && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-gray-400" />
                      <span className="text-gray-400">Destination Address:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-sm">{threat.destinationAddress}</span>
                      <button
                        onClick={() => copyToClipboard(threat.destinationAddress!)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                {threat.transactionHash && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-gray-400" />
                      <span className="text-gray-400">Transaction Hash:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://explorer.zetachain.com/cc/tx/${threat.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-sm cursor-pointer"
                        title="View on ZetaScan"
                      >
                        {threat.transactionHash}
                      </a>
                      <button
                        onClick={() => copyToClipboard(threat.transactionHash!)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Copy Transaction Hash"
                      >
                        <Copy size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mitigation Steps */}
          {threat.mitigationSteps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Mitigation Steps</h3>
              <div className="space-y-3">
                {threat.mitigationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-300">{step}</span>
                    </div>
                    <Shield size={16} className="text-green-400 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Threat Intelligence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-gray-400">Category</span>
                </div>
                <span className="text-white font-medium capitalize">{threat.category}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-gray-400">Status</span>
                </div>
                <span className="text-white font-medium capitalize">{threat.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            Close
          </button>
          
          {threat.status === 'active' && (
            <>
              <button
                onClick={() => {
                  onInvestigate(threat.id);
                  onClose();
                }}
                className="px-4 py-2 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
              >
                <TrendingUp size={16} />
                Start Investigation
              </button>
              <button
                onClick={() => {
                  onResolve(threat.id);
                  onClose();
                }}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Shield size={16} />
                Mark Resolved
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatDetailsModal;
