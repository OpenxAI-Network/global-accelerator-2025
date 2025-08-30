import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // Auto-dismiss after this many milliseconds
}

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification.duration) {
      const startTime = Date.now();
      const endTime = startTime + notification.duration;
      
      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const newProgress = (remaining / notification.duration) * 100;
        
        if (newProgress <= 0) {
          setIsVisible(false);
          setTimeout(() => onDismiss(notification.id), 300);
        } else {
          setProgress(newProgress);
          requestAnimationFrame(updateProgress);
        }
      };
      
      requestAnimationFrame(updateProgress);
    }
  }, [notification.duration, notification.id, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      default:
        return <Info size={20} className="text-gray-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`relative p-4 rounded-lg border ${getBackgroundColor()} backdrop-blur-sm transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {/* Progress bar */}
      {notification.duration && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-white/30 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">
            {notification.message}
          </p>
          <div className="text-xs text-gray-400 mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X size={16} className="text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
