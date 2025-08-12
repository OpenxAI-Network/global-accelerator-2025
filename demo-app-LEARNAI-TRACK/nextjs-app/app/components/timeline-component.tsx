'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LearningPath, LearningStep } from '../../types/career';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Video, 
  FileText, 
  Award,
  Play,
  ExternalLink,
  Star
} from 'lucide-react';

interface TimelineComponentProps {
  learningPath: LearningPath;
  onStepComplete?: (stepId: string) => void;
  onResourceClick?: (resourceUrl: string) => void;
  className?: string;
}

const TimelineComponent: React.FC<TimelineComponentProps> = ({
  learningPath,
  onStepComplete,
  onResourceClick,
  className = ''
}) => {
  const getStepIcon = (type: string, completed: boolean) => {
    const iconClass = `w-6 h-6 ${completed ? 'text-green-400' : 'text-white/60'}`;
    
    switch (type) {
      case 'learn':
        return <BookOpen className={iconClass} />;
      case 'practice':
        return <Play className={iconClass} />;
      case 'project':
        return <FileText className={iconClass} />;
      case 'assessment':
        return <Award className={iconClass} />;
      case 'certification':
        return <Star className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  const getResourceIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    
    switch (type) {
      case 'video':
        return <Video className={iconClass} />;
      case 'course':
        return <BookOpen className={iconClass} />;
      case 'article':
        return <FileText className={iconClass} />;
      case 'certification':
        return <Award className={iconClass} />;
      default:
        return <ExternalLink className={iconClass} />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  const completedSteps = learningPath.steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / learningPath.steps.length) * 100;

  return (
    <motion.div
      className={`timeline-component ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple">
            {learningPath.title}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            {learningPath.description}
          </p>
          
          {/* Path Stats */}
          <div className="flex justify-center items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyber-blue" />
              <span className="text-white/70">{learningPath.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-electric-purple" />
              <span className={getDifficultyColor(learningPath.difficulty)}>
                {learningPath.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white/70">
                {completedSteps}/{learningPath.steps.length} completed
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-cyber-blue to-electric-purple h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Timeline Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyber-blue via-electric-purple to-neon-pink" />

          <div className="space-y-8">
            {learningPath.steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="relative flex items-start space-x-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {/* Step Icon */}
                <motion.div
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 ${
                    step.completed
                      ? 'bg-green-500/20 border-green-400'
                      : 'bg-white/10 border-white/30'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    getStepIcon(step.type, step.completed)
                  )}
                </motion.div>

                {/* Step Content */}
                <motion.div
                  className="flex-1 pb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Card className={`p-6 glassmorphism ${
                    step.completed 
                      ? 'border-green-400/30 bg-green-500/5' 
                      : 'border-white/20'
                  }`}>
                    <div className="space-y-4">
                      {/* Step Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white">
                            {step.title}
                          </h3>
                          <p className="text-white/70 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <Clock className="w-4 h-4" />
                          <span>{step.duration}</span>
                        </div>
                      </div>

                      {/* Step Resources */}
                      {step.resources.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white/80 flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>Resources</span>
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {step.resources.map((resource) => (
                              <motion.div
                                key={resource.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                                onClick={() => onResourceClick?.(resource.url)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center space-x-3">
                                  {getResourceIcon(resource.type)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                      {resource.title}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-white/60">
                                      <span>{resource.provider}</span>
                                      {resource.rating && (
                                        <div className="flex items-center space-x-1">
                                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                          <span>{resource.rating}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    resource.cost === 'free'
                                      ? 'bg-green-500/20 text-green-300'
                                      : resource.cost === 'paid'
                                      ? 'bg-red-500/20 text-red-300'
                                      : 'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {resource.cost}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-white/40" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-white/60">
                          Step {step.order} of {learningPath.steps.length}
                        </div>
                        {!step.completed && onStepComplete && (
                          <Button
                            onClick={() => onStepComplete(step.id)}
                            size="sm"
                            className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80"
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-center space-x-4 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="outline"
            className="glassmorphism border-white/30"
          >
            Save Progress
          </Button>
          <Button
            className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80"
          >
            Export Roadmap
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimelineComponent;