import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import RotatingText from "../../components/RotatingText";
import Squares from "../../components/Squares";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";

const navigationItems = [
  { label: "Home", active: true, link: "/" },
  { label: "rank", active: false, link: "/rank" },
  { label: "about", active: false, link: "/about" },
  { label: "clan", active: false, link: "/clan" },
];

const runningManIcons = [
  { top: "top-[1278px]", left: "left-[181px]" },
  { top: "top-[1345px]", left: "left-[239px]" },
  { top: "top-[1336px]", left: "left-[193px]" },
  { top: "top-[1401px]", left: "left-[188px]" },
  { top: "top-[1383px]", left: "left-[248px]" },
  { top: "top-[1445px]", left: "left-[206px]" },
];

const verticalLines = [
  { top: "top-[999px]", left: "left-[232px]", height: "h-[1984px]" },
  { top: "top-[999px]", left: "left-[289px]", height: "h-[1778px]" },
  { top: "top-[999px]", left: "left-[346px]", height: "h-[1465px]" },
  { top: "top-[999px]", left: "left-[406px]", height: "h-[1239px]" },
  { top: "top-[996px]", left: "left-[474px]", height: "h-[959px]" },
  { top: "top-[993px]", left: "left-[165px]", height: "h-[2376px]" },
];

const faqItems = [
  {
    number: "1",
    question: "Q: What is Runkada?",
    answer:
      "A: Runkada is a web application that syncs with your Strava account to collect and total your running kilometers. We turn your miles into a friendly competition by ranking you against others in your Clan and ranking your Clan against others in your area!",
    topPosition: "top-[1939px]",
    leftPosition: "left-[489px]",
    badgeTop: "top-[1888px]",
    badgeLeft: "left-[421px]",
  },
  {
    number: "2",
    question: "Q: How do I sign up and start using Runkada?",
    answer:
      "A: You can sign up easily using your existing Strava account. We'll ask for permission to view your running activities, and once authorized, your kilometers will start being tracked automatically!",
    topPosition: "top-[2186px]",
    leftPosition: "left-[464px]",
    badgeTop: "top-[2138px]",
    badgeLeft: "left-[372px]",
  },
  {
    number: "3",
    question: "Q: Which activities count towards my ranking?",
    answer:
      "A: Currently, only running activities tracked on Strava count towards your total accumulated kilometers and your Clan's ranking.",
    topPosition: "top-[2453px]",
    leftPosition: "left-[421px]",
    badgeTop: "top-[2400px]",
    badgeLeft: "left-[329px]",
  },
  {
    number: "4",
    question: "Q: What is a Clan?",
    answer:
      "A: A Clan is a team or group of Runkada users. When you join or create a Clan, your individual accumulated kilometers contribute to your Clan's total distance.",
    topPosition: "top-[2719px]",
    leftPosition: "left-[341px]",
    badgeTop: "top-[2668px]",
    badgeLeft: "left-[252px]",
  },
];

const teamMembers = [
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man-2.png",
    alt: "Man",
    left: "left-[189px]",
    name: "Nicholas Samia",
    role: "Lead Developer",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man--1--1.png",
    alt: "Man",
    left: "left-[324px]",
    name: "Erholled Duenas",
    role: "Backend Engineer",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/woman--1--1.png",
    alt: "Woman",
    left: "left-[459px]",
    name: "Gelsey Manalac",
    role: "UI/UX Designer",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/woman-1.png",
    alt: "Woman",
    left: "left-[594px]",
    name: "Jennylyn Magno",
    role: "Frontend Developer",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man--2--1.png",
    alt: "Man",
    left: "left-[729px]",
    name: "Simon Reyes",
    role: "Project Manager",
  },
];

const shoesIcons = [
  { top: "top-[3298px]", left: "left-[883px]", size: "w-[41px] h-[41px]" },
  { top: "top-[3297px]", left: "left-[929px]", size: "w-[41px] h-[41px]" },
  { top: "top-[3308px]", left: "left-[986px]", size: "w-7 h-7" },
  { top: "top-[3307px]", left: "left-[1015px]", size: "w-7 h-7" },
];

const footerLinks = ["Home", "Rank", "About", "Clan", "Log In"];

// Carousel images - black and white group running images
const carouselImages = [
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/rectangle.png",
    title: "JOIN THE MOVEMENT",
    description: "Connect with runners worldwide",
  },
  {
    src: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=1000&fit=crop&sat=-100",
    title: "FIND YOUR TRIBE",
    description: "Discover communities that match your pace",
  },
  {
    src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=1000&fit=crop&sat=-100",
    title: "TRACK YOUR PROGRESS",
    description: "Monitor your journey and celebrate milestones",
  },
  {
    src: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&h=1000&fit=crop&sat=-100",
    title: "RUN TOGETHER",
    description: "Build lasting connections through running",
  },
];

const socialIcons = [
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-2.svg",
    width: "w-[83.33%]",
    height: "h-[83.33%]",
    left: "left-[2.49%]",
    top: "top-[2.31%]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon.svg",
    width: "w-[45.83%]",
    height: "h-[83.33%]",
    left: "left-[23.33%]",
    top: "top-[2.31%]",
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/icon-1.svg",
    width: "w-[83.33%]",
    height: "h-[79.17%]",
    left: "left-[2.49%]",
    top: "top-[2.31%]",
  },
];

export const Homepage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [stats, setStats] = useState({
    runners: 0,
    distance: 0,
    clans: 0
  });
  const { isAuthenticated, logout } = useAuth();

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Track scroll for running man animation and parallax
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min(scrollTop / docHeight, 1);
      setScrollProgress(scrollPercent);

      // Check if stats section is visible
      const statsSection = document.getElementById('stats-section');
      if (statsSection && !statsVisible) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setStatsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsVisible]);

  // Animate stats counter when visible
  useEffect(() => {
    if (!statsVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    
    const targets = {
      runners: 10000,
      distance: 500000,
      clans: 250
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        runners: Math.floor(targets.runners * progress),
        distance: Math.floor(targets.distance * progress),
        clans: Math.floor(targets.clans * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targets);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [statsVisible]);

  // Calculate running man positions with random stop points
  const runnerPositions = [
    { 
      left: '384px', 
      startTop: 200, 
      endTop: 1400, // Stop before line ends
      stopAt: 0.6 + Math.random() * 0.2 // Random stop between 60-80% of journey
    },
    { 
      left: '469px', 
      startTop: 100, 
      endTop: 1400,
      stopAt: 0.5 + Math.random() * 0.25
    },
    { 
      left: '309px', 
      startTop: 300, 
      endTop: 1400,
      stopAt: 0.55 + Math.random() * 0.3
    },
    { 
      left: '549px', 
      startTop: 30, 
      endTop: 1400,
      stopAt: 0.65 + Math.random() * 0.2
    },
  ];

  const getRunnerTop = (runner) => {
    const progress = Math.min(scrollProgress / runner.stopAt, 1);
    return runner.startTop + (runner.endTop - runner.startTop) * progress;
  };

  return (
    <div
      className="bg-[#f5f5f5] dark:bg-[#1a1a1a] overflow-hidden w-full min-h-screen relative transition-colors duration-300"
      data-model-id="7:3"
    >
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
          {/* Navigation Bar - Desktop */}
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

      {/* Main Content - Responsive */}
      <main>
        {/* Desktop Hero Section */}
        <section className="hidden lg:block relative h-[1300px] pt-32 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          {/* Phone on Left - Bigger with Parallax */}
          <div 
            className="absolute left-0 top-44 transition-transform duration-100"
            style={{ transform: `translateY(${scrollProgress * 100}px)` }}
          >
            {/* White background for phone */}
            <div className="absolute bg-white rounded-[40px]" style={{ 
              zIndex: -1,
              top: '60px',
              bottom: '60px',
              left: '260px',
              right: '260px'
            }} />
            <img
              className="w-[850px] h-auto object-contain relative z-10"
              alt="iPhone Mockup"
              src="https://c.animaapp.com/mgqjxiy6qqDflS/img/iphone-1.png"
            />
            {/* Logo centered on phone */}
            <img
              className="absolute w-[200px] h-auto object-contain"
              style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)' 
              }}
              alt="RunKada Logo"
              src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-1.svg"
            />
          </div>

          {/* Hero Text to the right of phone with slight parallax */}
          <div 
            className="absolute left-[800px] top-[240px] transition-transform duration-100"
            style={{ transform: `translateY(${scrollProgress * -30}px)` }}
          >
            <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[72px] leading-[1.1]">
              <span className="text-[#56504a]">FIND<br /></span>
              <span className="text-[#56504a]">YOUR<br /></span>
              <RotatingText
                texts={['STRIDE,', 'PACE,', 'RHYTHM,', 'BEAT,']}
                mainClassName="text-[#56504a] inline-block overflow-hidden"
                staggerFrom="first"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
              <br />
              <span className="text-[#56504a]">FIND<br /></span>
              <span className="text-[#56504a]">YOUR<br /></span>
              <span className="text-[#fcd96b]">TRIBE</span>
            </h1>
          </div>

          {/* Carousel/Image Card on Right below message with Parallax */}
          <div 
            className="absolute left-[800px] top-[800px] w-[480px] transition-transform duration-100"
            style={{ transform: `translateY(${scrollProgress * -50}px)` }}
          >
            {/* Shadow layers - yellow outer, black middle */}
            <div className="absolute inset-0 bg-[#fcd96b] rounded-[100px] translate-x-4 translate-y-4 w-full h-[640px] z-0" />
            <div className="absolute inset-0 bg-[#000000] rounded-[100px] translate-x-2 translate-y-2 w-full h-[640px] z-[1]" />
            
            {/* Main image with carousel */}
            <div className="relative w-full h-[640px] rounded-[100px] overflow-hidden z-10 bg-black">
              {carouselImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    className="w-full h-full object-cover"
                    alt={`Runner ${index + 1}`}
                    src={img.src}
                  />
                  {/* Text Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 pb-20">
                    <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white text-3xl mb-2">
                      {img.title}
                    </h3>
                    <p className="[font-family:'Poppins',Helvetica] font-medium text-white/90 text-lg">
                      {img.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Pagination dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {carouselImages.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-4 h-4 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-[#fcd96b]" : "bg-[#fcd96b80]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lines and Icons Section - Separate to avoid overlap */}
        <section className="hidden lg:block relative h-[250px] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:300ms]">
          {/* Black Lines from bottom of phone to each FAQ number */}
          {/* Phone bottom center is at ~425px x (moved left), 576px y from top of hero section */}
          {/* Lines start from phone bottom and extend down to FAQ badges */}
          <svg className="absolute left-0 top-[-576px]" width="1280" height="1400" style={{ overflow: 'visible', pointerEvents: 'none' }}>
            {/* Line to FAQ 1 */}
            <line x1="380" y1="254" x2="380" y2="1700" stroke="black" strokeWidth="3" />
            
            {/* Line to FAQ 2 */}
            <line x1="465" y1="254" x2="465" y2="1350" stroke="black" strokeWidth="3" />
            
            {/* Line to FAQ 3 */}
            <line x1="305" y1="254" x2="305" y2="1900" stroke="black" strokeWidth="3" />
            
            {/* Line to FAQ 4 */}
            <line x1="545" y1="254" x2="545" y2="1100" stroke="black" strokeWidth="3" />
          </svg>

          {/* Running man icons on the lines */}
          <img
            className="absolute w-[32px] h-[32px] object-cover"
            style={{ left: '384px', top: '200px', transform: 'rotate(90deg)' }}
            alt="Running man"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/running-man-6.png"
          />
          <img
            className="absolute w-[32px] h-[32px] object-cover"
            style={{ left: '469px', top: '100px', transform: 'rotate(90deg)' }}
            alt="Running man"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/running-man-6.png"
          />
          <img
            className="absolute w-[32px] h-[32px] object-cover"
            style={{ left: '309px', top: '300px', transform: 'rotate(90deg)' }}
            alt="Running man"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/running-man-6.png"
          />
          <img
            className="absolute w-[32px] h-[32px] object-cover"
            style={{ left: '549px', top: '30px', transform: 'rotate(90deg)' }}
            alt="Running man"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/running-man-6.png"
          />
        </section>

        {/* Mobile Hero Section */}
        <section className="lg:hidden max-w-[400px] mx-auto px-6 pt-8 pb-16 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          {/* Phone and Hero Text - Side by Side */}
          <div className="flex items-center gap-4 mb-8">
            {/* Phone with Logo on Left */}
            <div className="relative w-[180px] flex-shrink-0">
              {/* White background for phone */}
              <div className="absolute bg-white rounded-[8px]" style={{ 
                zIndex: -1,
                top: '14px',
                bottom: '14px',
                left: '55px',
                right: '55px'
              }} />
              <img
                className="w-full h-auto object-contain relative z-10"
                alt="iPhone Mockup"
                src="https://c.animaapp.com/mgqjxiy6qqDflS/img/iphone-1.png"
              />
              {/* Logo centered on phone */}
              <img
                className="absolute w-[45px] h-auto object-contain"
                style={{ 
                  left: '50%', 
                  top: '35%', 
                  transform: 'translate(-50%, -50%)' 
                }}
                alt="RunKada Logo"
                src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-1.svg"
              />
            </div>

            {/* Hero Text on Right */}
            <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[32px] leading-[1.1] flex-1">
              <span className="text-[#56504a]">FIND<br /></span>
              <span className="text-[#56504a]">YOUR<br /></span>
              <RotatingText
                texts={['STRIDE,', 'PACE,', 'RHYTHM,', 'BEAT,']}
                mainClassName="text-[#56504a] inline-block overflow-hidden"
                staggerFrom="first"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
              <br />
              <span className="text-[#56504a]">FIND<br /></span>
              <span className="text-[#56504a]">YOUR<br /></span>
              <span className="text-[#fcd96b]">TRIBE</span>
            </h1>
          </div>

          {/* Carousel */}
          <div className="relative w-full max-w-[320px] mx-auto">
            {/* Shadow layers */}
            <div className="absolute inset-0 bg-[#fcd96b] rounded-[40px] translate-x-2 translate-y-2 w-full h-[400px] z-0" />
            <div className="absolute inset-0 bg-[#000000] rounded-[40px] translate-x-1 translate-y-1 w-full h-[400px] z-[1]" />
            
            {/* Main carousel */}
            <div className="relative w-full h-[400px] rounded-[40px] overflow-hidden z-10 bg-black">
              {carouselImages.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    className="w-full h-full object-cover"
                    alt={`Runner ${index + 1}`}
                    src={img.src}
                  />
                  {/* Text Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-white text-xl mb-1">
                      {img.title}
                    </h3>
                    <p className="[font-family:'Poppins',Helvetica] font-medium text-white/90 text-sm">
                      {img.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? "bg-[#fcd96b] w-6" 
                        : "bg-white/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Desktop FAQ Section */}
        <section className="hidden lg:block relative pl-[60px] pr-[300px] pb-80 translate-y-[-100rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          <h2 className="[font-family:'Porter_Sans_Block-Regular',Helvetica] font-normal text-[36px] text-right mb-16">
            <span className="text-[#56504a]">FAQ ABOUT THE <br /></span>
            <span className="text-[#fcd96b]">WEBAPP RUNKADA</span>
          </h2>

          <div className="space-y-12 max-w-[900px] ml-[180px]">
            {faqItems.map((faq, index) => (
              <div 
                key={faq.number} 
                className="relative"
                style={{ 
                  marginLeft: `${(faqItems.length - 1 - index) * 80}px`,
                  transform: `translateY(${scrollProgress * (index * 10 - 20)}px)`
                }}
              >
                {/* FAQ Card with hover effect */}
                <div className="border-[3px] border-black rounded-[20px] p-8 bg-white relative pl-24 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:bg-[#f7e2c6]">
                  {/* Number Badge - positioned to left with parallax */}
                  <div 
                    className="absolute -left-16 top-4 w-28 h-28 bg-[#fcd96b] rounded-full flex items-center justify-center border-[3px] border-black transition-transform duration-300 hover:scale-110 hover:rotate-12"
                    style={{ 
                      transform: `translateY(${scrollProgress * (index * -5)}px)`
                    }}
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-black text-5xl">
                        {faq.number}
                      </span>
                    </div>
                  </div>
                  
                  {/* Question Header */}
                  <div className="border-b-[3px] border-black pb-4 mb-4">
                    <h3 className="[font-family:'Poppins',Helvetica] font-bold text-black text-lg">
                      {faq.question}
                    </h3>
                  </div>
                  
                  {/* Answer */}
                  <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile FAQ Section */}
        <section className="lg:hidden max-w-[400px] mx-auto px-6 mt-16 mb-16 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:400ms]">
          <h2 className="[font-family:'Porter_Sans_Block-Regular',Helvetica] font-normal text-2xl text-center mb-8">
            <span className="text-[#56504a]">FAQ ABOUT THE </span>
            <span className="text-[#fcd96b]">WEBAPP</span>
          </h2>

          <div className="space-y-8">
            {faqItems.map((faq) => (
              <div key={faq.number} className="relative">
                {/* FAQ Card */}
                <div className="border-[3px] border-black rounded-[20px] p-6 bg-white relative pl-20">
                  {/* Number Badge */}
                  <div className="absolute -left-8 top-0 w-20 h-20 bg-[#fcd96b] rounded-full flex items-center justify-center border-[3px] border-black">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                      <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-black text-3xl">
                        {faq.number}
                      </span>
                    </div>
                  </div>
                  
                  {/* Question Header */}
                  <div className="border-b-[3px] border-black pb-3 mb-3">
                    <h3 className="[font-family:'Poppins',Helvetica] font-bold text-black text-sm">
                      {faq.question}
                    </h3>
                  </div>
                  
                  {/* Answer */}
                  <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Animated Statistics Section - Both Desktop and Mobile */}
        <section 
          id="stats-section"
          className="relative max-w-[1200px] mx-auto px-6 lg:px-12 py-8 lg:py-1 mb-12 lg:mb-16 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:500ms]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Stat 1: Total Runners */}
            <div className="text-center transform transition-all duration-300 hover:scale-110">
              <div className="bg-[#fcd96b] rounded-[30px] p-8 lg:p-12 border-[3px] border-black shadow-lg">
                <div className="mb-4">
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-5xl lg:text-6xl">
                    {stats.runners.toLocaleString()}+
                  </span>
                </div>
                <p className="[font-family:'Poppins',Helvetica] font-bold text-[#56504a] text-lg lg:text-xl uppercase tracking-wide">
                  Active Runners
                </p>
                <p className="[font-family:'Poppins',Helvetica] font-medium text-[#56504a] text-sm mt-2">
                  Join the community
                </p>
              </div>
            </div>

            {/* Stat 2: Total Distance */}
            <div className="text-center transform transition-all duration-300 hover:scale-110">
              <div className="bg-[#f7e2c6] rounded-[30px] p-8 lg:p-12 border-[3px] border-black shadow-lg">
                <div className="mb-4">
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-5xl lg:text-6xl">
                    {(stats.distance / 1000).toLocaleString()}K
                  </span>
                </div>
                <p className="[font-family:'Poppins',Helvetica] font-bold text-[#56504a] text-lg lg:text-xl uppercase tracking-wide">
                  Kilometers Tracked
                </p>
                <p className="[font-family:'Poppins',Helvetica] font-medium text-[#56504a] text-sm mt-2">
                  And counting...
                </p>
              </div>
            </div>

            {/* Stat 3: Active Clans */}
            <div className="text-center transform transition-all duration-300 hover:scale-110">
              <div className="bg-[#fcd96b] rounded-[30px] p-8 lg:p-12 border-[3px] border-black shadow-lg">
                <div className="mb-4">
                  <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-5xl lg:text-6xl">
                    {stats.clans}+
                  </span>
                </div>
                <p className="[font-family:'Poppins',Helvetica] font-bold text-[#56504a] text-lg lg:text-xl uppercase tracking-wide">
                  Active Clans
                </p>
                <p className="[font-family:'Poppins',Helvetica] font-medium text-[#56504a] text-sm mt-2">
                  Find your tribe
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Developers Section - Responsive */}
        <section className="relative px-6 lg:px-[120px] pt-8 lg:pt-4 translate-y-[-4rem] animate-fade-in opacity-0 [--animation-delay:600ms]">
          <h2 className="[font-family:'Porter_Sans_Block-Regular',Helvetica] font-normal text-2xl lg:text-[36px] text-center mb-8 lg:mb-12">
            <span className="text-[#56504a]">ABOUT RUNKADA </span>
            <span className="text-[#fcd96b]">DEVELOPERS</span>
          </h2>

          {/* Desktop Layout */}
          <div className="hidden lg:block border-[3px] border-black rounded-[30px] p-8 bg-white max-w-[1100px] mx-auto">
            <div className="flex items-center justify-between">
              {/* Team Members */}
              <div className="flex gap-4">
                {teamMembers.map((member, index) => (
                  <div
                    key={`member-${index}`}
                    className="relative w-20 h-20 border-[3px] border-black rounded-[20px] overflow-visible flex items-center justify-center bg-white group cursor-pointer"
                  >
                    <img
                      className="w-16 h-16 object-cover"
                      alt={member.alt}
                      src={member.src}
                    />
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#56504a] text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div className="text-center">
                        <p className="[font-family:'Poppins',Helvetica] font-semibold text-sm">{member.name}</p>
                        <p className="[font-family:'Poppins',Helvetica] font-normal text-xs text-[#fcd96b]">{member.role}</p>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#56504a]"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shoes and Description */}
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {shoesIcons.slice(0, 4).map((_, index) => (
                    <img
                      key={`shoe-${index}`}
                      className={`${index < 2 ? 'w-10 h-10' : 'w-8 h-8'} object-cover`}
                      alt="Shoes"
                      src="https://c.animaapp.com/mgqjxiy6qqDflS/img/shoes-5.png"
                    />
                  ))}
                </div>
                <div className="border-[3px] border-black rounded-[20px] px-6 py-4">
                  <p className="[font-family:'Poppins',Helvetica] font-bold text-black text-sm text-center leading-tight">
                    This team is formed for<br />
                    the 2025 OpenxAI Hack Node Hackathon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden border-[3px] border-black rounded-[30px] p-6 bg-white max-w-[400px] mx-auto">
            {/* Team Members Row */}
            <div className="flex justify-center gap-3 mb-4">
              {teamMembers.map((member, index) => (
                <div
                  key={`member-${index}`}
                  className="relative group cursor-pointer"
                >
                  <div className="w-16 h-16 border-[3px] border-black rounded-[20px] overflow-hidden flex items-center justify-center bg-white">
                    <img
                      className="w-14 h-14 object-cover rounded-[18px]"
                      alt={member.alt}
                      src={member.src}
                    />
                  </div>
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#56504a] text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="text-center">
                      <p className="[font-family:'Poppins',Helvetica] font-semibold text-xs">{member.name}</p>
                      <p className="[font-family:'Poppins',Helvetica] font-normal text-[10px] text-[#fcd96b]">{member.role}</p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#56504a]"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Team Description */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {shoesIcons.slice(0, 2).map((_, index) => (
                  <img
                    key={`shoe-${index}`}
                    className="w-8 h-8 object-cover"
                    alt="Shoes"
                    src="https://c.animaapp.com/mgqjxiy6qqDflS/img/shoes-5.png"
                  />
                ))}
              </div>
              <div className="flex-1 border-[3px] border-black rounded-[20px] p-3">
                <p className="[font-family:'Poppins',Helvetica] font-bold text-black text-xs text-center leading-tight">
                  The team was formed for<br />
                  the 2025 OpenxAI Hack Node Hackathon
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Responsive */}
        <footer className="relative pt-16 lg:pt-24 pb-16 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms]">
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
              <div>
                {isAuthenticated ? (
                  <button onClick={logout} className="hover:opacity-70 transition-opacity">Log Out</button>
                ) : (
                  <Link to="/login" className="hover:opacity-70 transition-opacity">Log In</Link>
                )}
              </div>
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
      </main>
    </div>
  );
};
