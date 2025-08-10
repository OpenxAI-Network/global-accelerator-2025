'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { supabase } from '@/lib/supabase';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: false });
      
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Unlock badges and earn rewards as you learn</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: achievement.badge_color }}
                >
                  {achievement.icon || '🏆'}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{achievement.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    achievement.rarity === 'common' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    achievement.rarity === 'uncommon' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    +{achievement.points_reward} points
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}