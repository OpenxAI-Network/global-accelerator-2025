// src/types/career.ts

/** Flashcard type for LearnAI integration */
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic?: string;
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
  match: number; // 0-100
  avgSalary: string;
  growth?: string;
  remote?: boolean;
  skills?: string[];
}

/** Roadmap step */
export interface CareerStep {
  id: string;
  title: string;
  description: string;
  resources?: { title: string; url: string; rating?: number }[];
}

/** Complete generated career path */
export interface CareerPath {
  id: string;
  title: string;
  steps: CareerStep[];
}
