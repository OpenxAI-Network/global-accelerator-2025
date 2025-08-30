import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock, TrendingUp, Shield, DollarSign } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'alerts'>('all');

  // Generate mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Loan Approved',
        message: 'Your BTC-backed loan for 5,000 USDC has been approved on Avalanche chain.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        action: 'View Loan',
        priority: 'high'
      },
      {
        id: '2',
        type: 'warning',
        title: 'LTV Ratio Alert',
        message: 'Your Bitcoin collateral LTV has increased to 72%. Consider adding more collateral.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        action: 'Manage Collateral',
        priority: 'high'
      },
      {
        id: '3',
        type: 'info',
        title: 'AI Risk Update',
        message: 'AI engine has updated your portfolio risk score to 23 (Low Risk). New opportunities detected.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        action: 'View Analysis',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'success',
        title: 'Cross-Chain Transfer',
        message: 'Successfully transferred 2,000 USDC from Ethereum to Solana for yield farming.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true,
        action: 'View Transaction',
        priority: 'medium'
      },
      {
        id: '5',
        type: 'alert',
        title: 'Market Volatility',
        message: 'High volatility detected in SOL market. AI recommends reducing exposure by 15%.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false,
        action: 'Review Portfolio',
        priority: 'high'
      },
      {
        id: '6',
        type: 'info',
        title: 'New DeFi Protocol',
        message: 'Base chain has launched a new lending protocol with 18% APY. AI suggests allocating 10% of portfolio.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: true,
        action: 'Explore Protocol',
        priority: 'low'
      },
      {
        id: '7',
        type: 'success',
        title: 'Yield Optimization',
        message: 'Portfolio yield increased by 2.3% this week. AI rebalancing recommendations available.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        read: true,
        action: 'View Report',
        priority: 'medium'
      },
      {
        id: '8',
        type: 'warning',
        title: 'Gas Fee Alert',
        message: 'Ethereum gas fees are currently high (45 gwei). Consider batching transactions.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        read: true,
        action: 'Monitor Fees',
        priority: 'low'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'alerts') return notif.type === 'alert' || notif.type === 'warning';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const alertCount = notifications.filter(n => n.type === 'alert' || n.type === 'warning').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-16 right-6 w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'all' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'unread' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'alerts' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Alerts ({alertCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                  notification.read ? 'bg-gray-800/30' : 'bg-gray-800/50'
                } hover:bg-gray-800/70 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-medium ${
                        notification.read ? 'text-gray-300' : 'text-white'
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-500 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    <p className={`text-sm mt-1 ${
                      notification.read ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {notification.action && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        {notification.action} →
                      </button>
                    )}
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Last updated: {getTimeAgo(new Date())}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {notifications.filter(n => n.type === 'success').length} Success
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {notifications.filter(n => n.type === 'info').length} Info
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {alertCount} Alerts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;