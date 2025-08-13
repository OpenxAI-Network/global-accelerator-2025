// src/types/user.ts

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  preferredField: string;
  language: 'en' | 'hi';
}

export interface UserProgress {
  flashcardsCompleted: number;
  quizzesCompleted: number;
  careerPathsViewed: number;
}
