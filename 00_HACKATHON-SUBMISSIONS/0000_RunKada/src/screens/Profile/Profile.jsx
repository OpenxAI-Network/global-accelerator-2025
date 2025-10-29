import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Squares from '../../components/Squares';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Runner',
    email: 'john.runner@email.com',
    age: '28',
    gender: 'Male',
    location: 'San Francisco, CA',
    goal: 'Run 100km this month',
    bio: 'Passionate runner who loves morning jogs and trail running. Member of Thunder Runners clan.',
  });

  const navigationItems = [
    { label: 'DASHBOARD', link: '/dashboard' },
    { label: 'CLAN', link: '/clan-dashboard' },
    { label: 'SETTINGS', link: '/settings' },
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
            <Link to="/dashboard">
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
                <Link key={item.label} to={item.link}>
                  <button
                    className="w-full text-left [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-sm uppercase tracking-wide px-8 py-4 hover:bg-[#fcd96b] transition-all duration-200 border-b border-[#56504a]/10 last:border-b-0"
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
        <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-4xl lg:text-6xl mb-8">
          MY <span className="text-[#fcd96b]">PROFILE</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] shadow-lg text-center mb-6">
              <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto mb-4 rounded-full bg-[#fcd96b] border-4 border-[#56504a] flex items-center justify-center text-6xl">
                👤
              </div>
              <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl mb-2">
                {profileData.name}
              </h2>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-4">
                {profileData.location}
              </p>
              <button className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white text-sm uppercase bg-[#56504a] px-6 py-3 rounded-full hover:bg-[#fcd96b] hover:text-[#56504a] transition-all duration-200">
                CHANGE PHOTO
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#56504a] shadow-lg">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-xl mb-4">
                STATISTICS
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="[font-family:'Poppins',Helvetica] font-medium text-black">Total Runs</span>
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a]">48</span>
                </div>
                <div className="flex justify-between">
                  <span className="[font-family:'Poppins',Helvetica] font-medium text-black">Total Distance</span>
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a]">245.8 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="[font-family:'Poppins',Helvetica] font-medium text-black">Avg Pace</span>
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a]">5:45/km</span>
                </div>
                <div className="flex justify-between">
                  <span className="[font-family:'Poppins',Helvetica] font-medium text-black">Clan Rank</span>
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a]">#3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl">
                  PERSONAL INFO
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white text-sm uppercase bg-[#56504a] px-6 py-2 rounded-full hover:bg-[#fcd96b] hover:text-[#56504a] transition-all duration-200"
                >
                  {isEditing ? 'SAVE' : 'EDIT'}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="[font-family:'Poppins',Helvetica] font-semibold text-black text-sm mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] bg-white disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="[font-family:'Poppins',Helvetica] font-semibold text-black text-sm mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] bg-white disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="[font-family:'Poppins',Helvetica] font-semibold text-black text-sm mb-2 block">
                      Age
                    </label>
                    <input
                      type="text"
                      value={profileData.age}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                      className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] bg-white disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="[font-family:'Poppins',Helvetica] font-semibold text-black text-sm mb-2 block">
                      Gender
                    </label>
                    <input
                      type="text"
                      value={profileData.gender}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] bg-white disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="[font-family:'Poppins',Helvetica] font-semibold text-black text-sm mb-2 block">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] bg-white disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="[font-family:'Poppins',Helvetica] font-semibold text-black text-sm mb-2 block">
                    Running Goal
                  </label>
                  <input
                    type="text"
                    value={profileData.goal}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, goal: e.target.value})}
                    className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] bg-white disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="[font-family:'Poppins',Helvetica] font-semibold text-black text-sm mb-2 block">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows="4"
                    className="w-full [font-family:'Poppins',Helvetica] px-4 py-3 rounded-lg border-2 border-[#56504a] bg-white disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
