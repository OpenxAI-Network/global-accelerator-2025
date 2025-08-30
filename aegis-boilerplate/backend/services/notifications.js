export class NotificationService {
  constructor() {
    this.notifications = new Map();
  }

  async getNotifications(userId) {
    // Mock notifications
    return [
      { id: 1, type: 'info', message: 'Portfolio updated successfully', read: false, timestamp: new Date().toISOString() },
      { id: 2, type: 'warning', message: 'High gas fees on Ethereum network', read: true, timestamp: new Date().toISOString() },
      { id: 3, type: 'success', message: 'Transaction completed successfully', read: true, timestamp: new Date().toISOString() }
    ];
  }

  async markAsRead(userId, notificationId) {
    // Mock update
    return { success: true, message: `Notification ${notificationId} marked as read` };
  }

  async createNotification(userId, type, message) {
    const notification = {
      id: Date.now(),
      type,
      message,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    return notification;
  }
}
