'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import CareerCard from '../components/CareerCard';

import { 
  Filter, 
  Grid, 
  List, 
  Search, 
  SortAsc, 
  SortDesc,
  MapPin,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import { Career, CareerSearchFilters } from '../../types-definitions';

export default function CareerSuggestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [careers, setCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'growth'>('match');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CareerSearchFilters>({});

  useEffect(() => {
    loadCareerSuggestions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [careers, filters, sortBy, sortOrder, searchQuery]);

  const loadCareerSuggestions = async () => {
    try {
      setLoading(true);
      
      // Try to get cached suggestions first
      const cached = localStorage.getItem('careerSuggestions');
      if (cached) {
        const data = JSON.parse(cached);
        setCareers(data);
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      const response = await fetch('/api/career/suggestions');
      if (response.ok) {
        const data = await response.json();
        setCareers(data.careers || mockCareers);
      } else {
        // Use mock data as fallback
        setCareers(mockCareers);
      }
    } catch (error) {
      console.error('Error loading career suggestions:', error);
      setCareers(mockCareers);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...careers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(career =>
        career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.skills.some(skill => 
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply filters
    if (filters.salaryMin) {
      filtered = filtered.filter(career => career.salaryRange.min >= filters.salaryMin!);
    }
    if (filters.salaryMax) {
      filtered = filtered.filter(career => career.salaryRange.max <= filters.salaryMax!);
    }
    if (filters.remote !== undefined) {
      filtered = filtered.filter(career => career.remote === filters.remote);
    }
    if (filters.experience) {
      filtered = filtered.filter(career => 
        career.requirements.experience.toLowerCase().includes(filters.experience!)
      );
    }
    if (filters.location) {
      filtered = filtered.filter(career => 
        career.salaryRange.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'match':
          aValue = a.matchScore;
          bValue = b.matchScore;
          break;
        case 'salary':
          aValue = a.salaryRange.max;
          bValue = b.salaryRange.max;
          break;
        case 'growth':
          aValue = a.growthPotential.score;
          bValue = b.growthPotential.score;
          break;
        default:
          aValue = a.matchScore;
          bValue = b.matchScore;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredCareers(filtered);
  };

  const handleViewRoadmap = (careerId: string) => {
    router.push(`/roadmap/${careerId}`);
  };

  const handleSaveCareer = (careerId: string) => {
    // Add to saved careers in localStorage
    const savedCareers = JSON.parse(localStorage.getItem('savedCareers') || '[]');
    if (!savedCareers.includes(careerId)) {
      savedCareers.push(careerId);
      localStorage.setItem('savedCareers', JSON.stringify(savedCareers));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
                                      {/* <LoadingSpinner size="lg" /> */}<div>loading ...</div>
          <motion.p 
            className="text-white/70 mt-4 text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Analyzing your profile and generating career matches...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-electric-purple mb-4">
            Your Career Matches
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            We've analyzed your profile and found {filteredCareers.length} career opportunities that match your skills and interests.
          </p>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 glassmorphism border-white/20">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search careers, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-cyber-blue/50 focus:border-cyber-blue/50"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as typeof sortBy);
                    setSortOrder(order as typeof sortOrder);
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="match-desc">Best Match</option>
                  <option value="salary-desc">Highest Salary</option>
                  <option value="growth-desc">Best Growth</option>
                  <option value="match-asc">Lowest Match</option>
                </select>

                {/* View Mode */}
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-cyber-blue text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-cyber-blue text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Filters */}
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="glassmorphism border-white/30"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="text-white/70">
                Showing {filteredCareers.length} of {careers.length} careers
              </span>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white/60">90%+ Match</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-white/60">75%+ Match</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-white/60">60%+ Match</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="w-80 flex-shrink-0"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* <CareerFilter
                  filters={filters}
                  onFiltersChange={setFilters}
                  className="sticky top-4"
                /> */}<div>filter</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Career Grid */}
          <div className="flex-1">
            {filteredCareers.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-2">No careers found</h3>
                <p className="text-white/70 mb-6">
                  Try adjusting your filters or search terms to find more matches.
                </p>
                <Button
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                  className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80"
                >
                  Clear All Filters
                </Button>
              </motion.div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredCareers.map((career, index) => (
               
                  <CareerCard
                    key={career.id}
                    career={career}
                    onViewRoadmap={handleViewRoadmap}
                    onSaveCareer={handleSaveCareer}
                    index={index}
                    className={viewMode === 'list' ? 'lg:flex lg:items-center' : ''}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-center space-x-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/profile">
            <Button variant="outline" className="glassmorphism border-white/30">
              Refine Profile
            </Button>
          </Link>
          
          <Link href="/learn">
            <Button className="bg-gradient-to-r from-electric-purple to-neon-pink hover:from-electric-purple/80 hover:to-neon-pink/80">
              Explore Learning Hub
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Mock data for development
const mockCareers: Career[] = [
  {
    id: '1',
    title: 'Full Stack Developer',
    description: 'Build end-to-end web applications using modern technologies like React, Node.js, and cloud platforms. Work with cross-functional teams to deliver scalable solutions.',
    skills: [
      { name: 'JavaScript', type: 'technical', level: 'advanced', importance: 'critical' },
      { name: 'React', type: 'technical', level: 'advanced', importance: 'critical' },
      { name: 'Node.js', type: 'technical', level: 'intermediate', importance: 'high' },
      { name: 'Problem Solving', type: 'soft', level: 'advanced', importance: 'high' }
    ],
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
      nextRoles: ['Senior Developer', 'Tech Lead', 'Engineering Manager'],
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
      experience: '1-3 years in web development',
      certifications: [],
      softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
      technicalSkills: ['JavaScript', 'React', 'Node.js', 'Git']
    },
    matchScore: 92,
    trending: true,
    remote: true
  },
  {
    id: '2',
    title: 'Data Scientist',
    description: 'Analyze complex datasets to extract insights and build predictive models. Use Python, SQL, and machine learning techniques to solve business problems.',
    skills: [
      { name: 'Python', type: 'technical', level: 'advanced', importance: 'critical' },
      { name: 'SQL', type: 'technical', level: 'advanced', importance: 'critical' },
      { name: 'Machine Learning', type: 'technical', level: 'intermediate', importance: 'high' },
      { name: 'Statistics', type: 'domain', level: 'advanced', importance: 'critical' }
    ],
    salaryRange: {
      min: 800000,
      max: 2000000,
      currency: 'INR',
      period: 'yearly',
      location: 'Mumbai'
    },
    growthPotential: {
      score: 90,
      timeline: '3-4 years',
      nextRoles: ['Senior Data Scientist', 'ML Engineer', 'Data Science Manager'],
      marketDemand: 'very_high'
    },
    workEnvironment: {
      type: 'remote',
      teamSize: 'small',
      pace: 'moderate',
      travelRequired: false
    },
    requirements: {
      education: ['masters'],
      experience: '2-4 years in data analysis',
      certifications: ['Data Science Certification'],
      softSkills: ['Analytical Thinking', 'Communication'],
      technicalSkills: ['Python', 'SQL', 'Pandas', 'Scikit-learn']
    },
    matchScore: 88,
    trending: true,
    remote: true
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    description: 'Create intuitive and beautiful user interfaces for web and mobile applications. Conduct user research and design user-centered experiences.',
    skills: [
      { name: 'Figma', type: 'technical', level: 'advanced', importance: 'critical' },
      { name: 'User Research', type: 'domain', level: 'intermediate', importance: 'high' },
      { name: 'Prototyping', type: 'technical', level: 'advanced', importance: 'high' },
      { name: 'Creative Thinking', type: 'soft', level: 'advanced', importance: 'critical' }
    ],
    salaryRange: {
      min: 500000,
      max: 1200000,
      currency: 'INR',
      period: 'yearly',
      location: 'Delhi'
    },
    growthPotential: {
      score: 75,
      timeline: '2-3 years',
      nextRoles: ['Senior Designer', 'Design Lead', 'Product Designer'],
      marketDemand: 'high'
    },
    workEnvironment: {
      type: 'hybrid',
      teamSize: 'small',
      pace: 'moderate',
      travelRequired: false
    },
    requirements: {
      education: ['bachelors'],
      experience: '1-3 years in design',
      certifications: [],
      softSkills: ['Creativity', 'Communication', 'Empathy'],
      technicalSkills: ['Figma', 'Adobe Creative Suite', 'Prototyping']
    },
    matchScore: 78,
    trending: false,
    remote: true
  }
];