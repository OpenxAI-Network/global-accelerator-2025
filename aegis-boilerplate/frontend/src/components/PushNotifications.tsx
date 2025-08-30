import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { NotificationType, NotificationPriority, Notification } from '../types/notifications';

interface PushNotificationsProps {
  onNotificationClick?: (notification: Notification) => void;
  onDismiss?: (notificationId: string) => void;
  maxNotifications?: number;
}

const PushNotifications: React.FC<PushNotificationsProps> = ({
  onNotificationClick,
  onDismiss,
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    sound: true,
    desktop: true,
    telegram: false,
    discord: false
  });

  // WebSocket connection for real-time notifications
  const { 
    isConnected, 
    lastMessage, 
    sendMessage 
  } = useWebSocket(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001');

  // Process incoming notifications
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        if (data.type === 'notification') {
          addNotification(data.notification);
        }
      } catch (err) {
        console.error('Failed to parse notification message:', err);
      }
    }
  }, [lastMessage]);

  // Calculate unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
    
    // Update browser tab title if there are unread notifications
    if (unread > 0) {
      document.title = `(${unread}) Aegis - Cross-Chain DeFi`;
    } else {
      document.title = 'Aegis - Cross-Chain DeFi';
    }
  }, [notifications]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('aegis-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.slice(0, maxNotifications));
      } catch (err) {
        console.error('Failed to parse saved notifications:', err);
      }
    }

    const savedSettings = localStorage.getItem('aegis-notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings(parsed);
      } catch (err) {
        console.error('Failed to parse notification settings:', err);
      }
    }
  }, [maxNotifications]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('aegis-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('aegis-notification-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const addNotification = useCallback((notification: Notification) => {
    const newNotification: Notification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    // Play sound if enabled
    if (notificationSettings.sound) {
      playNotificationSound(notification.priority);
    }

    // Show desktop notification if enabled
    if (notificationSettings.desktop && 'Notification' in window) {
      showDesktopNotification(newNotification);
    }

    // Send to external services if enabled
    if (notificationSettings.telegram && notification.priority === NotificationPriority.HIGH) {
      sendTelegramNotification(newNotification);
    }

    if (notificationSettings.discord && notification.priority === NotificationPriority.HIGH) {
      sendDiscordNotification(newNotification);
    }
  }, [maxNotifications, notificationSettings]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    onDismiss?.(notificationId);
  }, [onDismiss]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const playNotificationSound = (priority: NotificationPriority) => {
    try {
      const audio = new Audio();
      switch (priority) {
        case NotificationPriority.HIGH:
          audio.src = '/sounds/alert-high.mp3';
          break;
        case NotificationPriority.MEDIUM:
          audio.src = '/sounds/alert-medium.mp3';
          break;
        case NotificationPriority.LOW:
          audio.src = '/sounds/alert-low.mp3';
          break;
      }
      audio.play().catch(err => console.log('Could not play notification sound:', err));
    } catch (err) {
      console.log('Could not play notification sound:', err);
    }
  };

  const showDesktopNotification = (notification: Notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === NotificationPriority.HIGH
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showDesktopNotification(notification);
        }
      });
    }
  };

  const sendTelegramNotification = async (notification: Notification) => {
    try {
      await fetch('/api/notifications/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (err) {
      console.error('Failed to send Telegram notification:', err);
    }
  };

  const sendDiscordNotification = async (notification: Notification) => {
    try {
      await fetch('/api/notifications/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (err) {
      console.error('Failed to send Discord notification:', err);
    }
  };

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return '🔴';
      case NotificationPriority.MEDIUM:
        return '🟡';
      case NotificationPriority.LOW:
        return '🟢';
      default:
        return '🔵';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIQUIDATION:
        return '💀';
      case NotificationType.WARNING:
        return '⚠️';
      case NotificationType.INFO:
        return 'ℹ️';
      case NotificationType.SUCCESS:
        return '✅';
      case NotificationType.ERROR:
        return '❌';
      default:
        return '📢';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="push-notifications">
      {/* Notification Bell */}
      <div className="notification-bell" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {/* Notification Panel */}
      {isExpanded && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <button onClick={markAllAsRead} className="btn-mark-all-read">
                Mark all read
              </button>
              <button onClick={clearAllNotifications} className="btn-clear-all">
                Clear all
              </button>
              <button onClick={() => setIsExpanded(false)} className="btn-close">
                ×
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="notification-settings">
            <h4>Settings</h4>
            <div className="settings-grid">
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={notificationSettings.enabled}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                Enable Notifications
              </label>
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={notificationSettings.sound}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, sound: e.target.checked }))}
                />
                Sound
              </label>
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={notificationSettings.desktop}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, desktop: e.target.checked }))}
                />
                Desktop
              </label>
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={notificationSettings.telegram}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, telegram: e.target.checked }))}
                />
                Telegram
              </label>
              <label className="setting-item">
                <input
                  type="checkbox"
                  checked={notificationSettings.discord}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, discord: e.target.checked }))}
                />
                Discord
              </label>
            </div>
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications</p>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'} priority-${notification.priority}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    onNotificationClick?.(notification);
                  }}
                >
                  <div className="notification-content">
                    <div className="notification-icons">
                      <span className="priority-icon">{getPriorityIcon(notification.priority)}</span>
                      <span className="type-icon">{getTypeIcon(notification.type)}</span>
                    </div>
                    
                    <div className="notification-details">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-meta">
                        <span className="notification-time">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.chainName && (
                          <span className="notification-chain">
                            {notification.chainName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                    className="btn-dismiss"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications for High Priority */}
      {notifications
        .filter(n => !n.isRead && n.priority === NotificationPriority.HIGH)
        .slice(0, 3)
        .map(notification => (
          <div key={notification.id} className="toast-notification high-priority">
            <div className="toast-content">
              <span className="toast-icon">{getTypeIcon(notification.type)}</span>
              <div className="toast-text">
                <div className="toast-title">{notification.title}</div>
                <div className="toast-message">{notification.message}</div>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="toast-dismiss"
            >
              ×
            </button>
          </div>
        ))}
    </div>
  );
};

export default PushNotifications;
