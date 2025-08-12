'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import TimelineComponent from '@/components/timeline-component';
// import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft,
  Download,
  Share2,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Users,
  Play,
  CheckCircle,
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';
import { LearningPath, Career } from '@/types/career';

export default function RoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const careerId = params.id as string;
  
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    loadRoadmapData();
  }, [careerId]);

  const loadRoadmapData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API
      const response = await fetch(`/api/career/roadmap/${careerId}`);
      if (response.ok) {
        const data = await response.json();
        setLearningPath(data.learningPath);
        setCareer(data.career);
      } else {
        // Use mock data as fallback
        const mockData = getMockRoadmapData(careerId);
        setLearningPath(mockData.learningPath);
        setCareer(mockData.career);
      }
      
      // Load completed steps from localStorage
      const completed = JSON.parse(localStorage.getItem(`roadmap_${careerId}_completed`) || '[]');
      setCompletedSteps(completed);
      
    } catch (error) {
      console.error('Error loading roadmap:', error);
      const mockData = getMockRoadmapData(careerId);
      setLearningPath(mockData.learningPath);
      setCareer(mockData.career);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepId: string) => {
    const updated = [...completedSteps, stepId];
    setCompletedSteps(updated);
    localStorage.setItem(`roadmap_${careerId}_completed`, JSON.stringify(updated));
    
    // Update the learning path
    if (learningPath) {
      const updatedPath = {
        ...learningPath,
        steps: learningPath.steps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        )
      };
      setLearningPath(updatedPath);
    }
  };

  const handleResourceClick = (resourceUrl: string) => {
    window.open(resourceUrl, '_blank');
  };

  const handleVoiceSummary = () => {
    if (!learningPath) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `Your learning path for ${learningPath.title}. This is a ${learningPath.difficulty} level path that takes approximately ${learningPath.duration} to complete. You have ${learningPath.steps.length} steps in total. ${learningPath.steps.filter(s => s.completed).length} steps are already completed.`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/roadmap/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId, learningPath })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${learningPath?.title || 'Roadmap'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleSharePlan = async () => {
    if (navigator.share && learningPath) {
      try {
        await navigator.share({
          title: learningPath.title,
          text: learningPath.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          {/* <LoadingSpinner size="lg" /> */} <div>loading ...</div>
          <motion.p 
            className="text-white/70 mt-4 text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Generating your personalized learning roadmap...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!learningPath || !career) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-4">Roadmap Not Found</h2>
          <p className="text-white/70 mb-8">The requested learning path could not be found.</p>
          <Link href="/career-suggestions">
            <Button className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80">
              Back to Career Suggestions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = (learningPath.steps.filter(s => s.completed).length / learningPath.steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Link href="/career-suggestions">
              <Button variant="ghost" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Careers
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleVoiceSummary}
                variant="outline"
                className="glassmorphism border-white/30"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                {isSpeaking ? 'Stop Summary' : 'Voice Summary'}
              </Button>

              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="glassmorphism border-white/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>

              <Button
                onClick={handleSharePlan}
                variant="outline"
                className="glassmorphism border-white/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Plan
              </Button>
            </div>
          </div>

          {/* Career Info */}
          <Card className="p-6 glassmorphism border-white/20 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple">
                    {career.title} Learning Path
                  </h1>
                  {career.trending && (
                    <span className="bg-gradient-to-r from-neon-pink to-electric-purple text-white text-xs px-2 py-1 rounded-full">
                      Trending
                    </span>
                  )}
                </div>
                <p className="text-white/70 leading-relaxed mb-4">{career.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-cyber-blue" />
                    <span className="text-white/70">Duration: {learningPath.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-electric-purple" />
                    <span className="text-white/70">Level: {learningPath.difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-matrix-green" />
                    <span className="text-white/70">Salary: ₹{(career.salaryRange.max / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-neon-pink" />
                    <span className="text-white/70">Match: {career.matchScore}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex-shrink-0 ml-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <motion.path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${progressPercentage} 100` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00f5ff" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Timeline Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <TimelineComponent
            learningPath={learningPath}
            onStepComplete={handleStepComplete}
            onResourceClick={handleResourceClick}
          />
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-6 glassmorphism border-white/20 inline-block">
            <h3 className="text-xl font-bold text-white mb-4">Ready to Start Your Journey?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/learn/flashcards">
                <Button className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Study with Flashcards
                </Button>
              </Link>
              
              <Link href="/learn/quiz">
                <Button variant="outline" className="glassmorphism border-white/30">
                  <Award className="w-4 h-4 mr-2" />
                  Take Practice Quiz
                </Button>
              </Link>

              <Link href="/feedback">
                <Button variant="outline" className="glassmorphism border-white/30">
                  <Star className="w-4 h-4 mr-2" />
                  Share Feedback
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Mock data function
function getMockRoadmapData(careerId: string) {
  const mockLearningPaths: Record<string, { learningPath: LearningPath; career: Career }> = {
    '1': {
      learningPath: {
        id: 'path_1',
        careerId: '1',
        title: 'Full Stack Developer Mastery',
        description: 'Complete roadmap to become a professional full-stack developer with modern technologies.',
        duration: '6-8 months',
        difficulty: 'intermediate',
        steps: [
          {
            id: 'step_1',
            title: 'Frontend Fundamentals',
            description: 'Master HTML, CSS, and JavaScript basics',
            type: 'learn',
            duration: '4 weeks',
            resources: [
              {
                id: 'res_1',
                title: 'MDN Web Docs',
                type: 'article',
                url: 'https://developer.mozilla.org',
                provider: 'Mozilla',
                rating: 4.8,
                cost: 'free'
              },
              {
                id: 'res_2',
                title: 'JavaScript30',
                type: 'course',
                url: 'https://javascript30.com',
                provider: 'Wes Bos',
                rating: 4.9,
                cost: 'free'
              }
            ],
            completed: false,
            order: 1
          },
          {
            id: 'step_2',
            title: 'React Development',
            description: 'Learn React.js for building dynamic user interfaces',
            type: 'learn',
            duration: '6 weeks',
            resources: [
              {
                id: 'res_3',
                title: 'React Documentation',
                type: 'article',
                url: 'https://react.dev',
                provider: 'Meta',
                rating: 4.7,
                cost: 'free'
              }
            ],
            completed: false,
            order: 2
          },
          {
            id: 'step_3',
            title: 'Backend with Node.js',
            description: 'Build server-side applications with Node.js and Express',
            type: 'learn',
            duration: '6 weeks',
            resources: [],
            completed: false,
            order: 3
          },
          {
            id: 'step_4',
            title: 'Database Management',
            description: 'Learn MongoDB and SQL databases',
            type: 'learn',
            duration: '4 weeks',
            resources: [],
            completed: false,
            order: 4
          },
          {
            id: 'step_5',
            title: 'Full Stack Project',
            description: 'Build a complete web application from scratch',
            type: 'project',
            duration: '8 weeks',
            resources: [],
            completed: false,
            order: 5
          }
        ],
        resources: [],
        prerequisites: ['Basic programming knowledge']
      },
      career: {
        id: '1',
        title: 'Full Stack Developer',
        description: 'Build end-to-end web applications using modern technologies.',
        skills: [],
        salaryRange: {
          min: 600000,
          max: 1500000,
          currency: 'INR',
          period: 'yearly',
          location: 'Bangalore'
        },
        growthPotential: {
          score: 85,
          timeline: '2-3 years',
          nextRoles: ['Senior Developer', 'Tech Lead'],
          marketDemand: 'very_high'
        },
        workEnvironment: {
          type: 'hybrid',
          teamSize: 'medium',
          pace: 'fast',
          travelRequired: false
        },
        requirements: {
          education: ['bachelors'],
          experience: '1-3 years',
          certifications: [],
          softSkills: [],
          technicalSkills: []
        },
        matchScore: 92,
        trending: true,
        remote: true
      }
    }
  };

  return mockLearningPaths[careerId] || mockLearningPaths['1'];
}