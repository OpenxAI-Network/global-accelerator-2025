import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Squares from '../../components/Squares';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'PROFILE', value: 'profile', link: '/profile' },
    { label: 'CLAN', value: 'clan', link: '/clan-dashboard' },
    { label: 'SETTINGS', value: 'settings', link: '/settings' },
  ];

  const stats = [
    { label: 'Total Distance', value: '245.8 km', icon: '🏃' },
    { label: 'Total Runs', value: '48', icon: '📊' },
    { label: 'Clan Rank', value: '#3', icon: '🏆' },
    { label: 'Weekly Goal', value: '75%', icon: '🎯' },
  ];

  const recentActivities = [
    { date: 'Oct 28, 2025', distance: '8.5 km', time: '45 min', pace: '5:18/km' },
    { date: 'Oct 26, 2025', distance: '12.3 km', time: '1h 15min', pace: '6:05/km' },
    { date: 'Oct 24, 2025', distance: '6.2 km', time: '32 min', pace: '5:10/km' },
    { date: 'Oct 22, 2025', distance: '10.8 km', time: '58 min', pace: '5:22/km' },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
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
      <header className="relative z-50 bg-transparent border-b border-[#56504a]/10">
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

            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative z-50 flex flex-col gap-1.5 p-2 hover:opacity-70 transition-opacity"
              aria-label="Menu"
            >
              <span className={`block w-8 h-0.5 bg-[#56504a] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-8 h-0.5 bg-[#56504a] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-8 h-0.5 bg-[#56504a] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute top-full right-6 lg:right-12 mt-2 bg-white rounded-2xl border-2 border-[#56504a] shadow-lg overflow-hidden z-50">
              {navigationItems.map((item) => (
                <Link key={item.value} to={item.link}>
                  <button
                    className="w-full text-left [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-sm uppercase tracking-wide px-8 py-4 hover:bg-[#fcd96b] transition-all duration-200 border-b border-[#56504a]/10 last:border-b-0"
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
          <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-4xl lg:text-6xl mb-4">
            WELCOME BACK, <span className="text-[#fcd96b]">RUNNER</span>
          </h1>
          <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-lg">
            Keep up the great work! Here's your running overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-3xl mb-2">
                {stat.value}
              </div>
              <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] shadow-lg mb-12">
          <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl lg:text-3xl mb-6">
            RECENT ACTIVITIES
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-[#f7e2c6] rounded-xl hover:bg-[#fcd96b] transition-colors duration-200"
              >
                <div className="mb-2 lg:mb-0">
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black text-base mb-1">
                    {activity.date}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] font-normal text-[#56504a] text-sm">
                    Duration: {activity.time}
                  </div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">Distance</div>
                    <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-lg">
                      {activity.distance}
                    </div>
                  </div>
                  <div>
                    <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">Pace</div>
                    <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-lg">
                      {activity.pace}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/profile" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
            <div className="text-4xl mb-3">👤</div>
            <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-xl mb-2">
              VIEW PROFILE
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">
              Update your information
            </div>
          </Link>

          <Link to="/clan-dashboard" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
            <div className="text-4xl mb-3">⚔️</div>
            <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-xl mb-2">
              MY CLAN
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">
              See your clan progress
            </div>
          </Link>

          <Link to="/settings" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-xl mb-2">
              SETTINGS
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">
              Manage preferences
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};
