'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import VoiceRecorder from '@/components/features/VoiceRecorder';
import AIAvatar from '@/components/features/AIAvatar';
import ProfileForm from '@/components/features/ProfileForm';
import { 
  User, 
  Mic, 
  MicOff, 
  Languages, 
  ArrowRight, 
  Sparkles,
  Brain,
  Globe,
  Settings
} from 'lucide-react';
import { UserProfile, UserPreferences } from '@/types/user';

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isListening, setIsListening] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    skills: [],
    interests: [],
    experience: 'beginner',
    education: 'bachelors',
    workStyle: 'hybrid',
    location: '',
    availability: 'full_time'
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    voiceEnabled: false,
    theme: 'dark',
    notifications: true
  });

  const totalSteps = 4;

  const handleVoiceTranscript = (transcript: string, confidence: number) => {
    console.log('Voice transcript:', transcript, 'Confidence:', confidence);
    // Process voice input based on current step
    processVoiceInput(transcript);
  };

  const processVoiceInput = (transcript: string) => {
    // Simple voice processing logic
    const lowerTranscript = transcript.toLowerCase();
    
    if (step === 1) {
      // Extract skills from voice
      const skillKeywords = ['javascript', 'python', 'react', 'node', 'design', 'marketing', 'sales'];
      const foundSkills = skillKeywords.filter(skill => 
        lowerTranscript.includes(skill)
      );
      
      if (foundSkills.length > 0) {
        setProfile(prev => ({
          ...prev,
          skills: [...new Set([...prev.skills || [], ...foundSkills])]
        }));
      }
    } else if (step === 2) {
      // Extract interests from voice
      const interestKeywords = ['technology', 'healthcare', 'finance', 'education', 'creative'];
      const foundInterests = interestKeywords.filter(interest => 
        lowerTranscript.includes(interest)
      );
      
      if (foundInterests.length > 0) {
        setProfile(prev => ({
          ...prev,
          interests: [...new Set([...prev.interests || [], ...foundInterests])]
        }));
      }
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Generate career path and navigate to suggestions
      generateCareerPath();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generateCareerPath = async () => {
    try {
      const response = await fetch('/api/generate-career-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          preferences,
          language
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store the generated data and navigate
        localStorage.setItem('careerSuggestions', JSON.stringify(data.suggestions));
        router.push('/career-suggestions');
      }
    } catch (error) {
      console.error('Error generating career path:', error);
    }
  };

  const stepProgress = (step / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SkillsStep profile={profile} setProfile={setProfile} voiceEnabled={voiceEnabled} />;
      case 2:
        return <InterestsStep profile={profile} setProfile={setProfile} voiceEnabled={voiceEnabled} />;
      case 3:
        return <ExperienceStep profile={profile} setProfile={setProfile} />;
      case 4:
        return <PreferencesStep profile={profile} setProfile={setProfile} />;
      default:
        return null;
    }
  };

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
            Let's Build Your Profile
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Help us understand your skills, interests, and goals so we can provide personalized career recommendations.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-white/60">Step {step} of {totalSteps}</span>
            <span className="text-sm text-white/60">{Math.round(stepProgress)}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-cyber-blue to-electric-purple h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stepProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Avatar Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 glassmorphism border-white/20 h-fit sticky top-8">
              <div className="text-center mb-6">
                <AIAvatar 
                  isListening={isListening}
                  language={language}
                  className="mb-4"
                />
                <h3 className="text-xl font-bold text-white mb-2">Career Assistant</h3>
                <p className="text-white/70 text-sm">
                  {language === 'hi' 
                    ? 'मैं आपकी करियर यात्रा में मदद करूंगा' 
                    : 'I\'m here to help guide your career journey'
                  }
                </p>
              </div>

              {/* Voice Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-cyber-blue" />
                    <span className="text-sm text-white/80">Voice Input</span>
                  </div>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      voiceEnabled ? 'bg-cyber-blue' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Languages className="w-4 h-4 text-electric-purple" />
                    <span className="text-sm text-white/80">Language</span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                  </select>
                </div>

                {voiceEnabled && (
                  <VoiceRecorder
                    onTranscript={handleVoiceTranscript}
                    language={language === 'hi' ? 'hi-IN' : 'en-US'}
                    className="mt-4"
                  />
                )}
              </div>
            </Card>
          </motion.div>

          {/* Form Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-8 glassmorphism border-white/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={handleBack}
                  disabled={step === 1}
                  variant="outline"
                  className="glassmorphism border-white/30"
                >
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cyber-blue to-electric-purple hover:from-cyber-blue/80 hover:to-electric-purple/80"
                >
                  <div className="flex items-center space-x-2">
                    <span>{step === totalSteps ? 'Generate Career Path' : 'Next'}</span>
                    {step === totalSteps ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </div>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Step Components
const SkillsStep = ({ profile, setProfile, voiceEnabled }: any) => {
  const [skillInput, setSkillInput] = useState('');
  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Java',
    'Marketing', 'Sales', 'Design', 'Leadership', 'Communication',
    'Project Management', 'Data Analysis', 'Excel', 'PowerPoint'
  ];

  const addSkill = (skill: string) => {
    if (skill && !profile.skills?.includes(skill)) {
      setProfile((prev: any) => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((prev: any) => ({
      ...prev,
      skills: prev.skills?.filter((s: string) => s !== skill) || []
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">What are your skills?</h2>
        <p className="text-white/70">
          {voiceEnabled 
            ? 'Tell us about your skills using voice or select from the options below.'
            : 'Add your key skills that you want to use in your career.'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Type a skill and press Enter"
            onKeyPress={(e) => e.key === 'Enter' && addSkill(skillInput)}
            className="flex-1"
          />
          <Button onClick={() => addSkill(skillInput)}>Add</Button>
        </div>

        {/* Selected Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <motion.span
                key={skill}
                className="bg-cyber-blue/20 text-cyber-blue px-3 py-1 rounded-full text-sm flex items-center space-x-2 border border-cyber-blue/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-cyber-blue hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {/* Popular Skills */}
        <div>
          <p className="text-white/60 text-sm mb-3">Popular skills:</p>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                disabled={profile.skills?.includes(skill)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  profile.skills?.includes(skill)
                    ? 'bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed'
                    : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:border-white/40'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InterestsStep = ({ profile, setProfile, voiceEnabled }: any) => {
  const interests = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Design', 'Sales', 'Consulting', 'Startups', 'Enterprise',
    'Remote Work', 'Travel', 'Innovation', 'Leadership', 'Entrepreneurship'
  ];

  const toggleInterest = (interest: string) => {
    const currentInterests = profile.interests || [];
    if (currentInterests.includes(interest)) {
      setProfile((prev: any) => ({
        ...prev,
        interests: currentInterests.filter((i: string) => i !== interest)
      }));
    } else {
      setProfile((prev: any) => ({
        ...prev,
        interests: [...currentInterests, interest]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">What interests you?</h2>
        <p className="text-white/70">
          Select the areas and industries that excite you most. This helps us match you with the right opportunities.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {interests.map((interest) => (
          <motion.button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`p-4 rounded-lg border transition-all text-left ${
              profile.interests?.includes(interest)
                ? 'bg-electric-purple/20 border-electric-purple text-electric-purple'
                : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium">{interest}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const ExperienceStep = ({ profile, setProfile }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Tell us about your background</h2>
        <p className="text-white/70">
          This information helps us recommend appropriate career levels and opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/80 mb-3 font-medium">Experience Level</label>
          <div className="space-y-2">
            {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
              <button
                key={level}
                onClick={() => setProfile((prev: any) => ({ ...prev, experience: level }))}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  profile.experience === level
                    ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="font-medium capitalize">{level}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 mb-3 font-medium">Education</label>
          <div className="space-y-2">
            {[
              { value: 'high_school', label: 'High School' },
              { value: 'bachelors', label: 'Bachelor\'s Degree' },
              { value: 'masters', label: 'Master\'s Degree' },
              { value: 'phd', label: 'PhD' },
              { value: 'professional', label: 'Professional Certification' }
            ].map((edu) => (
              <button
                key={edu.value}
                onClick={() => setProfile((prev: any) => ({ ...prev, education: edu.value }))}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  profile.education === edu.value
                    ? 'bg-electric-purple/20 border-electric-purple text-electric-purple'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{edu.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-white/80 mb-3 font-medium">Preferred Location</label>
        <Input
          value={profile.location || ''}
          onChange={(e) => setProfile((prev: any) => ({ ...prev, location: e.target.value }))}
          placeholder="e.g., Mumbai, Bangalore, Remote"
          className="w-full"
        />
      </div>
    </div>
  );
};

const PreferencesStep = ({ profile, setProfile }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Work Preferences</h2>
        <p className="text-white/70">
          Let us know your preferred working style and availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/80 mb-3 font-medium">Work Style</label>
          <div className="space-y-2">
            {[
              { value: 'individual', label: 'Individual Work' },
              { value: 'team', label: 'Team Collaboration' },
              { value: 'hybrid', label: 'Mix of Both' }
            ].map((style) => (
              <button
                key={style.value}
                onClick={() => setProfile((prev: any) => ({ ...prev, workStyle: style.value }))}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  profile.workStyle === style.value
                    ? 'bg-neon-pink/20 border-neon-pink text-neon-pink'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 mb-3 font-medium">Availability</label>
          <div className="space-y-2">
            {[
              { value: 'full_time', label: 'Full-time' },
              { value: 'part_time', label: 'Part-time' },
              { value: 'freelance', label: 'Freelance' },
              { value: 'contract', label: 'Contract' }
            ].map((avail) => (
              <button
                key={avail.value}
                onClick={() => setProfile((prev: any) => ({ ...prev, availability: avail.value }))}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  profile.availability === avail.value
                    ? 'bg-matrix-green/20 border-matrix-green text-matrix-green'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="font-medium">{avail.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};