// API client for RunKada backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('runkada_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('runkada_token', token);
    } else {
      localStorage.removeItem('runkada_token');
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Provide more helpful error messages
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.error(`API request failed: Cannot connect to backend at ${url}`);
        console.error('Make sure the backend server is running on port 3001');
        throw new Error(`Cannot connect to backend server. Please ensure the backend is running at ${this.baseURL}`);
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async getStravaAuthUrl() {
    return this.request('/auth/strava/url');
  }

  async handleStravaCallback(code) {
    return this.request('/auth/strava/callback', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async refreshStravaToken() {
    return this.request('/auth/strava/refresh', {
      method: 'POST',
      body: JSON.stringify({ userId: this.getCurrentUserId() }),
    });
  }

  async logout() {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return result;
  }

  // User methods
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getLeaderboard(period = 'all', limit = 50) {
    return this.request(`/users/leaderboard?period=${period}&limit=${limit}`);
  }

  async getUserClan() {
    return this.request('/users/clan');
  }

  // Activity methods
  async getActivities(page = 1, perPage = 30) {
    return this.request(`/activities?page=${page}&per_page=${perPage}`);
  }

  async getActivityStats() {
    return this.request('/activities/stats');
  }

  async getRecentActivities(limit = 10) {
    return this.request(`/activities/recent?limit=${limit}`);
  }

  // Clan methods
  async getClans(limit = 20, offset = 0) {
    return this.request(`/clans?limit=${limit}&offset=${offset}`);
  }

  async getClanLeaderboard(period = 'all', limit = 50) {
    return this.request(`/clans/leaderboard?period=${period}&limit=${limit}`);
  }

  async getClan(clanId) {
    return this.request(`/clans/${clanId}`);
  }

  async createClan(clanData) {
    return this.request('/clans', {
      method: 'POST',
      body: JSON.stringify(clanData),
    });
  }

  async joinClan(clanId) {
    return this.request(`/clans/${clanId}/join`, {
      method: 'POST',
    });
  }

  async leaveClan(clanId) {
    return this.request(`/clans/${clanId}/leave`, {
      method: 'POST',
    });
  }

  // Utility methods
  getCurrentUserId() {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or multiple instances
export default ApiClient;
