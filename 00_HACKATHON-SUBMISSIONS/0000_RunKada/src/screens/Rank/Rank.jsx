import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Squares from "../../components/Squares";
import { ThemeToggle } from "../../components/ThemeToggle";

const navigationItems = [
  { label: "Home", active: false, link: "/" },
  { label: "rank", active: true, link: "/rank" },
  { label: "about", active: false, link: "/about" },
  { label: "clan", active: false, link: "/clan" },
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

// Mock data for individual runners
const individualRankings = [
  {
    rank: 1,
    name: "Alex Martinez",
    clan: "Speed Demons",
    distance: "245.8 km",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    rank: 2,
    name: "Sarah Chen",
    clan: "Marathon Masters",
    distance: "238.5 km",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    rank: 3,
    name: "Marcus Johnson",
    clan: "Urban Runners",
    distance: "231.2 km",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    rank: 4,
    name: "Emma Rodriguez",
    clan: "Trail Blazers",
    distance: "225.7 km",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    rank: 5,
    name: "David Kim",
    clan: "Speed Demons",
    distance: "218.3 km",
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    rank: 6,
    name: "Lisa Thompson",
    clan: "Marathon Masters",
    distance: "212.9 km",
    avatar: "https://i.pravatar.cc/150?img=20",
  },
  {
    rank: 7,
    name: "James Wilson",
    clan: "Urban Runners",
    distance: "205.4 km",
    avatar: "https://i.pravatar.cc/150?img=52",
  },
  {
    rank: 8,
    name: "Maria Garcia",
    clan: "Trail Blazers",
    distance: "198.6 km",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
];

// Mock data for clan rankings
const clanRankings = [
  {
    rank: 1,
    name: "Speed Demons",
    members: 24,
    totalDistance: "5,847 km",
    avgDistance: "243.6 km",
    color: "#fcd96b",
  },
  {
    rank: 2,
    name: "Marathon Masters",
    members: 31,
    totalDistance: "5,621 km",
    avgDistance: "181.3 km",
    color: "#f7e2c6",
  },
  {
    rank: 3,
    name: "Urban Runners",
    members: 19,
    totalDistance: "4,892 km",
    avgDistance: "257.5 km",
    color: "#56504a",
  },
  {
    rank: 4,
    name: "Trail Blazers",
    members: 28,
    totalDistance: "4,673 km",
    avgDistance: "166.9 km",
    color: "#fcd96b",
  },
  {
    rank: 5,
    name: "City Striders",
    members: 22,
    totalDistance: "4,201 km",
    avgDistance: "191.0 km",
    color: "#f7e2c6",
  },
];

export const Rank = () => {
  const [activeTab, setActiveTab] = useState("individual");

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

          {/* Login on Right */}
          <div className="absolute top-16 right-16 flex items-center gap-4">
            <ThemeToggle />
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
      <main className="pt-48 lg:pt-40 px-6 lg:px-[120px] pb-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms] pt-8">
          <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-4xl lg:text-[72px] leading-[1.1] mb-4">
            <span className="text-[#56504a]">LEADERBOARD</span>
          </h1>
          <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-base lg:text-lg max-w-2xl mx-auto">
            See how you stack up against other runners and clans in your area
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-4xl mx-auto mb-12 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:300ms]">
          <div className="flex items-center justify-center gap-4 bg-[#f7e2c680] rounded-[30px] p-2">
            <button
              onClick={() => setActiveTab("individual")}
              className={`[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-base uppercase px-8 py-3 rounded-[30px] transition-all duration-200 ${
                activeTab === "individual"
                  ? "bg-[#fcd96b] text-[#56504a]"
                  : "bg-transparent text-[#56504a] hover:bg-[#f7e2c6]"
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setActiveTab("clan")}
              className={`[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-base uppercase px-8 py-3 rounded-[30px] transition-all duration-200 ${
                activeTab === "clan"
                  ? "bg-[#fcd96b] text-[#56504a]"
                  : "bg-transparent text-[#56504a] hover:bg-[#f7e2c6]"
              }`}
            >
              Clan
            </button>
          </div>
        </div>

        {/* Individual Rankings */}
        {activeTab === "individual" && (
          <div className="max-w-4xl mx-auto translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <div className="space-y-4">
              {individualRankings.map((runner) => (
                <div
                  key={runner.rank}
                  className={`border-[3px] border-black rounded-[20px] p-6 bg-white hover:shadow-lg transition-all duration-200 ${
                    runner.rank <= 3 ? "bg-[#fcd96b20]" : ""
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank Badge */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-[3px] border-black ${
                        runner.rank === 1
                          ? "bg-[#fcd96b]"
                          : runner.rank === 2
                          ? "bg-[#f7e2c6]"
                          : runner.rank === 3
                          ? "bg-[#56504a]"
                          : "bg-white"
                      }`}
                    >
                      <span
                        className={`[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-2xl ${
                          runner.rank === 3 ? "text-white" : "text-black"
                        }`}
                      >
                        {runner.rank}
                      </span>
                    </div>

                    {/* Avatar */}
                    <img
                      src={runner.avatar}
                      alt={runner.name}
                      className="w-16 h-16 rounded-full border-[3px] border-black object-cover"
                    />

                    {/* Runner Info */}
                    <div className="flex-1">
                      <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-xl text-black">
                        {runner.name}
                      </h3>
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm">
                        {runner.clan}
                      </p>
                    </div>

                    {/* Distance */}
                    <div className="text-right">
                      <p className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-2xl text-[#56504a]">
                        {runner.distance}
                      </p>
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm">
                        Total Distance
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clan Rankings */}
        {activeTab === "clan" && (
          <div className="max-w-4xl mx-auto translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
            <div className="space-y-4">
              {clanRankings.map((clan) => (
                <div
                  key={clan.rank}
                  className={`border-[3px] border-black rounded-[20px] p-6 bg-white hover:shadow-lg transition-all duration-200 ${
                    clan.rank <= 3 ? "bg-[#fcd96b20]" : ""
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Rank Badge */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-[3px] border-black ${
                        clan.rank === 1
                          ? "bg-[#fcd96b]"
                          : clan.rank === 2
                          ? "bg-[#f7e2c6]"
                          : clan.rank === 3
                          ? "bg-[#56504a]"
                          : "bg-white"
                      }`}
                    >
                      <span
                        className={`[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-2xl ${
                          clan.rank === 3 ? "text-white" : "text-black"
                        }`}
                      >
                        {clan.rank}
                      </span>
                    </div>

                    {/* Clan Icon */}
                    <div
                      className="w-16 h-16 rounded-full border-[3px] border-black flex items-center justify-center"
                      style={{ backgroundColor: clan.color }}
                    >
                      <img
                        src="https://c.animaapp.com/mgqjxiy6qqDflS/img/running-man-6.png"
                        alt="Clan Icon"
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    {/* Clan Info */}
                    <div className="flex-1">
                      <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-xl text-black">
                        {clan.name}
                      </h3>
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm">
                        {clan.members} members
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-2xl text-[#56504a]">
                        {clan.totalDistance}
                      </p>
                      <p className="[font-family:'Poppins',Helvetica] text-[#56504a] text-sm">
                        Avg: {clan.avgDistance}/member
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

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
