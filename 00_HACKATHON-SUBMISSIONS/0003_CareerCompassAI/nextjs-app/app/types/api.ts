// src/types/api.ts

import { Career, CareerPath, FlashcardSet, Quiz } from './career';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type CareerSuggestionsResponse = ApiResponse<Career[]>;
export type CareerPathResponse = ApiResponse<CareerPath>;
export type FlashcardsResponse = ApiResponse<FlashcardSet>;
export type QuizResponse = ApiResponse<Quiz>;
