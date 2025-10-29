import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Squares from '../../components/Squares';
import { ThemeToggle } from '../../components/ThemeToggle';

export const Settings = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    weeklyReport: false,
    publicProfile: true,
    showStats: true,
    units: 'metric',
    language: 'english',
  });

  const navigationItems = [
    { label: 'DASHBOARD', link: '/dashboard' },
    { label: 'PROFILE', link: '/profile' },
    { label: 'CLAN', link: '/clan-dashboard' },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

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
            <Link to="/dashboard">
              <img
                className="h-16 lg:h-20 w-auto"
                alt="RunKada Logo"
                src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-2.svg"
              />
            </Link>

            <div className="flex items-center gap-4">
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
                <Link key={item.label} to={item.link}>
                  <button
                    className="w-full text-left [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-sm uppercase tracking-wide px-8 py-4 hover:bg-[#fcd96b] dark:hover:bg-[#56504a] hover:text-[#56504a] dark:hover:text-[#fcd96b] transition-all duration-200 border-b border-[#56504a]/10 dark:border-[#fcd96b]/10 last:border-b-0"
                    onClick={() => setMenuOpen(false)}
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
      <main className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-4xl lg:text-6xl mb-8 transition-colors duration-300">
          <span className="text-[#fcd96b] dark:text-[#fcd96b]">SETTINGS</span>
        </h1>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg transition-colors duration-300">
            <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-6 transition-colors duration-300">
              NOTIFICATIONS
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-base transition-colors duration-300">
                    Push Notifications
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] font-normal text-black dark:text-gray-300 text-sm transition-colors duration-300">
                    Receive notifications about your runs and clan activities
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#fcd96b]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-base transition-colors duration-300">
                    Email Updates
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] font-normal text-black dark:text-gray-300 text-sm transition-colors duration-300">
                    Get updates about new features and tips
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailUpdates}
                    onChange={(e) => setSettings({...settings, emailUpdates: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#fcd96b]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-base transition-colors duration-300">
                    Weekly Report
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] font-normal text-black dark:text-gray-300 text-sm transition-colors duration-300">
                    Receive a weekly summary of your running activities
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.weeklyReport}
                    onChange={(e) => setSettings({...settings, weeklyReport: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#fcd96b]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg transition-colors duration-300">
            <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-6 transition-colors duration-300">
              PRIVACY
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-base transition-colors duration-300">
                    Public Profile
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] font-normal text-black dark:text-gray-300 text-sm transition-colors duration-300">
                    Make your profile visible to other runners
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.publicProfile}
                    onChange={(e) => setSettings({...settings, publicProfile: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#fcd96b]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-base transition-colors duration-300">
                    Show Statistics
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] font-normal text-black dark:text-gray-300 text-sm transition-colors duration-300">
                    Display your running stats on your profile
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showStats}
                    onChange={(e) => setSettings({...settings, showStats: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#fcd96b]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg transition-colors duration-300">
            <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-6 transition-colors duration-300">
              PREFERENCES
            </h2>
            <div className="space-y-6">
              <div>
                <label className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-gray-300 text-base mb-3 block transition-colors duration-300">
                  Units
                </label>
                <select
                  value={settings.units}
                  onChange={(e) => setSettings({...settings, units: e.target.value})}
                  className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] dark:border-[#fcd96b] bg-white dark:bg-[#1a1a1a] dark:text-white transition-colors duration-300"
                >
                  <option value="metric">Metric (km)</option>
                  <option value="imperial">Imperial (miles)</option>
                </select>
              </div>

              <div>
                <label className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-gray-300 text-base mb-3 block transition-colors duration-300">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] dark:border-[#fcd96b] bg-white dark:bg-[#1a1a1a] dark:text-white transition-colors duration-300"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg transition-colors duration-300">
            <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-6 transition-colors duration-300">
              ACCOUNT
            </h2>
            <div className="space-y-4">
              <button className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white dark:text-[#56504a] text-sm uppercase bg-[#56504a] dark:bg-[#fcd96b] px-6 py-3 rounded-full hover:bg-[#fcd96b] hover:text-[#56504a] dark:hover:bg-[#56504a] dark:hover:text-white transition-all duration-200">
                CHANGE PASSWORD
              </button>
              <button
                onClick={handleLogout}
                className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white text-sm uppercase bg-[#fc4c02] px-6 py-3 rounded-full hover:bg-red-600 transition-all duration-200"
              >
                LOG OUT
              </button>
              <button className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white text-sm uppercase bg-red-700 px-6 py-3 rounded-full hover:bg-red-800 transition-all duration-200">
                DELETE ACCOUNT
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
