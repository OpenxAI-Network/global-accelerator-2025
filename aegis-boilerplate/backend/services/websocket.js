export class WebSocketService {
  constructor(wss) {
    this.wss = wss;
    this.connections = new Map();
    this.subscriptions = new Map();
  }

  subscribeToPortfolio(ws, userId) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId).add(ws);
    
    // Send initial portfolio data
    this.sendPortfolioUpdate(userId);
  }

  subscribeToNotifications(ws, userId) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId).add(ws);
  }

  sendPortfolioUpdate(userId) {
    const subscribers = this.subscriptions.get(userId);
    if (subscribers) {
      const update = {
        type: 'portfolio_update',
        data: {
          totalValue: 25000,
          totalPnl: 1250,
          timestamp: Date.now()
        }
      };
      
      subscribers.forEach(ws => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(JSON.stringify(update));
        }
      });
    }
  }

  sendNotification(userId, notification) {
    const subscribers = this.subscriptions.get(userId);
    if (subscribers) {
      const message = {
        type: 'notification',
        data: notification
      };
      
      subscribers.forEach(ws => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  removeConnection(ws) {
    // Remove from all subscriptions
    this.subscriptions.forEach((subscribers, userId) => {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.subscriptions.delete(userId);
      }
    });
  }

  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
