import React from 'react';
import { Link } from 'react-router-dom';
import Squares from '../../components/Squares';

export const ClanDashboard = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navigationItems = [
    { label: 'DASHBOARD', link: '/dashboard' },
    { label: 'PROFILE', link: '/profile' },
    { label: 'SETTINGS', link: '/settings' },
  ];

  const clanInfo = {
    name: 'Thunder Runners',
    badge: '⚡',
    level: 12,
    members: 28,
    totalKm: 1847,
    rank: 3,
    motto: 'Fast as Lightning, Strong as Thunder',
  };

  const clanMembers = [
    { name: 'Sarah Lightning', role: 'Leader', km: 125.4, avatar: '👩' },
    { name: 'Mike Storm', role: 'Co-Leader', km: 98.2, avatar: '👨' },
    { name: 'John Runner', role: 'Elder', km: 87.5, avatar: '👤' },
    { name: 'Emma Swift', role: 'Elder', km: 76.8, avatar: '👩' },
    { name: 'Alex Thunder', role: 'Member', km: 65.3, avatar: '👨' },
    { name: 'Lisa Flash', role: 'Member', km: 54.9, avatar: '👩' },
  ];

  const weeklyChallenge = {
    title: 'October Running Challenge',
    description: 'Complete 500km as a clan this month',
    progress: 67,
    current: 337,
    goal: 500,
  };

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
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-4xl lg:text-6xl mb-8">
          MY <span className="text-[#fcd96b]">CLAN</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Clan Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] shadow-lg text-center">
              <div className="text-8xl mb-4">{clanInfo.badge}</div>
              <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl mb-2">
                {clanInfo.name}
              </h2>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm italic mb-4">
                "{clanInfo.motto}"
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#fcd96b] text-xl">
                  LEVEL {clanInfo.level}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-2xl">
                    {clanInfo.members}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-black text-xs">
                    Members
                  </div>
                </div>
                <div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-2xl">
                    {clanInfo.totalKm}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-black text-xs">
                    Total KM
                  </div>
                </div>
                <div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-2xl">
                    #{clanInfo.rank}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-black text-xs">
                    Rank
                  </div>
                </div>
              </div>

              <button className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white text-sm uppercase bg-[#56504a] px-6 py-3 rounded-full hover:bg-[#fcd96b] hover:text-[#56504a] transition-all duration-200 mb-3">
                CLAN SETTINGS
              </button>
              <button className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-sm uppercase bg-transparent border-2 border-[#56504a] px-6 py-3 rounded-full hover:bg-[#56504a] hover:text-white transition-all duration-200">
                LEAVE CLAN
              </button>
            </div>
          </div>

          {/* Weekly Challenge */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] shadow-lg mb-8">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl mb-4">
                WEEKLY CHALLENGE
              </h3>
              <div className="mb-4">
                <div className="[font-family:'Poppins',Helvetica] font-semibold text-black text-lg mb-2">
                  {weeklyChallenge.title}
                </div>
                <div className="[font-family:'Poppins',Helvetica] font-normal text-black text-sm mb-4">
                  {weeklyChallenge.description}
                </div>
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#fcd96b] transition-all duration-500"
                    style={{ width: `${weeklyChallenge.progress}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center [font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-xs">
                    {weeklyChallenge.progress}%
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="[font-family:'Poppins',Helvetica] text-black text-sm">
                    {weeklyChallenge.current}km completed
                  </span>
                  <span className="[font-family:'Poppins',Helvetica] text-black text-sm">
                    Goal: {weeklyChallenge.goal}km
                  </span>
                </div>
              </div>
            </div>

            {/* Clan Activity Feed */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] shadow-lg">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl mb-4">
                RECENT ACTIVITY
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-[#f7e2c6] rounded-lg">
                  <p className="[font-family:'Poppins',Helvetica] text-black text-sm">
                    <span className="font-semibold">Sarah Lightning</span> completed a 15.2km run 🏃‍♀️
                  </p>
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs mt-1">2 hours ago</p>
                </div>
                <div className="p-4 bg-[#f7e2c6] rounded-lg">
                  <p className="[font-family:'Poppins',Helvetica] text-black text-sm">
                    <span className="font-semibold">Mike Storm</span> joined the clan! 🎉
                  </p>
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs mt-1">5 hours ago</p>
                </div>
                <div className="p-4 bg-[#f7e2c6] rounded-lg">
                  <p className="[font-family:'Poppins',Helvetica] text-black text-sm">
                    <span className="font-semibold">Thunder Runners</span> reached Level 12! ⚡
                  </p>
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clan Members */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] shadow-lg">
          <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl mb-6">
            CLAN MEMBERS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clanMembers.map((member, index) => (
              <div
                key={index}
                className="p-4 bg-[#f7e2c6] rounded-xl hover:bg-[#fcd96b] transition-colors duration-200 flex items-center gap-4"
              >
                <div className="text-4xl">{member.avatar}</div>
                <div className="flex-1">
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black text-base">
                    {member.name}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs">
                    {member.role}
                  </div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-sm mt-1">
                    {member.km} KM
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
