"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, Brain } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import AIChat from '@/components/ai/AIChat';
import { supabase } from '@/lib/supabase';

export default function LearnPage() {
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
    checkUser();
  }, [params.id]);

  const fetchCourseData = async () => {
    try {
      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          *,
          lessons(*)
        `)
        .eq('id', params.id)
        .single();

      if (courseData) {
        setCourse(courseData);
        if (courseData.lessons && courseData.lessons.length > 0) {
          const sortedLessons = courseData.lessons.sort((a: any, b: any) => a.sort_order - b.sort_order);
          setCurrentLesson(sortedLessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch user progress
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressData) {
          const progressMap = progressData.reduce((acc: any, item: any) => {
            acc[item.lesson_id] = item;
            return acc;
          }, {});
          setProgress(progressMap);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;

    try {
      // Track user action
      await supabase
        .from('user_actions')
        .insert({
          user_id: user.id,
          action_type: 'lesson_completed',
          resource_id: lessonId,
          resource_type: 'lesson',
          metadata: {
            course_id: params.id,
            lesson_title: currentLesson?.title,
            completion_date: new Date().toISOString()
          }
        });

      // Update lesson progress
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: params.id,
          progress_percentage: 100,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      // Update local progress
      setProgress((prev: any) => ({
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          progress_percentage: 100,
          is_completed: true
        }
      }));

    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const selectLesson = (lesson: any) => {
    setCurrentLesson(lesson);
    
    // Track lesson view
    if (user) {
      supabase
        .from('user_actions')
        .insert({
          user_id: user.id,
          action_type: 'lesson_viewed',
          resource_id: lesson.id,
          resource_type: 'lesson',
          metadata: {
            course_id: params.id,
            lesson_title: lesson.title
          }
        });
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your course..." />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/courses/${params.id}`}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Course
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">Interactive Learning Experience</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Lesson Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Content</h2>
              
              <div className="space-y-2">
                {course.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((lesson: any, index: number) => (
                  <button
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentLesson?.id === lesson.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          progress[lesson.id]?.is_completed
                            ? 'bg-green-500 text-white'
                            : currentLesson?.id === lesson.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                        }`}>
                          {progress[lesson.id]?.is_completed ? (
                            <CheckCircle size={12} />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {lesson.duration_minutes} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentLesson ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentLesson.title}
                  </h2>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{currentLesson.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen size={16} />
                      <span>Lesson Content</span>
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="prose dark:prose-invert max-w-none mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Lesson Overview
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentLesson.content || 'This lesson will cover important concepts and practical applications. Engage with the AI assistant for personalized explanations and guidance.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Key Learning Points:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Understanding core concepts and terminology</li>
                      <li>Practical applications and real-world examples</li>
                      <li>Hands-on exercises and problem-solving</li>
                      <li>Best practices and common pitfalls to avoid</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {!progress[currentLesson.id]?.is_completed && (
                      <button
                        onClick={() => markLessonComplete(currentLesson.id)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Mark Complete</span>
                      </button>
                    )}
                  </div>
                  
                  {progress[currentLesson.id]?.is_completed && (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={18} />
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a Lesson
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a lesson from the sidebar to start learning
                </p>
              </div>
            )}
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-500" />
                Learning Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions about the lesson content
              </p>
            </div>
            <AIChat className="h-[600px]" />
          </div>
        </div>
      </div>
    </div>
  );
}