import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Gas Fees',
      message: 'Ethereum network gas fees are currently high. Consider waiting for lower fees.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false,
      priority: 'medium'
    },
    {
      id: '2',
      type: 'success',
      title: 'Deposit Confirmed',
      message: 'Your deposit of 1000 USDC has been confirmed on Arbitrum.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      isRead: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'info',
      title: 'New Lending Pool Available',
      message: 'A new WETH lending pool is now available on Polygon with 8.5% APY.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'error',
      title: 'Transaction Failed',
      message: 'Your withdrawal request failed due to insufficient liquidity. Please try again later.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      isRead: false,
      priority: 'critical'
    },
    {
      id: '5',
      type: 'warning',
      title: 'Liquidation Risk',
      message: 'Your collateral ratio is approaching the liquidation threshold. Consider adding more collateral.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      isRead: true,
      priority: 'critical'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};