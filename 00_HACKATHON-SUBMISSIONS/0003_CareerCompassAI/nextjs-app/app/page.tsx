'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import Link from 'next/link';
import ParticleBackground from './components/particle-background';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { 
  Brain, 
  Mic, 
  Users, 
  TrendingUp, 
  Globe, 
  Sparkles,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Typewriter animation for title
    if (titleRef.current) {
      gsap.fromTo(titleRef.current, 
        { width: '0ch' },
        { 
          width: '100%',
          duration: 3,
          ease: 'steps(50)',
          delay: 1
        }
      );
    }

    // Hero section animations
    gsap.timeline()
      .from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 4 })
      .from('.hero-cta', { opacity: 0, y: 20, duration: 0.8 }, '-=0.5')
      .from('.hero-features', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, '-=0.3');

  }, [isClient]);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-cyber-blue" />,
      title: "AI Career Matching",
      description: "Advanced AI analyzes your skills, interests, and goals to recommend perfect career paths."
    },

    {
      icon: <Users className="w-8 h-8 text-neon-pink" />,
      title: "Personalized Learning",
      description: "Custom learning paths with flashcards, quizzes, and interactive study materials."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-matrix-green" />,
      title: "Real-time Insights",
      description: "Live market trends, salary data, and growth opportunities in the Indian job market."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      image: "/images/testimonial-1.jpg",
      content: "CareerCompass AI helped me transition from marketing to tech. The personalized roadmap was incredibly detailed and the voice guidance made it feel like having a personal mentor.",
      rating: 5
    },
    {
      name: "Rahul Kumar",
      role: "Data Scientist",
      image: "/images/testimonial-2.jpg", 
      content: "The AI-powered career matching was spot-on. It identified skills I didn't even know I had and suggested career paths I'd never considered. Now I'm thriving in data science!",
      rating: 5
    },
    {
      name: "Anita Verma",
      role: "Product Manager",
      image: "/images/testimonial-3.jpg",
      content: "The multilingual support was a game-changer. Being able to discuss my career goals in Hindi made the whole process more comfortable and natural.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Careers Matched" },
    { number: "95%", label: "Success Rate" },
    { number: "50+", label: "Industries Covered" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-white/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-electric-purple rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple">
                CareerCompass AI
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How it Works', 'Testimonials', 'Pricing'].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-white/70 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
            
            <Link href="/profile">
              <Button className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          style={{ y }}
        >
          <motion.h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-8 w-full text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-electric-purple to-neon-pink overflow-hidden whitespace-nowrap"
            style={{ width: '0ch' }}
          >
            CareerCompass AI – Find Future
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Your AI mentor to help you plan careers, upskill smartly, and access curated growth paths. 
            All powered by voice and your goals.
          </motion.p>

          <motion.div 
            className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link href="/profile">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80 text-lg px-8 py-4 animate-pulse-slow"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Start Exploring</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              className="glassmorphism border-white/30 hover:border-cyber-blue/50 text-lg px-8 py-4"
            >
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </div>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 5 + index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple mb-2">
                  {stat.number}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience the future of career guidance with our cutting-edge AI technology and immersive voice interactions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="hero-features"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 glassmorphism border-white/20 hover:border-cyber-blue/50 transition-all duration-300 h-full group">
                  <motion.div
                    className="mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyber-blue transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-electric-purple to-neon-pink">
              How CareerCompass Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Share Your Story",
                description: "Tell us about your skills, interests, and career goals through voice or text interaction.",
                icon: <Mic className="w-8 h-8" />
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Our advanced AI analyzes your profile and matches you with perfect career opportunities.",
                icon: <Brain className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Get Your Roadmap", 
                description: "Receive a personalized learning path with resources, timeline, and milestone tracking.",
                icon: <TrendingUp className="w-8 h-8" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 glassmorphism border-white/20 text-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-6xl font-bold text-white/5">
                    {item.step}
                  </div>
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-r from-cyber-blue to-electric-purple rounded-full flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-cyber-blue">
              Success Stories
            </h2>
            <p className="text-xl text-white/70">
              See how CareerCompass AI has transformed careers across India
            </p>
          </motion.div>

          <div className="relative">
            <Card className="max-w-4xl mx-auto p-8 glassmorphism border-white/20">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-white/90 mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyber-blue to-electric-purple rounded-full flex items-center justify-center text-white font-bold">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonials[currentTestimonial].name}</div>
                    <div className="text-white/60">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </motion.div>
            </Card>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-cyber-blue' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-cyber-blue/10 to-electric-purple/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-white/80 mb-12">
              Join thousands of professionals who've found their perfect career path with CareerCompass AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/profile">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80 text-lg px-12 py-4"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Start Your Journey</span>
                  </div>
                </Button>
              </Link>
              
              <Link href="/learn">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="glassmorphism border-white/30 hover:border-electric-purple/50 text-lg px-12 py-4"
                >
                  Explore Learning Hub
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/30 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyber-blue to-electric-purple rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple">
                  CareerCompass AI
                </span>
              </div>
              <p className="text-white/60 leading-relaxed mb-6 max-w-md">
                Empowering careers through AI-driven guidance, personalized learning paths, and voice-enabled interactions. Your future starts here.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyber-blue/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="sr-only">{social}</span>
                    <Globe className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2025 CareerCompass AI. All rights reserved. Made with ❤️ for ambitious professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}