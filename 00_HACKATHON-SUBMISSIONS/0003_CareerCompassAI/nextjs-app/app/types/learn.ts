// src/types/learn.ts

import { FlashcardSet } from './career';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  question: QuizQuestion[];
}

export interface StudySession {
  id: string;
  topic: string;
  flashcardSets: FlashcardSet[];
  quizzes: Quiz[];
}
