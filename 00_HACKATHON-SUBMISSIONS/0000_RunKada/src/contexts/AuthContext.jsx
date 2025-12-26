import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for token in URL parameters (from Strava callback via backend redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');

        if (error) {
          console.error('Authentication error:', decodeURIComponent(error));
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          return;
        }

        if (token && userParam) {
          // Handle successful Strava callback from backend redirect
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            apiClient.setToken(token);
            setUser(userData);
            setIsAuthenticated(true);
            // Clean up URL and navigate to home without full reload
            window.history.replaceState({}, document.title, '/');
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            // Fall through to check existing token
          }
        }

        // Check existing token in localStorage
        if (apiClient.isAuthenticated() && !apiClient.isTokenExpired()) {
          try {
            const response = await apiClient.getProfile();
            setUser(response.user);
            setIsAuthenticated(true);
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            // Token might be invalid, clear it
            apiClient.setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Token is expired or doesn't exist
          apiClient.setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        apiClient.setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login with Strava
  const loginWithStrava = async () => {
    try {
      if (isAuthenticated) {
        return; // Prevent re-authorizing when already authenticated
      }
      const response = await apiClient.getStravaAuthUrl();
      window.location.href = response.authUrl;
    } catch (error) {
      console.error('Error initiating Strava login:', error);
      throw error;
    }
  };

  // Handle Strava callback
  const handleStravaCallback = async (code) => {
    try {
      setLoading(true);
      const response = await apiClient.handleStravaCallback(code);
      
      if (response.success) {
        apiClient.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Strava callback error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      apiClient.setToken(null);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await apiClient.updateProfile(profileData);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Refresh Strava token
  const refreshStravaToken = async () => {
    try {
      await apiClient.refreshStravaToken();
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, user needs to re-authenticate
      logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    loginWithStrava,
    handleStravaCallback,
    logout,
    updateProfile,
    refreshStravaToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
