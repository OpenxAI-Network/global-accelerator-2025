'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Career, SalaryRange } from '../../types/career';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star,
  Briefcase,
  GraduationCap,
  Home,
  Building
} from 'lucide-react';

interface CareerCardProps {
  career: Career;
  onViewRoadmap: (careerId: string) => void;
  onSaveCareer?: (careerId: string) => void;
  index: number;
  className?: string;
}

const CareerCard: React.FC<CareerCardProps> = ({
  career,
  onViewRoadmap,
  onSaveCareer,
  index,
  className = ''
}) => {
  const formatSalary = (salaryRange: SalaryRange): string => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: salaryRange.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const min = formatter.format(salaryRange.min);
    const max = formatter.format(salaryRange.max);
    return `${min} - ${max} ${salaryRange.period === 'yearly' ? '/year' : '/month'}`;
  };

  const getMatchScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getGrowthColor = (demand: string): string => {
    switch (demand) {
      case 'very_high': return 'text-green-400';
      case 'high': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getWorkEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'remote': return <Home className="w-4 h-4" />;
      case 'office': return <Building className="w-4 h-4" />;
      case 'hybrid': return <Briefcase className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      className={`career-card ${className}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="relative overflow-hidden group glassmorphism border-white/20 hover:border-cyber-blue/50 transition-all duration-300">
        {/* Trending Badge */}
        {career.trending && (
          <motion.div 
            className="absolute top-4 right-4 z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
          >
            <div className="bg-gradient-to-r from-neon-pink to-electric-purple text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </div>
          </motion.div>
        )}

        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-cyber-blue transition-colors duration-300">
                {career.title}
              </h3>
              <motion.div 
                className={`text-lg font-bold ${getMatchScoreColor(career.matchScore)}`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                {career.matchScore}%
              </motion.div>
            </div>
            
            <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
              {career.description}
            </p>
          </div>

          {/* Skills Showcase */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Key Skills</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {career.skills.slice(0, 4).map((skill, skillIndex) => (
                <motion.span
                  key={skill.name}
                  className={`text-xs px-2 py-1 rounded-full ${
                    skill.importance === 'critical' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : skill.importance === 'high'
                      ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30'
                      : 'bg-white/10 text-white/70 border border-white/20'
                  }`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + skillIndex * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {skill.name}
                </motion.span>
              ))}
              {career.skills.length > 4 && (
                <span className="text-xs text-white/50 px-2 py-1">
                  +{career.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Salary */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-white/60">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Salary Range</span>
              </div>
              <div className="text-white text-sm font-medium">
                {formatSalary(career.salaryRange)}
              </div>
            </div>

            {/* Growth Potential */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-white/60">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Growth</span>
              </div>
              <div className={`text-sm font-medium ${getGrowthColor(career.growthPotential.marketDemand)}`}>
                {career.growthPotential.marketDemand.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            {/* Work Environment */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-white/60">
                {getWorkEnvironmentIcon(career.workEnvironment.type)}
                <span className="text-xs">Work Style</span>
              </div>
              <div className="text-white text-sm font-medium capitalize">
                {career.workEnvironment.type}
              </div>
            </div>

            {/* Team Size */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-white/60">
                <Users className="w-4 h-4" />
                <span className="text-xs">Team Size</span>
              </div>
              <div className="text-white text-sm font-medium capitalize">
                {career.workEnvironment.teamSize} team
              </div>
            </div>
          </div>

          {/* Requirements Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80">Experience Required</h4>
            <p className="text-xs text-white/60">{career.requirements.experience}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => onViewRoadmap(career.id)}
                className="w-full bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80 text-white font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>View Roadmap</span>
                </div>
              </Button>
            </motion.div>
            
            {onSaveCareer && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onSaveCareer(career.id)}
                  variant="outline"
                  className="glassmorphism border-white/30 hover:border-cyber-blue/50"
                >
                  <Star className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Remote Work Badge */}
          {career.remote && (
            <motion.div
              className="absolute bottom-4 right-4 bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              Remote OK
            </motion.div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyber-blue/10 to-electric-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={false}
        />

        {/* Skill Meter Bars */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
};

export default CareerCard;