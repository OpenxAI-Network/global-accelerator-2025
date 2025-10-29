import React from 'react';
import { Link } from 'react-router-dom';
import Squares from '../../components/Squares';
import { ThemeToggle } from '../../components/ThemeToggle';

export const ClanDashboard = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [hasClan, setHasClan] = React.useState(false); // Set to false to show create/join options
  const [showOptions, setShowOptions] = React.useState(true);
  const [creatingClan, setCreatingClan] = React.useState(false);
  const [joiningClan, setJoiningClan] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [newClan, setNewClan] = React.useState({
    name: '',
    badge: '⚡',
    type: 'Casual',
    description: '',
    requirement: '',
    maxMembers: 50
  });

  const badgeOptions = ['⚡', '🌅', '🏅', '⚔️', '🏙️', '🌲', '🔥', '💪', '🎯', '🌟', '🦅', '🐺', '🦁', '🚀', '⭐'];

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

  // Available clans to join
  const availableClans = [
    {
      id: 1,
      name: 'Thunder Runners',
      badge: '⚡',
      members: 45,
      maxMembers: 50,
      totalKm: 2450,
      level: 15,
      description: 'Elite runners pushing limits every day. Join us for weekly challenges!',
      requirement: 'Minimum 50km/month',
      type: 'Competitive',
    },
    {
      id: 2,
      name: 'Morning Joggers',
      badge: '🌅',
      members: 38,
      maxMembers: 50,
      totalKm: 1890,
      level: 12,
      description: 'Casual morning runs for everyone. All paces welcome!',
      requirement: 'No requirements',
      type: 'Casual',
    },
    {
      id: 3,
      name: 'Marathon Maniacs',
      badge: '🏅',
      members: 42,
      maxMembers: 50,
      totalKm: 3200,
      level: 18,
      description: 'Serious marathon training group. We aim for PRs!',
      requirement: 'Marathon experience required',
      type: 'Competitive',
    },
  ];

  const filteredClans = availableClans.filter(clan => 
    clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClan = () => {
    console.log('Creating clan:', newClan);
    alert(`Clan "${newClan.name}" created successfully!`);
    setHasClan(true);
    setCreatingClan(false);
    setShowOptions(false);
  };

  const handleJoinClan = (clan) => {
    console.log('Joining clan:', clan.name);
    alert(`Successfully joined ${clan.name}!`);
    setHasClan(true);
    setJoiningClan(false);
    setShowOptions(false);
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
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {!hasClan ? (
          /* No Clan - Show Options */
          <>
            {showOptions && !creatingClan && !joiningClan ? (
              /* Initial Options: Create or Join */
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-4xl lg:text-6xl uppercase mb-4 transition-colors duration-300">
                    JOIN A <span className="text-[#fcd96b]">CLAN</span>
                  </h1>
                  <p className="[font-family:'Poppins',Helvetica] font-normal text-[#56504a] dark:text-gray-300 text-base lg:text-lg transition-colors duration-300">
                    Create your own clan or join an existing one
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Create Clan Option */}
                  <div
                    onClick={() => {
                      setShowOptions(false);
                      setCreatingClan(true);
                    }}
                    className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-3xl border-3 border-[#56504a] dark:border-[#fcd96b] shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] dark:shadow-[8px_8px_0px_0px_rgba(252,217,107,0.3)] p-8 hover:shadow-[10px_10px_0px_0px_rgba(86,80,74,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(252,217,107,0.3)] hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center"
                  >
                    <div className="text-7xl mb-6">🏆</div>
                    <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-3xl uppercase mb-4 transition-colors duration-300">
                      CREATE CLAN
                    </h2>
                    <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-base mb-6 transition-colors duration-300">
                      Start your own running clan and build a community of motivated runners
                    </p>
                    <div className="inline-block px-6 py-3 rounded-full bg-[#fcd96b] border-2 border-[#56504a] dark:border-[#fcd96b] [font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-sm uppercase">
                      Get Started →
                    </div>
                  </div>

                  {/* Join Clan Option */}
                  <div
                    onClick={() => {
                      setShowOptions(false);
                      setJoiningClan(true);
                    }}
                    className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-3xl border-3 border-[#56504a] dark:border-[#fcd96b] shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] dark:shadow-[8px_8px_0px_0px_rgba(252,217,107,0.3)] p-8 hover:shadow-[10px_10px_0px_0px_rgba(86,80,74,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(252,217,107,0.3)] hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center"
                  >
                    <div className="text-7xl mb-6">👥</div>
                    <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-3xl uppercase mb-4 transition-colors duration-300">
                      JOIN CLAN
                    </h2>
                    <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-base mb-6 transition-colors duration-300">
                      Browse and join existing clans to start running with a community
                    </p>
                    <div className="inline-block px-6 py-3 rounded-full bg-[#fcd96b] border-2 border-[#56504a] dark:border-[#fcd96b] [font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-sm uppercase">
                      Browse Clans →
                    </div>
                  </div>
                </div>
              </div>
            ) : creatingClan ? (
              /* Create Clan Form */
              <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                  onClick={() => {
                    setCreatingClan(false);
                    setShowOptions(true);
                  }}
                  className="mb-8 flex items-center gap-2 [font-family:'Poppins',Helvetica] text-[#56504a] text-base font-medium hover:text-[#fcd96b] transition-colors"
                >
                  <span className="text-2xl">←</span> Back to Options
                </button>

                <div className="text-center mb-8">
                  <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-4xl lg:text-5xl uppercase mb-4">
                    CREATE YOUR <span className="text-[#fcd96b]">CLAN</span>
                  </h1>
                  <p className="[font-family:'Poppins',Helvetica] font-normal text-[#56504a] text-base">
                    Fill in the details to start your running community
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-3 border-[#56504a] shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] p-8">
                  <div className="space-y-6">
                    {/* Clan Name */}
                    <div>
                      <label className="[font-family:'Poppins',Helvetica] font-semibold text-[#56504a] text-sm mb-2 block">
                        Clan Name *
                      </label>
                      <input
                        type="text"
                        value={newClan.name}
                        onChange={(e) => setNewClan({...newClan, name: e.target.value})}
                        placeholder="Enter clan name"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#56504a] [font-family:'Poppins',Helvetica] text-[#56504a] focus:outline-none focus:ring-2 focus:ring-[#fcd96b]"
                      />
                    </div>

                    {/* Badge Selection */}
                    <div>
                      <label className="[font-family:'Poppins',Helvetica] font-semibold text-[#56504a] text-sm mb-2 block">
                        Choose Badge *
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {badgeOptions.map((badge) => (
                          <button
                            key={badge}
                            onClick={() => setNewClan({...newClan, badge})}
                            className={`text-4xl p-4 rounded-lg border-2 transition-all ${
                              newClan.badge === badge
                                ? 'border-[#fcd96b] bg-[#fcd96b] scale-110'
                                : 'border-[#56504a] hover:border-[#fcd96b] hover:bg-[#f7e2c6]'
                            }`}
                          >
                            {badge}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clan Type */}
                    <div>
                      <label className="[font-family:'Poppins',Helvetica] font-semibold text-[#56504a] text-sm mb-2 block">
                        Clan Type *
                      </label>
                      <select
                        value={newClan.type}
                        onChange={(e) => setNewClan({...newClan, type: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#56504a] [font-family:'Poppins',Helvetica] text-[#56504a] focus:outline-none focus:ring-2 focus:ring-[#fcd96b]"
                      >
                        <option value="Casual">Casual</option>
                        <option value="Competitive">Competitive</option>
                        <option value="Social">Social</option>
                        <option value="Adventure">Adventure</option>
                      </select>
                    </div>

                    {/* Max Members */}
                    <div>
                      <label className="[font-family:'Poppins',Helvetica] font-semibold text-[#56504a] text-sm mb-2 block">
                        Maximum Members *
                      </label>
                      <select
                        value={newClan.maxMembers}
                        onChange={(e) => setNewClan({...newClan, maxMembers: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#56504a] [font-family:'Poppins',Helvetica] text-[#56504a] focus:outline-none focus:ring-2 focus:ring-[#fcd96b]"
                      >
                        <option value="20">20 members</option>
                        <option value="30">30 members</option>
                        <option value="40">40 members</option>
                        <option value="50">50 members</option>
                        <option value="100">100 members</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="[font-family:'Poppins',Helvetica] font-semibold text-[#56504a] text-sm mb-2 block">
                        Description *
                      </label>
                      <textarea
                        value={newClan.description}
                        onChange={(e) => setNewClan({...newClan, description: e.target.value})}
                        placeholder="Describe your clan and what makes it unique"
                        rows="4"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#56504a] [font-family:'Poppins',Helvetica] text-[#56504a] focus:outline-none focus:ring-2 focus:ring-[#fcd96b]"
                      />
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="[font-family:'Poppins',Helvetica] font-semibold text-[#56504a] text-sm mb-2 block">
                        Membership Requirement
                      </label>
                      <input
                        type="text"
                        value={newClan.requirement}
                        onChange={(e) => setNewClan({...newClan, requirement: e.target.value})}
                        placeholder="e.g., Minimum 50km/month or No requirements"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#56504a] [font-family:'Poppins',Helvetica] text-[#56504a] focus:outline-none focus:ring-2 focus:ring-[#fcd96b]"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        onClick={handleCreateClan}
                        disabled={!newClan.name || !newClan.description}
                        className="w-full bg-[#fcd96b] hover:bg-[#f7e2c6] text-[#56504a] border-3 border-[#56504a] rounded-[30px] px-12 py-4 shadow-[4px_4px_0px_0px_rgba(86,80,74,1)] hover:shadow-[2px_2px_0px_0px_rgba(86,80,74,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-xl uppercase"
                      >
                        Create Clan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : joiningClan ? (
              /* Browse/Join Clans */
              <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                  onClick={() => {
                    setJoiningClan(false);
                    setShowOptions(true);
                  }}
                  className="mb-8 flex items-center gap-2 [font-family:'Poppins',Helvetica] text-[#56504a] dark:text-[#fcd96b] text-base font-medium hover:text-[#fcd96b] dark:hover:text-white transition-colors"
                >
                  <span className="text-2xl">←</span> Back to Options
                </button>

                <div className="text-center mb-8">
                  <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-4xl lg:text-6xl uppercase mb-4 transition-colors duration-300">
                    FIND YOUR <span className="text-[#fcd96b]">CLAN</span>
                  </h1>
                  <p className="[font-family:'Poppins',Helvetica] font-normal text-[#56504a] dark:text-gray-300 text-base lg:text-lg transition-colors duration-300">
                    Browse and join clans to start your journey
                  </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-12">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search clans by name or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 rounded-[30px] border-3 border-[#56504a] dark:border-[#fcd96b] dark:bg-[#1a1a1a] dark:text-white shadow-[4px_4px_0px_0px_rgba(86,80,74,1)] dark:shadow-[4px_4px_0px_0px_rgba(252,217,107,0.3)] [font-family:'Poppins',Helvetica] text-[#56504a] text-lg focus:outline-none focus:ring-2 focus:ring-[#fcd96b] transition-colors duration-300"
                    />
                    <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl">
                      🔍
                    </span>
                  </div>
                </div>

                {/* Clans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClans.map((clan) => (
                    <div
                      key={clan.id}
                      className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-3xl border-3 border-[#56504a] dark:border-[#fcd96b] shadow-[6px_6px_0px_0px_rgba(86,80,74,1)] dark:shadow-[6px_6px_0px_0px_rgba(252,217,107,0.3)] p-6 hover:shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(252,217,107,0.3)] hover:-translate-y-1 transition-all duration-200"
                    >
                      {/* Clan Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-5xl">{clan.badge}</div>
                        <div className="flex-1">
                          <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-xl uppercase mb-1 transition-colors duration-300">
                            {clan.name}
                          </h3>
                          <span className="inline-block px-3 py-1 rounded-full bg-[#fcd96b] border-2 border-[#56504a] dark:border-[#fcd96b] [font-family:'Poppins',Helvetica] text-[#56504a] text-xs font-semibold">
                            {clan.type}
                          </span>
                        </div>
                      </div>

                      {/* Clan Stats */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-sm font-medium transition-colors duration-300">
                            Level:
                          </span>
                          <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] dark:text-[#fcd96b] text-lg transition-colors duration-300">
                            {clan.level}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-sm font-medium transition-colors duration-300">
                            Members:
                          </span>
                          <span className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-white text-sm font-semibold transition-colors duration-300">
                            {clan.members}/{clan.maxMembers}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-sm font-medium transition-colors duration-300">
                            Total KM:
                          </span>
                          <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#fcd96b] text-lg">
                            {clan.totalKm.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-sm mb-4 line-clamp-2 transition-colors duration-300">
                        {clan.description}
                      </p>

                      {/* Requirements */}
                      <div className="pt-3 border-t-2 border-[#f7e2c6] dark:border-[#3a3a3a] mb-4">
                        <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-xs mb-3 transition-colors duration-300">
                          <span className="font-semibold">Requirement:</span> {clan.requirement}
                        </p>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={() => handleJoinClan(clan)}
                        className="w-full bg-[#fcd96b] hover:bg-[#f7e2c6] dark:hover:bg-[#56504a] text-[#56504a] dark:hover:text-white border-2 border-[#56504a] dark:border-[#fcd96b] rounded-full px-6 py-2 shadow-[2px_2px_0px_0px_rgba(86,80,74,1)] dark:shadow-[2px_2px_0px_0px_rgba(252,217,107,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(86,80,74,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(252,217,107,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-sm uppercase"
                      >
                        Join Clan
                      </button>
                    </div>
                  ))}
                </div>

                {filteredClans.length === 0 && (
                  <div className="text-center py-16">
                    <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-300 text-lg transition-colors duration-300">
                      No clans found. Try a different search term.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : (
          /* Has Clan - Show Clan Dashboard */
          <>
        <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-4xl lg:text-6xl mb-8 transition-colors duration-300">
          MY <span className="text-[#fcd96b]">CLAN</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Clan Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg text-center transition-colors duration-300">
              <div className="text-8xl mb-4">{clanInfo.badge}</div>
              <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-2 transition-colors duration-300">
                {clanInfo.name}
              </h2>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black dark:text-gray-300 text-sm italic mb-4 transition-colors duration-300">
                "{clanInfo.motto}"
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#fcd96b] text-xl">
                  LEVEL {clanInfo.level}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] dark:text-[#fcd96b] text-2xl transition-colors duration-300">
                    {clanInfo.members}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-black dark:text-gray-300 text-xs transition-colors duration-300">
                    Members
                  </div>
                </div>
                <div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] dark:text-[#fcd96b] text-2xl transition-colors duration-300">
                    {clanInfo.totalKm}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-black dark:text-gray-300 text-xs transition-colors duration-300">
                    Total KM
                  </div>
                </div>
                <div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] dark:text-[#fcd96b] text-2xl transition-colors duration-300">
                    #{clanInfo.rank}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-black dark:text-gray-300 text-xs transition-colors duration-300">
                    Rank
                  </div>
                </div>
              </div>

              <button className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white dark:text-[#56504a] text-sm uppercase bg-[#56504a] dark:bg-[#fcd96b] px-6 py-3 rounded-full hover:bg-[#fcd96b] hover:text-[#56504a] dark:hover:bg-[#56504a] dark:hover:text-white transition-all duration-200 mb-3">
                CLAN SETTINGS
              </button>
              <button className="w-full [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-sm uppercase bg-transparent border-2 border-[#56504a] dark:border-[#fcd96b] px-6 py-3 rounded-full hover:bg-[#56504a] hover:text-white dark:hover:bg-[#fcd96b] dark:hover:text-[#56504a] transition-all duration-200">
                LEAVE CLAN
              </button>
            </div>
          </div>

          {/* Weekly Challenge */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg mb-8 transition-colors duration-300">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-4 transition-colors duration-300">
                WEEKLY CHALLENGE
              </h3>
              <div className="mb-4">
                <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-lg mb-2 transition-colors duration-300">
                  {weeklyChallenge.title}
                </div>
                <div className="[font-family:'Poppins',Helvetica] font-normal text-black dark:text-gray-300 text-sm mb-4 transition-colors duration-300">
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
                  <span className="[font-family:'Poppins',Helvetica] text-black dark:text-gray-300 text-sm transition-colors duration-300">
                    {weeklyChallenge.current}km completed
                  </span>
                  <span className="[font-family:'Poppins',Helvetica] text-black dark:text-gray-300 text-sm transition-colors duration-300">
                    Goal: {weeklyChallenge.goal}km
                  </span>
                </div>
              </div>
            </div>

            {/* Clan Activity Feed */}
            <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg transition-colors duration-300">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-4 transition-colors duration-300">
                RECENT ACTIVITY
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-[#f7e2c6] dark:bg-[#3a3a3a] rounded-lg transition-colors duration-300">
                  <p className="[font-family:'Poppins',Helvetica] text-black dark:text-white text-sm transition-colors duration-300">
                    <span className="font-semibold">Sarah Lightning</span> completed a 15.2km run 🏃‍♀️
                  </p>
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-400 text-xs mt-1 transition-colors duration-300">2 hours ago</p>
                </div>
                <div className="p-4 bg-[#f7e2c6] dark:bg-[#3a3a3a] rounded-lg transition-colors duration-300">
                  <p className="[font-family:'Poppins',Helvetica] text-black dark:text-white text-sm transition-colors duration-300">
                    <span className="font-semibold">Mike Storm</span> joined the clan! 🎉
                  </p>
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-400 text-xs mt-1 transition-colors duration-300">5 hours ago</p>
                </div>
                <div className="p-4 bg-[#f7e2c6] dark:bg-[#3a3a3a] rounded-lg transition-colors duration-300">
                  <p className="[font-family:'Poppins',Helvetica] text-black dark:text-white text-sm transition-colors duration-300">
                    <span className="font-semibold">Thunder Runners</span> reached Level 12! ⚡
                  </p>
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-400 text-xs mt-1 transition-colors duration-300">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clan Members */}
        <div className="bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-[#56504a] dark:border-[#fcd96b] shadow-lg transition-colors duration-300">
          <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-2xl mb-6 transition-colors duration-300">
            CLAN MEMBERS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clanMembers.map((member, index) => (
              <div
                key={index}
                className="p-4 bg-[#f7e2c6] dark:bg-[#3a3a3a] rounded-xl hover:bg-[#fcd96b] dark:hover:bg-[#4a4a4a] transition-colors duration-200 flex items-center gap-4"
              >
                <div className="text-4xl">{member.avatar}</div>
                <div className="flex-1">
                  <div className="[font-family:'Poppins',Helvetica] font-semibold text-black dark:text-white text-base transition-colors duration-300">
                    {member.name}
                  </div>
                  <div className="[font-family:'Poppins',Helvetica] text-[#56504a] dark:text-gray-400 text-xs transition-colors duration-300">
                    {member.role}
                  </div>
                  <div className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] dark:text-[#fcd96b] text-sm mt-1 transition-colors duration-300">
                    {member.km} KM
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
};
