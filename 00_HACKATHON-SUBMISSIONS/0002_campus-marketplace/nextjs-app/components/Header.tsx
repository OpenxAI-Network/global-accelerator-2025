"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Settings, LogOut, User, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "./auth-context";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onListNewItem: () => void;
  onEditProfile: () => void;
}

export function Header({ onListNewItem, onEditProfile }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <GraduationCap className="h-7 w-7 text-text-primary group-hover:text-primary-accent transition-colors" />
            <h1 className="text-xl font-bold text-text-primary hidden sm:block group-hover:text-primary-accent transition-colors">
              Campus Marketplace
            </h1>
          </Link>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onListNewItem} 
              className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>List an Item</span>
            </button>
            
            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-surface transition-colors">
                <User className="w-5 h-5 text-text-secondary group-hover:text-text-primary" />
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute top-full right-0 mt-3 w-56 card p-2"
                  >
                    <div className="p-2 border-b border-border">
                      <p className="font-semibold truncate">{user?.name}</p>
                      <p className="text-sm text-text-secondary truncate">{user?.email}</p>
                    </div>
                    <div className="p-1 mt-1">
                      <button onClick={() => { onEditProfile(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-3 py-2 text-sm rounded-md hover:bg-surface transition-colors">
                        <Settings className="w-4 h-4 mr-2" />
                        Profile Settings
                      </button>
                      <button onClick={logout} className="w-full text-left flex items-center px-3 py-2 text-sm rounded-md text-error hover:bg-error/10 transition-colors">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}