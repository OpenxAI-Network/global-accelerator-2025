// src/types/career.ts

/** Flashcard type for LearnAI integration */
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'intermediate';
  tags: string[];
  createdAt: Date;
  reviewCount: number;
  correctCount: number;
}

/** Collection of flashcards */
export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  cards: Flashcard[];
  createdAt: string;
}

/** Career suggestion card type */
export interface Career {
  id: string;
  title: string;
  description: string;
  skills: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    period: string;
    location: string;
  };
  growthPotential: {
    score: number;
    timeline: string;
    nextRoles: string[];
    marketDemand: string;
  };
  workEnvironment: {
    type: string;
    teamSize: string;
    pace: string;
    travelRequired: boolean;
  };
  requirements: {
    education: string[];
    experience: string;
    certifications: string[];
    softSkills: string[];
    technicalSkills: string[];
  };
  matchScore: number;
  trending: boolean;
  remote: boolean;
}

/** Roadmap step */
export interface CareerStep {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  resources: {
    id: string;
    title: string;
    type: string;
    url: string;
    provider: string;
    rating: number;
    cost: string;
  }[];
  completed: boolean;
  order: number;
}

/** Complete generated career path */
export interface CareerPath {
  id: string;
  title: string;
  steps: CareerStep[];
}

/** Learning path for a career */
export interface LearningPath {
  id: string;
  careerId: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  steps: CareerStep[];
  resources: any[];
  prerequisites: string[];
}
