"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Users, Star, Play, BookOpen, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { supabase } from '@/lib/supabase';
import { enrollInCourse, trackUserAction } from '@/lib/userActions';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    checkUser();
  }, [params.id]);

  const fetchCourseDetails = async () => {
    try {
      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          *,
          categories(name, color),
          lessons(id, title, duration_minutes, sort_order)
        `)
        .eq('id', params.id)
        .single();

      if (courseData) {
        setCourse(courseData);
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
        
        // Check if user is enrolled
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', params.id)
          .single();
        
        setIsEnrolled(!!enrollment);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setEnrolling(true);
    try {
      const result = await enrollInCourse(user.id, params.id as string);
      
      if (result.success) {
        setIsEnrolled(true);
        alert('Successfully enrolled in course!');
        // Redirect to course content
        router.push(`/learn/${params.id}`);
      } else {
        console.error('Enrollment failed:', result.message);
        alert(result.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course';
      alert(`Enrollment failed: ${errorMessage}`);
    } finally {
      setEnrolling(false);
    }
  };

  const startLearning = () => {
    router.push(`/learn/${params.id}`);
  };

  if (loading) {
    return <LoadingScreen message="Loading course details..." />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/courses" className="text-blue-600 hover:text-blue-700">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="dashboard" />
      <div className="max-w-6xl mx-auto px-6 py-8 pt-24">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            href="/courses"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Courses
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  course.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {course.difficulty_level}
                </span>
                {course.categories && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium">
                    {course.categories.name}
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{course.estimated_duration_hours} hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>{course.total_enrollments} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span>{course.rating} rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Content</h2>
              
              {course.lessons && course.lessons.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons
                    .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    .map((lesson: any, index: number) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {lesson.duration_minutes} minutes
                          </p>
                        </div>
                      </div>
                      {isEnrolled ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Course content will be available soon.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              {/* Course Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-16 h-16 text-white" />
              </div>

              {/* Instructor */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instructor</h3>
                <p className="text-gray-600 dark:text-gray-300">{course.instructor_name}</p>
              </div>

              {/* Enrollment Button */}
              <div className="space-y-4">
                {isEnrolled ? (
                  <button
                    onClick={startLearning}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play size={18} />
                    <span>Continue Learning</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    {enrolling ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Award size={18} />
                    )}
                    <span>{enrolling ? 'Enrolling...' : 'Enroll Now'}</span>
                  </button>
                )}
                
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {isEnrolled ? 'You are enrolled in this course' : 'Free enrollment • Lifetime access'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}