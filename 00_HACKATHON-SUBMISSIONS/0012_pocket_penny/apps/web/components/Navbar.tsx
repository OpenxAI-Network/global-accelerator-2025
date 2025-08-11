"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { fadeInDown, fadeInUp, hoverScale, staggerContainer } from "@/lib/animations";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Tracks", href: "#tracks" },
    { name: "About", href: "#about" },
    { name: "Reviews", href: "#testimonials" },
    { name: "Contact", href: "#newsletter" },
  ];

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
      className={`fixed left-0 right-0 top-0 z-50 border-gray-200 bg-white/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-lg backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div className="flex items-center" variants={staggerContainer}>
            <motion.a
              href="#home"
              className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-2xl font-bold text-transparent"
              variants={hoverScale}
            >
              Pocket Penny
            </motion.a>
          </motion.div>

          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600"
                variants={hoverScale}
                whileHover="hover"
              >
                {item.name}
              </motion.a>
            ))}
            <motion.button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              variants={hoverScale}
              whileHover="hover"
            >
              Get Started
            </motion.button>
          </div>

          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
              variants={hoverScale}
              whileHover="hover"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden ${isOpen ? "block" : "hidden"}`}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 1, height: "auto" },
            closed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};
