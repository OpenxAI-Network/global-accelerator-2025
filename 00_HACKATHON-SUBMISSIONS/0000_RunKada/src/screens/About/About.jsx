import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Squares from "../../components/Squares";
import { ThemeToggle } from "../../components/ThemeToggle";

const navigationItems = [
  { label: "Home", active: false, link: "/" },
  { label: "rank", active: false, link: "/rank" },
  { label: "about", active: true, link: "/about" },
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

const teamMembers = [
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man-2.png",
    alt: "Man",
    name: "Nicholas Samia",
    role: "Lead Developer",
    bio: "Full-stack developer with passion for creating seamless user experiences."
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man--1--1.png",
    alt: "Man",
    name: "Erholled Duenas",
    role: "Backend Engineer",
    bio: "Specializes in scalable backend systems and API development."
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/woman--1--1.png",
    alt: "Woman",
    name: "Gelsey Manalac",
    role: "UI/UX Designer",
    bio: "Creates beautiful and intuitive interfaces that users love."
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/woman-1.png",
    alt: "Woman",
    name: "Jennylyn Magno",
    role: "Frontend Developer",
    bio: "Brings designs to life with modern frontend technologies."
  },
  {
    src: "https://c.animaapp.com/mgqjxiy6qqDflS/img/man--2--1.png",
    alt: "Man",
    name: "Simon Reyes",
    role: "Project Manager",
    bio: "Coordinates the team and ensures project success."
  },
];

export const About = () => {
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
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-48 lg:pt-48 pb-16 lg:pb-24">
          <h1 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-5xl lg:text-7xl mb-8 text-center">
            ABOUT <span className="text-[#fcd96b]">RUNKADA</span>
          </h1>
          
          <div className="max-w-[800px] mx-auto">
            <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-lg lg:text-xl leading-relaxed mb-6 text-center">
              At Runkada, we believe that <span className="font-bold">running is better together.</span> We exist to transform an individual pursuit into a shared challenge, using friendly Clan competition to keep everyone motivated and accountable.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border-[3px] border-black rounded-[30px] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-3xl mb-4">
                OUR MISSION
              </h3>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-base leading-relaxed">
                To create a global community of runners who support, challenge, and inspire each other through the power of shared goals and friendly competition.
              </p>
            </div>

            <div className="bg-white border-[3px] border-black rounded-[30px] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#fcd96b] text-3xl mb-4">
                OUR VISION
              </h3>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-base leading-relaxed">
                A world where every runner, regardless of pace or distance, finds their tribe and discovers the joy of running together, even when apart.
              </p>
            </div>

            <div className="bg-white border-[3px] border-black rounded-[30px] p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-3xl mb-4">
                OUR VALUES
              </h3>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-base leading-relaxed">
                Community first. Authenticity always. Progress over perfection. Celebrate every kilometer, every runner, every achievement.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-16 lg:pb-24">
          <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-4xl lg:text-5xl mb-4 text-center">
            MEET THE <span className="text-[#fcd96b]">TEAM</span>
          </h2>
          <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-base mb-12 text-center">
            Created for the 2025 OpenxAI Hack Node Hackathon
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white border-[3px] border-black rounded-[30px] p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 border-[3px] border-black rounded-full overflow-hidden mb-4 bg-[#f7e2c6]">
                    <img
                      className="w-full h-full object-cover"
                      alt={member.alt}
                      src={member.src}
                    />
                  </div>
                  <h3 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-2xl mb-2">
                    {member.name}
                  </h3>
                  <p className="[font-family:'Poppins',Helvetica] font-bold text-[#fcd96b] text-sm mb-3 uppercase">
                    {member.role}
                  </p>
                  <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24">
          <div className="bg-[#fcd96b] border-[3px] border-black rounded-[30px] p-12 lg:p-16 text-center">
            <h2 className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-[#56504a] text-4xl lg:text-5xl mb-6">
              READY TO START RUNNING?
            </h2>
            <p className="[font-family:'Poppins',Helvetica] font-medium text-[#56504a] text-lg mb-8 max-w-[600px] mx-auto">
              Join thousands of runners who are already part of the Runkada community. Find your stride, find your tribe.
            </p>
            <Link to="/">
              <Button className="bg-[#56504a] hover:bg-black text-white rounded-[30px] px-12 py-6 text-lg">
                <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal uppercase">
                  Get Started
                </span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative pt-16 lg:pt-24 pb-16 translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:800ms] z-10">
        <div className="max-w-[400px] lg:max-w-[800px] mx-auto text-center px-6">
          <img
            className="h-20 lg:h-32 w-auto mx-auto mb-6 lg:mb-8"
            alt="RunKada Logo"
            src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-2.svg"
          />

          <p className="[font-family:'Poppins',Helvetica] text-white text-sm lg:text-base leading-relaxed mb-4 lg:mb-6 px-4 lg:px-8">
            <span className="font-medium">At Runkada, we believe that </span>
            <span className="font-bold">running is better together. </span>
            <span className="font-medium">
              We exist to transform an individual pursuit into a shared
              challenge, using friendly Clan competition to keep everyone
              motivated and accountable.
            </span>
          </p>

          <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm lg:text-base mb-6 lg:mb-8">
            © Runkada 2025
          </p>

          <nav className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm lg:text-base space-y-2 lg:space-y-3 mb-6 lg:mb-8">
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
