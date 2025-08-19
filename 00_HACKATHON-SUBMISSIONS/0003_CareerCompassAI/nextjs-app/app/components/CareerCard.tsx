// /home/phoenix05/lin/ccAI/global-accelerator/demo-app-LEARNAI-TRACK/nextjs-app/app/components/CareerCard.tsx
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, TrendingUp, Zap, CheckCircle, PlusCircle } from 'lucide-react';
import { Career } from '../../types-definitions';
import { Button } from './ui/Button';

interface CareerCardProps {
  career: Career;
  onViewRoadmap: (id: string) => void;
  onSaveCareer: (id: string) => void;
  index: number;
  className?: string;
}

export default function CareerCard({ career, onViewRoadmap, onSaveCareer, index, className }: CareerCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}
      className={`glassmorphism border border-white/20 rounded-xl p-6 flex flex-col h-full ${className}`}
    >
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold text-white mb-2">{career.title}</h3>
          {career.trending && (
            <div className="flex items-center text-sm text-neon-pink">
              <Zap size={16} className="mr-1" />
              Trending
            </div>
          )}
        </div>
        <p className="text-white/70 text-sm mb-4 line-clamp-3">{career.description}</p>

        <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex flex-col items-center">
            <span className={`text-3xl font-bold ${getMatchColor(career.matchScore)}`}>
              {career.matchScore}%
            </span>
            <span className="text-xs text-white/60">Match Score</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-green-400">
              ₹{career.salaryRange.min/100000}L - ₹{career.salaryRange.max/100000}L
            </span>
            <span className="text-xs text-white/60">Salary (LPA)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-blue-400">
              {career.growthPotential.score}/100
            </span>
            <span className="text-xs text-white/60">Growth</span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center text-white/80">
            <Briefcase size={16} className="mr-3 text-cyber-blue" />
            <span>{career.requirements.experience}</span>
          </div>
          <div className="flex items-center text-white/80">
            <TrendingUp size={16} className="mr-3 text-cyber-blue" />
            <span>Next roles: {career.growthPotential.nextRoles.slice(0, 2).join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex space-x-3">
        <Button
          onClick={() => onSaveCareer(career.id)}
          variant="outline"
          className="w-full glassmorphism border-white/30"
        >
          <PlusCircle size={16} className="mr-2" /> Save
        </Button>
        <Button
          onClick={() => onViewRoadmap(career.id)}
          className="w-full bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80"
        >
          <CheckCircle size={16} className="mr-2" /> View Roadmap
        </Button>
      </div>
    </motion.div>
  );
}