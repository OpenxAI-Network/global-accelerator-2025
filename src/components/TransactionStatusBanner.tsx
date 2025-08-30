import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';

interface TransactionStatusBannerProps {
  chain?: string;
  activeTransactions?: number;
  onClose?: () => void;
}

const TransactionStatusBanner: React.FC<TransactionStatusBannerProps> = ({
  chain = 'Base',
  activeTransactions = 0,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const getStatusColor = () => {
    if (activeTransactions === 0) return 'bg-green-600 border-green-500';
    if (activeTransactions <= 2) return 'bg-yellow-600 border-yellow-500';
    return 'bg-red-600 border-red-500';
  };

  const getStatusIcon = () => {
    if (activeTransactions === 0) return <CheckCircle className="w-5 h-5 text-green-200" />;
    if (activeTransactions <= 2) return <Clock className="w-5 h-5 text-yellow-200" />;
    return <AlertTriangle className="w-5 h-5 text-red-200" />;
  };

  const getStatusText = () => {
    if (activeTransactions === 0) return 'All transactions resolved';
    if (activeTransactions === 1) return '1 transaction pending';
    return `${activeTransactions} transactions pending`;
  };

  return (
    <div className={`sticky top-0 z-40 border-b ${getStatusColor()} text-white`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="font-semibold text-sm">
                Transaction Status
              </div>
              <div className="text-xs opacity-90">
                {getStatusText()} on {chain} chain
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Active transactions counter */}
            <div className="flex items-center gap-2 text-xs opacity-90">
              <Activity className="w-4 h-4" />
              <span>
                {activeTransactions} active
              </span>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusBanner;
