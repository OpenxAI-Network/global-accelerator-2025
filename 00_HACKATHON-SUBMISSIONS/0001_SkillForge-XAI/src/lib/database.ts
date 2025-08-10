import { supabase } from './supabase';
import type { 
  Course, 
  Lesson, 
  Quiz, 
  QuizQuestion, 
  Enrollment, 
  LessonProgress, 
  QuizAttempt,
  Achievement,
  UserAchievement,
  Category,
  User,
  AIChatSession,
  AIChatMessage,
  LearningAnalytics
} from '@/types';

// User Management
export async function createUserProfile(userData: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (error) throw error;
  return data as Category[];
}

// Courses
export async function getCourses(categoryId?: string, limit?: number) {
  let query = supabase
    .from('courses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Course[];
}

export async function getCourse(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(*),
      lessons:lessons(*)
    `)
    .eq('id', courseId)
    .eq('is_published', true)
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function getPopularCourses(limit = 6) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_published', true)
    .order('total_enrollments', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as Course[];
}

// Lessons
export async function getCourseLessons(courseId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order');
  
  if (error) throw error;
  return data as Lesson[];
}

export async function getLesson(lessonId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('id', lessonId)
    .single();
  
  if (error) throw error;
  return data as Lesson;
}

// Enrollments
export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([{
      user_id: userId,
      course_id: courseId,
      enrollment_date: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Enrollment;
}

export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('user_id', userId)
    .order('enrollment_date', { ascending: false });
  
  if (error) throw error;
  return data as Enrollment[];
}

export async function getEnrollment(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  
  if (error) return null;
  return data as Enrollment;
}

export async function updateEnrollmentProgress(enrollmentId: string, progress: number) {
  const { data, error } = await supabase
    .from('enrollments')
    .update({ 
      progress_percentage: progress,
      is_completed: progress >= 100,
      completion_date: progress >= 100 ? new Date().toISOString() : null
    })
    .eq('id', enrollmentId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Enrollment;
}

// Lesson Progress
export async function updateLessonProgress(
  userId: string, 
  lessonId: string, 
  enrollmentId: string, 
  progress: number,
  timeSpent: number = 0
) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      enrollment_id: enrollmentId,
      progress_percentage: progress,
      time_spent_minutes: timeSpent,
      is_completed: progress >= 100,
      completed_at: progress >= 100 ? new Date().toISOString() : null
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as LessonProgress;
}

export async function getLessonProgress(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();
  
  if (error) return null;
  return data as LessonProgress;
}

// Quizzes
export async function getCourseQuizzes(courseId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions(*)
    `)
    .eq('course_id', courseId);
  
  if (error) throw error;
  return data as Quiz[];
}

export async function getQuiz(quizId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions(*),
      course:courses(*)
    `)
    .eq('id', quizId)
    .single();
  
  if (error) throw error;
  return data as Quiz;
}

// Quiz Attempts
export async function createQuizAttempt(
  userId: string, 
  quizId: string, 
  enrollmentId: string,
  maxScore: number
) {
  // Get attempt number
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('attempt_number')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('attempt_number', { ascending: false })
    .limit(1);

  const attemptNumber = attempts && attempts.length > 0 ? attempts[0].attempt_number + 1 : 1;

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([{
      user_id: userId,
      quiz_id: quizId,
      enrollment_id: enrollmentId,
      attempt_number: attemptNumber,
      max_score: maxScore,
      started_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as QuizAttempt;
}

export async function updateQuizAttempt(
  attemptId: string, 
  score: number, 
  answers: Record<string, any>,
  timeTaken: number
) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .update({
      score,
      answers,
      time_taken_minutes: timeTaken,
      completed_at: new Date().toISOString(),
      is_completed: true
    })
    .eq('id', attemptId)
    .select()
    .single();
  
  if (error) throw error;
  return data as QuizAttempt;
}

export async function getUserQuizAttempts(userId: string, quizId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('attempt_number', { ascending: false });
  
  if (error) throw error;
  return data as QuizAttempt[];
}

// Achievements
export async function getAchievements() {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('points_reward', { ascending: false });
  
  if (error) throw error;
  return data as Achievement[];
}

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  
  if (error) throw error;
  return data as UserAchievement[];
}

export async function awardAchievement(userId: string, achievementId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .insert([{
      user_id: userId,
      achievement_id: achievementId,
      earned_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as UserAchievement;
}

// AI Chat Sessions
export async function createChatSession(
  userId: string, 
  sessionType: string = 'general',
  courseId?: string,
  lessonId?: string
) {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .insert([{
      user_id: userId,
      session_type: sessionType,
      course_id: courseId,
      lesson_id: lessonId,
      started_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as AIChatSession;
}

export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>,
  tokensUsed?: number,
  modelUsed?: string
) {
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .insert([{
      session_id: sessionId,
      role,
      content,
      metadata: metadata || {},
      tokens_used: tokensUsed,
      model_used: modelUsed || 'gpt-4',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as AIChatMessage;
}

export async function getChatSession(sessionId: string) {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select(`
      *,
      messages:ai_chat_messages(*)
    `)
    .eq('id', sessionId)
    .single();
  
  if (error) throw error;
  return data as AIChatSession;
}

export async function getUserChatSessions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as AIChatSession[];
}

// Learning Analytics
export async function updateLearningAnalytics(
  userId: string,
  date: string,
  timeMinutes: number,
  lessonsCompleted: number = 0,
  quizzesCompleted: number = 0,
  pointsEarned: number = 0
) {
  const { data, error } = await supabase
    .from('learning_analytics')
    .upsert({
      user_id: userId,
      date,
      total_time_minutes: timeMinutes,
      lessons_completed: lessonsCompleted,
      quizzes_completed: quizzesCompleted,
      points_earned: pointsEarned
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as LearningAnalytics;
}

export async function getUserAnalytics(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('learning_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data as LearningAnalytics[];
}

// Dashboard Stats
export async function getDashboardStats(userId: string) {
  const [enrollments, achievements, analytics] = await Promise.all([
    getUserEnrollments(userId),
    getUserAchievements(userId),
    getUserAnalytics(userId, 7)
  ]);

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.is_completed).length;
  const totalAchievements = achievements.length;
  const weeklyTime = analytics.reduce((sum, day) => sum + day.total_time_minutes, 0);
  const weeklyLessons = analytics.reduce((sum, day) => sum + day.lessons_completed, 0);

  return {
    totalCourses,
    completedCourses,
    totalAchievements,
    weeklyTime,
    weeklyLessons,
    enrollments,
    achievements,
    analytics
  };
}