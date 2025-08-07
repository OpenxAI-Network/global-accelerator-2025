// TypeScript interfaces and types for the Career Assistant Platform

// User-related types
export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: 'en' | 'hi';
  voiceEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}

export interface UserProfile {
  skills: string[];
  interests: string[];
  experience: ExperienceLevel;
  education: EducationLevel;
  workStyle: WorkStyle;
  location: string;
  availability: AvailabilityType;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type EducationLevel = 'high_school' | 'bachelors' | 'masters' | 'phd' | 'professional';
export type WorkStyle = 'individual' | 'team' | 'hybrid';
export type AvailabilityType = 'full_time' | 'part_time' | 'freelance' | 'contract';

// Career-related types
export interface Career {
  id: string;
  title: string;
  description: string;
  skills: Skill[];
  salaryRange: SalaryRange;
  growthPotential: GrowthPotential;
  workEnvironment: WorkEnvironment;
  requirements: Requirements;
  matchScore: number;
  trending: boolean;
  remote: boolean;
}

export interface Skill {
  name: string;
  type: 'technical' | 'soft' | 'domain';
  level: SkillLevel;
  importance: ImportanceLevel;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hourly' | 'monthly' | 'yearly';
  location: string;
}

export interface GrowthPotential {
  score: number;
  timeline: string;
  nextRoles: string[];
  marketDemand: 'low' | 'medium' | 'high' | 'very_high';
}

export interface WorkEnvironment {
  type: 'office' | 'remote' | 'hybrid' | 'field';
  teamSize: 'solo' | 'small' | 'medium' | 'large';
  pace: 'relaxed' | 'moderate' | 'fast' | 'intense';
  travelRequired: boolean;
}

export interface Requirements {
  education: EducationLevel[];
  experience: string;
  certifications: string[];
  softSkills: string[];
  technicalSkills: string[];
}

// Learning and Roadmap types (inspired by LearnAI)
export interface LearningPath {
  id: string;
  careerId: string;
  title: string;
  description: string;
  duration: string;
  difficulty: DifficultyLevel;
  steps: LearningStep[];
  resources: Resource[];
  prerequisites: string[];
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: StepType;
  duration: string;
  resources: Resource[];
  completed: boolean;
  order: number;
}

export type StepType = 'learn' | 'practice' | 'project' | 'assessment' | 'certification';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  provider: string;
  rating: number;
  duration?: string;
  cost: 'free' | 'paid' | 'freemium';
}

export type ResourceType = 'course' | 'video' | 'article' | 'book' | 'tool' | 'practice' | 'certification';

// Flashcard types (from LearnAI)
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: DifficultyLevel;
  tags: string[];
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  correctCount: number;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  category: string;
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz types (from LearnAI)
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  category: string;
  difficulty: DifficultyLevel;
  timeLimit?: number;
  passingScore: number;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
  points: number;
}

export type QuestionType = 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer';

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers: UserAnswer[];
  completedAt: Date;
  timeSpent: number;
}

export interface UserAnswer {
  questionId: string;
  userAnswer: number | number[] | string;
  isCorrect: boolean;
  pointsEarned: number;
}

// AI and Voice types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'image';
  metadata?: Record<string, any>;
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  voice: string;
  speed: number;
  pitch: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Assessment types
export interface CareerAssessment {
  id: string;
  userId: string;
  type: AssessmentType;
  questions: AssessmentQuestion[];
  results: AssessmentResult;
  completedAt: Date;
  version: string;
}

export type AssessmentType = 'personality' | 'skills' | 'interests' | 'values' | 'comprehensive';

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'rating' | 'choice' | 'ranking' | 'text';
  options?: string[];
  required: boolean;
  category: string;
}

export interface AssessmentResult {
  scores: Record<string, number>;
  traits: string[];
  recommendations: string[];
  careerMatches: Career[];
  learningPaths: LearningPath[];
  confidence: number;
}

// Feedback types
export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  content: string;
  rating: number;
  category: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  resolved: boolean;
}

export type FeedbackType = 'bug_report' | 'feature_request' | 'general' | 'career_advice' | 'platform_feedback';

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form types
export interface ProfileFormData {
  name: string;
  email: string;
  skills: string[];
  interests: string[];
  experience: ExperienceLevel;
  education: EducationLevel;
  workStyle: WorkStyle;
  location: string;
  availability: AvailabilityType;
  preferences: UserPreferences;
}

export interface CareerSearchFilters {
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  experience?: ExperienceLevel;
  remote?: boolean;
  location?: string;
  industry?: string;
  workStyle?: WorkStyle;
  growthPotential?: number;
}

// Animation and UI types
export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
  repeat?: number;
  yoyo?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: 'voice_data' | 'chat_message' | 'system_update' | 'error';
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface VoiceMessage extends WebSocketMessage {
  type: 'voice_data';
  data: {
    audioData: Blob;
    transcript?: string;
    confidence?: number;
  };
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Constants
export const SKILL_CATEGORIES = [
  'Programming',
  'Design',
  'Marketing',
  'Sales',
  'Management',
  'Analytics',
  'Communication',
  'Leadership',
  'Technical Writing',
  'Project Management'
] as const;

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Media',
  'Government',
  'Non-profit',
  'Consulting'
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];
export type Industry = typeof INDUSTRIES[number];