import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api.js';
import { Link } from 'react-router-dom';
import Squares from '../../components/Squares';
import { ThemeToggle } from '../../components/ThemeToggle';

export const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [clanRank, setClanRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Strava
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch activity stats
      const statsResponse = await apiClient.getActivityStats();
      if (statsResponse.success) {
        const activityStats = statsResponse.stats;
        // Fetch clan rank first
        let userClanRank = 'N/A';
        try {
          const userClanResponse = await apiClient.getUserClan();
          if (userClanResponse.success && userClanResponse.clan) {
            const leaderboardResponse = await apiClient.getClanLeaderboard('all', 100);
            if (leaderboardResponse.success) {
              const clanIndex = leaderboardResponse.leaderboard.findIndex(
                c => c.id === userClanResponse.clan.id
              );
              if (clanIndex !== -1) {
                userClanRank = `#${clanIndex + 1}`;
                setClanRank(userClanRank);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching clan rank:', error);
        }

        setStats({
          totalDistance: (activityStats.total_distance / 1000).toFixed(1) + ' km',
          totalRuns: activityStats.total_activities || 0,
          weeklyGoal: '75%', // Can be calculated based on user goals
          clanRank: userClanRank
        });
      }

      // Fetch recent activities
      const activitiesResponse = await apiClient.getRecentActivities(5);
      if (activitiesResponse.success) {
        const formattedActivities = activitiesResponse.activities.map(activity => {
          const distanceKm = (activity.distance / 1000).toFixed(1);
          const timeMinutes = Math.floor(activity.moving_time / 60);
          const timeHours = Math.floor(timeMinutes / 60);
          const timeMins = timeMinutes % 60;
          const timeStr = timeHours > 0 
            ? `${timeHours}h ${timeMins}min` 
            : `${timeMins} min`;
          
          const paceSeconds = activity.moving_time / (activity.distance / 1000);
          const paceMinutes = Math.floor(paceSeconds / 60);
          const paceSecs = Math.floor(paceSeconds % 60);
          const paceStr = `${paceMinutes}:${paceSecs.toString().padStart(2, '0')}/km`;

          return {
            date: new Date(activity.start_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            distance: `${distanceKm} km`,
            time: timeStr,
            pace: paceStr,
            name: activity.name
          };
        });
        setRecentActivities(formattedActivities);
      }


    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access the dashboard</h2>
          <Link to="/login" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { label: 'PROFILE', value: 'profile', link: '/profile' },
    { label: 'CLAN', value: 'clan', link: '/clan-dashboard' },
    { label: 'SETTINGS', value: 'settings', link: '/settings' },
  ];

  const displayStats = stats ? [
    { label: 'Total Distance', value: stats.totalDistance, icon: '🏃' },
    { label: 'Total Runs', value: stats.totalRuns.toString(), icon: '📊' },
    { label: 'Clan Rank', value: stats.clanRank, icon: '🏆' },
    { label: 'Weekly Goal', value: stats.weeklyGoal, icon: '🎯' },
  ] : [
    { label: 'Total Distance', value: 'Loading...', icon: '🏃' },
    { label: 'Total Runs', value: 'Loading...', icon: '📊' },
    { label: 'Clan Rank', value: 'Loading...', icon: '🏆' },
    { label: 'Weekly Goal', value: 'Loading...', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a] relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-auto">
        <Squares 
          speed={0.2} 
          squareSize={40}
          direction='diagonal'
          borderColor='#56504a'
          hoverFillColor='#fcd96b'
        />
      </div>

      {/* Header */}
      <header className="relative z-50 bg-transparent border-b border-[#56504a]/10 dark:border-[#fcd96b]/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <img
                className="h-16 lg:h-20 w-auto"
                alt="RunKada Logo"
                src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-2.svg"
              />
            </Link>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative z-50 flex flex-col gap-1.5 p-2 hover:opacity-70 transition-opacity"
                aria-label="Menu"
              >
                <span className={`block w-8 h-0.5 bg-[#56504a] dark:bg-[#fcd96b] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-8 h-0.5 bg-[#56504a] dark:bg-[#fcd96b] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-8 h-0.5 bg-[#56504a] dark:bg-[#fcd96b] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute top-full right-6 lg:right-12 mt-2 bg-white dark:bg-[#2a2a2a] rounded-2xl border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg overflow-hidden z-50">
              {navigationItems.map((item) => (

                <Link key={item.value} to={item.link}>
                  <button
                    className="w-full text-left [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-sm uppercase tracking-wide px-8 py-4 hover:bg-[#fcd96b] dark:hover:bg-[#56504a] transition-all duration-200 border-b border-[#56504a]/10 dark:border-[#fcd96b]/10 last:border-b-0"
                    onClick={() => {
                      setActiveTab(item.value);
                      setMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-4xl lg:text-6xl mb-4">
            WELCOME BACK, <span className="text-[#fcd96b] dark:text-white">RUNNER</span>
          </h1>
          <p className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-lg">
            Keep up the great work! Here's your running overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-3xl mb-2">
                {stat.value}
              </div>
              <div className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg mb-12">
          <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl lg:text-3xl mb-6">
            RECENT ACTIVITIES
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#56504a] dark:border-[#fcd96b] mx-auto"></div>
                <p className="mt-4 [font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300">Loading activities...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-[#f7e2c6] dark:bg-[#3a3a3a] rounded-xl hover:bg-[#fcd96b] dark:hover:bg-[#4a4a4a] transition-colors duration-200"
              >
                <div className="mb-2 lg:mb-0">
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-base mb-1">
                    {activity.date}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] font-normal text-[#56504a] dark:text-gray-300 text-sm">
                    Duration: {activity.time}
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-sm">Distance</div>
                    <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-lg">
                      {activity.distance}
                    </div>
                  </div>
                  <div>
                    <div className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-sm">Pace</div>
                    <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-lg">
                      {activity.pace}
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300">
                  No activities found. Start running to see your activities here!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/profile" className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
            <div className="text-4xl mb-3">👤</div>
            <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-xl mb-2">
              VIEW PROFILE
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-sm">
              Update your information
            </div>
          </Link>

          <Link to="/clan-dashboard" className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
            <div className="text-4xl mb-3">⚔️</div>
            <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-xl mb-2">
              MY CLAN
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-sm">
              See your clan progress
            </div>
          </Link>

          <Link to="/settings" className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-xl mb-2">
              SETTINGS
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-sm">
              Manage preferences
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};
