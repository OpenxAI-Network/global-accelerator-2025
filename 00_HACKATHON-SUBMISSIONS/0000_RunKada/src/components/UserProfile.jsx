import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api.js';

const UserProfile = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);

  // Load user activities and stats
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load recent activities
      const activitiesResponse = await apiClient.getRecentActivities(5);
      setActivities(activitiesResponse.activities);

      // Load user stats
      const statsResponse = await apiClient.getActivityStats();
      setStats(statsResponse.stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
        <a href="/login" className="bg-blue-500 text-white px-6 py-2 rounded">
          Go to Login
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          {user.profile_picture && (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {user.firstname} {user.lastname}
            </h1>
            <p className="text-gray-600">
              {user.city && user.state && `${user.city}, ${user.state}`}
              {user.country && `, ${user.country}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Running Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total_activities}
              </div>
              <div className="text-sm text-gray-600">Total Runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(stats.total_distance / 1000).toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600">Total Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(stats.total_moving_time / 3600)}h {Math.floor((stats.total_moving_time % 3600) / 60)}m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.avg_speed.toFixed(1)} m/s
              </div>
              <div className="text-sm text-gray-600">Avg Speed</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="border-b pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{activity.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {(activity.distance / 1000).toFixed(2)} km
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.floor(activity.moving_time / 60)} min
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No activities found. Start running to see your activities here!</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
