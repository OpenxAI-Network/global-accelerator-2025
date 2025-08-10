"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Course Completed!',
      message: 'Congratulations! You have successfully completed "Introduction to Machine Learning".',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'New AI Coach Feature',
      message: 'Try our new voice-enabled AI coaching assistant for personalized learning.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Learning Streak at Risk',
      message: 'You haven\'t completed your daily learning goal. Keep your 12-day streak alive!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'success',
      title: 'Achievement Unlocked',
      message: 'You earned the "Quick Learner" badge for completing 5 lessons in one day!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '5',
      type: 'info',
      title: 'Weekly Progress Report',
      message: 'Your learning progress this week: 8 hours completed, 3 new skills acquired.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true
    }
  ]);

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

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Header variant="dashboard" />
        
        {/* Back Navigation */}
        <div className="mb-8 pt-20">
          <Link 
            href="/dashboard"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 px-2 py-1 bg-blue-500 text-white text-sm rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Stay updated with your learning progress</p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-gray-600 dark:text-gray-400">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  notification.read 
                    ? 'border-gray-200 dark:border-gray-700' 
                    : 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-semibold ${
                            notification.read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete notification"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}