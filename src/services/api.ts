import {
  SecurityOverview,
  Threat,
  Alert,
  Transaction
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Portfolio API
export const portfolioAPI = {
  getOverview: () => Promise.resolve({ totalValue: 125000, totalPnl: 8500 }),
  getPositions: () => Promise.resolve([]),
};

// AI API
export const aiAPI = {
  getInsights: () => Promise.resolve([]),
  getAlerts: () => Promise.resolve([]),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => apiRequest('/notifications/'),
  markAsRead: (id: number) => apiRequest(`/notifications/${id}/read`, {
    method: 'PUT',
  }),
};

// Avalon Integration API
export const avalonAPI = {
  getLoans: () => apiRequest('/avalon/loans'),
  getPositions: () => apiRequest('/avalon/positions'),
  getPools: () => apiRequest('/avalon/pools'),
  getStats: () => apiRequest('/avalon/stats'),
  createLoan: (loanData: any) => apiRequest('/avalon/loans', {
    method: 'POST',
    body: JSON.stringify(loanData),
  }),
  repayLoan: (loanId: string, amount: number) => apiRequest(`/avalon/loans/${loanId}/repay`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }),
  extendLoan: (loanId: string, extraDays: number) => apiRequest(`/avalon/loans/${loanId}/extend`, {
    method: 'POST',
    body: JSON.stringify({ extraDays }),
  }),
};

// WebSocket connection for real-time updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId?: string) {
    try {
      this.ws = new WebSocket('ws://localhost:3001');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        if (userId) {
          this.subscribeToPortfolio(userId);
          this.subscribeToNotifications(userId);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return this.ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribeToPortfolio(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_portfolio',
        userId,
      }));
    }
  }

  subscribeToNotifications(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe_notifications',
        userId,
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onMessage(callback: (data: any) => void) {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    }
  }
}

export default {
  portfolio: portfolioAPI,
  ai: aiAPI,
  notifications: notificationsAPI,
  avalon: avalonAPI,
  WebSocketService,
}; 