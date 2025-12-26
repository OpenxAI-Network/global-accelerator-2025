import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Squares from "../../components/Squares";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../lib/api.js";

const navigationItems = [
  { label: "Home", active: false, link: "/" },
  { label: "rank", active: false, link: "/rank" },
  { label: "about", active: false, link: "/about" },
  { label: "clan", active: true, link: "/clan" },
];

const footerLinks = ["Home", "Rank", "About", "Clan", "Log In"];

const socialIcons = [
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-2.svg",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon.svg",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-1.svg",
  },
];

export const Clan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClan, setSelectedClan] = useState(null);
  const { isAuthenticated, logout } = useAuth();
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClans();
  }, []);

  const loadClans = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getClans(50, 0);
      if (response.success) {
        // Format clans with Strava data
        const formatted = response.clans.map(clan => ({
          id: clan.id,
          name: clan.name,
          badge: "🏃", // Default badge, can be customized
          members: clan.member_count || 0,
          maxMembers: 50, // Default max
          totalKm: Math.round((clan.total_distance || 0) / 1000),
          level: Math.floor((clan.total_distance || 0) / 100000) + 1, // Level based on total distance
          description: clan.description || "A running clan powered by Strava data",
          requirement: "Connect with Strava",
          type: clan.is_private ? "Private" : "Public",
          total_distance: clan.total_distance || 0,
          avg_distance: clan.avg_distance || 0
        }));
        setClans(formatted);
      }
    } catch (error) {
      console.error('Error loading clans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClanClick = async (clan) => {
    try {
      // Fetch detailed clan information
      const response = await apiClient.getClan(clan.id);
      if (response.success) {
        const detailedClan = {
          ...clan,
          members_list: response.clan.members.map((member, index) => ({
            name: `${member.firstname} ${member.lastname}`,
            role: member.role === 'admin' ? 'Leader' : member.role === 'co_leader' ? 'Co-Leader' : member.role === 'elder' ? 'Elder' : 'Member',
            km: Math.round((member.total_distance || 0) / 1000),
            avatar: member.profile_picture || `https://i.pravatar.cc/150?img=${index + 1}`
          }))
        };
        setSelectedClan(detailedClan);
      }
    } catch (error) {
      console.error('Error loading clan details:', error);
    }
  };

  const handleJoinClan = async (clanId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await apiClient.joinClan(clanId);
      if (response.success) {
        alert('Successfully joined clan!');
        // Reload clans to update member counts
        loadClans();
        // Reload selected clan
        if (selectedClan && selectedClan.id === clanId) {
          handleClanClick(selectedClan);
        }
      }
    } catch (error) {
      console.error('Error joining clan:', error);
      alert(error.message || 'Failed to join clan');
    }
  };

  // Mock data for clans (fallback)
  const mockClans = [
    {
      id: 1,
      name: "Thunder Runners",
      badge: "⚡",
      members: 45,
      maxMembers: 50,
      totalKm: 2450,
      level: 15,
      description: "Elite runners pushing limits every day. Join us for weekly challenges!",
      requirement: "Minimum 50km/month",
      type: "Competitive",
      members_list: [
        { name: "Sarah Chen", role: "Leader", km: 245, avatar: "🏃‍♀️" },
        { name: "Mike Johnson", role: "Co-Leader", km: 230, avatar: "🏃‍♂️" },
        { name: "Emma Davis", role: "Elder", km: 198, avatar: "🏃‍♀️" },
        { name: "Alex Kim", role: "Member", km: 175, avatar: "🏃" },
        { name: "Lisa Wong", role: "Member", km: 167, avatar: "🏃‍♀️" },
      ]
    },
    {
      id: 2,
      name: "Morning Joggers",
      badge: "🌅",
      members: 38,
      maxMembers: 50,
      totalKm: 1890,
      level: 12,
      description: "Casual morning runs for everyone. All paces welcome!",
      requirement: "No requirements",
      type: "Casual",
      members_list: [
        { name: "Tom Brown", role: "Leader", km: 189, avatar: "🏃‍♂️" },
        { name: "Jane Smith", role: "Co-Leader", km: 156, avatar: "🏃‍♀️" },
        { name: "Chris Lee", role: "Member", km: 145, avatar: "🏃" },
        { name: "Amy Park", role: "Member", km: 134, avatar: "🏃‍♀️" },
        { name: "David Wu", role: "Member", km: 128, avatar: "🏃‍♂️" },
      ]
    },
    {
      id: 3,
      name: "Marathon Maniacs",
      badge: "🏅",
      members: 42,
      maxMembers: 50,
      totalKm: 3200,
      level: 18,
      description: "Serious marathon training group. We aim for PRs!",
      requirement: "Marathon experience required",
      type: "Competitive",
      members_list: [
        { name: "Robert Martinez", role: "Leader", km: 320, avatar: "🏃‍♂️" },
        { name: "Nina Patel", role: "Co-Leader", km: 298, avatar: "🏃‍♀️" },
        { name: "Kevin Zhang", role: "Elder", km: 276, avatar: "🏃" },
        { name: "Sophie Taylor", role: "Member", km: 245, avatar: "🏃‍♀️" },
        { name: "James Wilson", role: "Member", km: 234, avatar: "🏃‍♂️" },
      ]
    },
    {
      id: 4,
      name: "Weekend Warriors",
      badge: "⚔️",
      members: 30,
      maxMembers: 40,
      totalKm: 1456,
      level: 10,
      description: "Weekend runs with friends. Social and fun!",
      requirement: "Run at least once a week",
      type: "Social",
      members_list: [
        { name: "Marcus Hill", role: "Leader", km: 156, avatar: "🏃‍♂️" },
        { name: "Rachel Green", role: "Co-Leader", km: 142, avatar: "🏃‍♀️" },
        { name: "Tyler Moore", role: "Member", km: 125, avatar: "🏃" },
        { name: "Olivia White", role: "Member", km: 118, avatar: "🏃‍♀️" },
        { name: "Brian Clark", role: "Member", km: 109, avatar: "🏃‍♂️" },
      ]
    },
    {
      id: 5,
      name: "City Sprinters",
      badge: "🏙️",
      members: 35,
      maxMembers: 50,
      totalKm: 1678,
      level: 11,
      description: "Urban runners exploring the city streets.",
      requirement: "Active weekly participation",
      type: "Casual",
      members_list: [
        { name: "Elena Rodriguez", role: "Leader", km: 178, avatar: "🏃‍♀️" },
        { name: "Daniel Kim", role: "Co-Leader", km: 165, avatar: "🏃‍♂️" },
        { name: "Maria Santos", role: "Member", km: 149, avatar: "🏃‍♀️" },
        { name: "Jake Anderson", role: "Member", km: 138, avatar: "🏃" },
        { name: "Lucy Chen", role: "Member", km: 127, avatar: "🏃‍♀️" },
      ]
    },
    {
      id: 6,
      name: "Trail Blazers",
      badge: "🌲",
      members: 28,
      maxMembers: 40,
      totalKm: 2100,
      level: 14,
      description: "Adventure seekers running mountain and forest trails.",
      requirement: "Trail running experience",
      type: "Adventure",
      members_list: [
        { name: "Sam Cooper", role: "Leader", km: 210, avatar: "🏃‍♂️" },
        { name: "Zoe Mitchell", role: "Co-Leader", km: 195, avatar: "🏃‍♀️" },
        { name: "Ian Foster", role: "Elder", km: 183, avatar: "🏃" },
        { name: "Maya Johnson", role: "Member", km: 172, avatar: "🏃‍♀️" },
        { name: "Ryan Lee", role: "Member", km: 164, avatar: "🏃‍♂️" },
      ]
    }
  ];

  // Filter clans based on search query
  const filteredClans = clans.filter(clan => 
    clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (clan.type && clan.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#f5f5f5] dark:bg-[#1a1a1a] overflow-hidden w-full min-h-screen relative transition-colors duration-300">
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

      {/* Header - Responsive */}
      <header className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms] relative z-50">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          {/* Logo on Left */}
          <img
            className="absolute left-20 top-8 h-[100px] w-auto"
            alt="RunKada Logo"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-1.svg"
          />

          {/* Navigation in Middle */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#f7e2c680] dark:bg-[#2a2a2a]/80 rounded-[30px] px-8 py-4 flex items-center gap-6 z-50 transition-colors duration-300">
            {navigationItems.map((item, index) => (
              <Link key={index} to={item.link}>
                <button
                  className={`[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-base uppercase tracking-wide px-6 py-2 rounded-[30px] transition-all duration-200 ${
                    item.active ? "bg-[#f7e2c6] dark:bg-[#fcd96b] dark:text-[#56504a]" : "bg-transparent hover:bg-[#f7e2c6] dark:hover:bg-[#56504a]"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>

          {/* Login/Logout on Right */}
          <div className="absolute top-16 right-16 flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="px-8 py-4 rounded-[30px] border-2 border-[#56504a] dark:border-[#fcd96b] bg-transparent hover:bg-[#f7e2c6] dark:hover:bg-[#56504a] transition-colors"
                onClick={logout}
              >
                <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-base uppercase">
                  log out
                </span>
              </Button>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  className="px-8 py-4 rounded-[30px] border-2 border-[#56504a] dark:border-[#fcd96b] bg-transparent hover:bg-[#f7e2c6] dark:hover:bg-[#56504a] transition-colors"
                >
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-base uppercase">
                    log in
                  </span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden max-w-[400px] mx-auto px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <img
              className="h-16 w-auto"
              alt="RunKada Logo"
              src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-1.svg"
            />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-full border-2 border-[#56504a] dark:border-[#fcd96b] bg-transparent hover:bg-[#f7e2c6] dark:hover:bg-[#56504a] transition-colors text-sm"
                  onClick={logout}
                >
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b]">
                    LOG OUT
                  </span>
                </Button>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="px-6 py-2 rounded-full border-2 border-[#56504a] dark:border-[#fcd96b] bg-transparent hover:bg-[#f7e2c6] dark:hover:bg-[#56504a] transition-colors text-sm"
                  >
                    <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b]">
                      LOG IN
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center justify-center gap-4 bg-[#f7e2c680] dark:bg-[#2a2a2a]/80 rounded-full py-3 px-4 transition-colors duration-300">
            {navigationItems.map((item) => (
              <Link key={item.label} to={item.link}>
                <button
                  className={`[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] dark:text-[#fcd96b] text-xs uppercase tracking-wide px-3 py-2 rounded-full transition-all duration-200 ${
                    item.active ? "bg-[#f7e2c6] dark:bg-[#fcd96b] dark:text-[#56504a]" : "bg-transparent hover:bg-[#f7e2c6] dark:hover:bg-[#56504a]"
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-6 lg:px-16 pt-48 lg:pt-40 pb-16">
        {!selectedClan ? (
          <>
            {/* Title Section */}
            <div className="text-center mb-12 pt-8">
              <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-4xl lg:text-6xl uppercase mb-4">
                FIND YOUR CLAN
              </h1>
              <p className="[font-family:'Poppins',Helvetica] font-normal text-[#56504a] text-base lg:text-lg max-w-2xl mx-auto mb-6">
                Join a running clan to compete, motivate each other, and achieve your goals together. {!isAuthenticated && 'Log in to create your own clan!'}
              </p>
              {isAuthenticated && (
                <Link to="/clan-dashboard">
                  <button className="inline-flex items-center gap-3 bg-[#fcd96b] hover:bg-[#f7e2c6] text-[#56504a] border-3 border-[#56504a] rounded-[30px] px-8 py-4 shadow-[4px_4px_0px_0px_rgba(86,80,74,1)] hover:shadow-[2px_2px_0px_0px_rgba(86,80,74,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 [font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-lg uppercase">
                    <span className="text-2xl">🏆</span>
                    Create Your Clan
                  </button>
                </Link>
              )}
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clans by name or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-[30px] border-3 border-[#56504a] shadow-[4px_4px_0px_0px_rgba(86,80,74,1)] [font-family:'Poppins',Helvetica] text-[#56504a] text-lg focus:outline-none focus:ring-2 focus:ring-[#fcd96b]"
                />
                <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl">
                  🔍
                </span>
              </div>
            </div>

            {/* Clans Grid */}
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#56504a] mx-auto"></div>
                  <p className="mt-4 [font-family:'Poppins',Helvetica] text-[#56504a]">Loading clans...</p>
                </div>
              ) : filteredClans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClans.map((clan) => (
                    <div
                      key={clan.id}
                      onClick={() => handleClanClick(clan)}
                      className="bg-white rounded-3xl border-3 border-[#56504a] shadow-[6px_6px_0px_0px_rgba(86,80,74,1)] p-6 hover:shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                    >
                    {/* Clan Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl">{clan.badge}</div>
                      <div className="flex-1">
                        <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-xl uppercase mb-1">
                          {clan.name}
                        </h3>
                        <span className="inline-block px-3 py-1 rounded-full bg-[#fcd96b] border-2 border-[#56504a] [font-family:'Poppins',Helvetica] text-[#56504a] text-xs font-semibold">
                          {clan.type}
                        </span>
                      </div>
                    </div>

                    {/* Clan Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm font-medium">
                          Level:
                        </span>
                        <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-lg">
                          {clan.level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm font-medium">
                          Members:
                        </span>
                        <span className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm font-semibold">
                          {clan.members}/{clan.maxMembers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm font-medium">
                          Total KM:
                        </span>
                        <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#fcd96b] text-lg">
                          {clan.totalKm.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm mb-4 line-clamp-2">
                      {clan.description}
                    </p>

                    {/* Requirements */}
                    <div className="pt-3 border-t-2 border-[#f7e2c6]">
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs">
                        <span className="font-semibold">Requirement:</span> {clan.requirement}
                      </p>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-lg">
                    {searchQuery ? 'No clans found. Try a different search term.' : 'No clans available yet. Be the first to create one!'}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Clan Detail View */
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => setSelectedClan(null)}
              className="mb-8 flex items-center gap-2 [font-family:'Poppins',Helvetica] text-[#56504a] text-base font-medium hover:text-[#fcd96b] transition-colors"
            >
              <span className="text-2xl">←</span> Back to Clans
            </button>

            {/* Clan Header Card */}
            <div className="bg-white rounded-3xl border-3 border-[#56504a] shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] p-8 mb-8">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="text-7xl">{selectedClan.badge}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-3xl lg:text-4xl uppercase">
                      {selectedClan.name}
                    </h2>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#fcd96b] border-2 border-[#56504a] [font-family:'Poppins',Helvetica] text-[#56504a] text-sm font-semibold">
                      {selectedClan.type}
                    </span>
                  </div>
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-base mb-6">
                    {selectedClan.description}
                  </p>
                  
                    {/* Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#f7e2c6] rounded-2xl border-2 border-[#56504a] p-4 text-center">
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs mb-1">Level</p>
                      <p className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-2xl">{selectedClan.level || 1}</p>
                    </div>
                    <div className="bg-[#f7e2c6] rounded-2xl border-2 border-[#56504a] p-4 text-center">
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs mb-1">Members</p>
                      <p className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-2xl">{selectedClan.members}/{selectedClan.maxMembers || 50}</p>
                    </div>
                    <div className="bg-[#f7e2c6] rounded-2xl border-2 border-[#56504a] p-4 text-center">
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs mb-1">Total KM</p>
                      <p className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#fcd96b] text-2xl">{selectedClan.totalKm?.toLocaleString() || Math.round((selectedClan.total_distance || 0) / 1000).toLocaleString()}</p>
                    </div>
                    <div className="bg-[#f7e2c6] rounded-2xl border-2 border-[#56504a] p-4 text-center">
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs mb-1">Avg/Member</p>
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs font-semibold mt-2">{selectedClan.members > 0 ? Math.round((selectedClan.totalKm || (selectedClan.total_distance || 0) / 1000) / selectedClan.members) : 0} km</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <div className="mt-6 pt-6 border-t-2 border-[#f7e2c6]">
                <Button
                  onClick={() => handleJoinClan(selectedClan.id)}
                  className="w-full lg:w-auto bg-[#fcd96b] hover:bg-[#f7e2c6] text-[#56504a] border-3 border-[#56504a] rounded-[30px] px-12 py-4 shadow-[4px_4px_0px_0px_rgba(86,80,74,1)] hover:shadow-[2px_2px_0px_0px_rgba(86,80,74,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                >
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-xl uppercase">
                    Join Clan
                  </span>
                </Button>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-3xl border-3 border-[#56504a] shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] p-8">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl uppercase mb-6">
                MEMBERS ({selectedClan.members_list?.length || selectedClan.members || 0})
              </h3>

              {selectedClan.members_list && selectedClan.members_list.length > 0 ? (
                <div className="space-y-3">
                  {selectedClan.members_list.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#56504a] bg-[#f7e2c6] hover:bg-[#fcd96b] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {member.avatar && member.avatar.startsWith('http') ? (
                          <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border-2 border-[#56504a]" />
                        ) : (
                          <div className="text-3xl">{member.avatar || '🏃'}</div>
                        )}
                        <div>
                          <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-base font-semibold">
                            {member.name}
                          </p>
                          <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="[font-family:'Porter_Sans_Block-Block',Helvetica] text-[#56504a] text-xl">
                          {member.km || 0} KM
                        </p>
                        <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-xs">
                          total distance
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="[font-family:'Poppins',Helvetica] text-[#56504a]">No members found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative pt-16 lg:pt-24 pb-16 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms] z-10">
        <div className="max-w-[400px] lg:max-w-[800px] mx-auto text-center px-6">
          <img
            className="h-20 lg:h-32 w-auto mx-auto mb-6 lg:mb-8"
            alt="RunKada Logo"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-2.svg"
          />

          <p className="[font-family:'Poppins',Helvetica] text-black text-sm lg:text-base leading-relaxed mb-4 lg:mb-6 px-4 lg:px-8">
            <span className="font-medium">At Runkada, we believe that </span>
            <span className="font-bold">running is better together. </span>
            <span className="font-medium">
              We exist to transform an individual pursuit into a shared
              challenge, using friendly Clan competition to keep everyone
              motivated and accountable.
            </span>
          </p>

          <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm lg:text-base mb-6 lg:mb-8">
            © Runkada 2025
          </p>

          <nav className="[font-family:'Poppins',Helvetica] font-normal text-black text-sm lg:text-base space-y-2 lg:space-y-3 mb-6 lg:mb-8">
            <div><Link to="/" className="hover:opacity-70 transition-opacity">Home</Link></div>
            <div><Link to="/rank" className="hover:opacity-70 transition-opacity">Rank</Link></div>
            <div><Link to="/about" className="hover:opacity-70 transition-opacity">About</Link></div>
            <div><Link to="/clan" className="hover:opacity-70 transition-opacity">Clan</Link></div>
            <div><Link to="/login" className="hover:opacity-70 transition-opacity">Log In</Link></div>
          </nav>

          {/* Social Icons */}
          <div className="flex justify-center gap-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 lg:w-10 h-8 lg:h-10 relative hover:opacity-70 transition-opacity"
            >
              <img
                className="w-full h-full object-contain"
                alt="Facebook"
                src="https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-2.svg"
              />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 lg:w-10 h-8 lg:h-10 relative hover:opacity-70 transition-opacity"
            >
              <img
                className="w-full h-full object-contain"
                alt="Twitter"
                src="https://c.animaapp.com/mgqjxiy6qqDflS/img/icon.svg"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 lg:w-10 h-8 lg:h-10 relative hover:opacity-70 transition-opacity"
            >
              <img
                className="w-full h-full object-contain"
                alt="Instagram"
                src="https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-1.svg"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
