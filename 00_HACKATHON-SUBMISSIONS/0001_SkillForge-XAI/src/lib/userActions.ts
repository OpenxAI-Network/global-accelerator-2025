import { supabase } from './supabase'

export interface UserAction {
  user_id: string
  action_type: 'course_enrollment' | 'lesson_completion' | 'achievement_earned' | 'login' | 'quiz_completed'
  resource_id?: string
  resource_type?: 'course' | 'lesson' | 'quiz' | 'achievement'
  metadata?: Record<string, any>
}

export const trackUserAction = async (action: UserAction) => {
  try {
    const { error } = await supabase
      .from('user_actions')
      .insert({
        ...action,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error tracking user action:', error)
    }
  } catch (error) {
    console.error('Error tracking user action:', error)
  }
}

export const enrollInCourse = async (userId: string, courseId: string) => {
  try {
    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment) {
      return { success: false, message: 'Already enrolled in this course' }
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        completion_percentage: 0,
        last_accessed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Track the action
    await trackUserAction({
      user_id: userId,
      action_type: 'course_enrollment',
      resource_id: courseId,
      resource_type: 'course'
    })

    // Update course enrollment count
    const { error: rpcError } = await supabase.rpc('increment_course_enrollments', { course_id: courseId })
    if (rpcError) {
      console.warn('Failed to update enrollment count:', rpcError)
    }

    return { success: true, enrollment }
  } catch (error) {
    console.error('Error enrolling in course:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    const errorMessage = error instanceof Error ? error.message : (typeof error === 'object' && error !== null ? JSON.stringify(error) : 'Failed to enroll in course')
    return { success: false, message: errorMessage }
  }
}

export const updateLearningProgress = async (
  userId: string, 
  courseId: string, 
  completionPercentage: number,
  timeSpentMinutes: number = 0
) => {
  try {
    // Update enrollment progress
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({
        completion_percentage: completionPercentage,
        last_accessed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)

    if (enrollmentError) {
      throw enrollmentError
    }

    // Update user's total learning time
    if (timeSpentMinutes > 0) {
      const { error: userError } = await supabase.rpc('increment_user_learning_time', {
        user_id: userId,
        minutes: timeSpentMinutes
      })

      if (userError) {
        console.error('Error updating user learning time:', userError)
      }
    }

    // Check for course completion
    if (completionPercentage >= 100) {
      await trackUserAction({
        user_id: userId,
        action_type: 'lesson_completion',
        resource_id: courseId,
        resource_type: 'course',
        metadata: { completion_percentage: completionPercentage }
      })

      // Award completion points
      await awardPoints(userId, 500, 'Course completion')
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating learning progress:', error)
    return { success: false, message: 'Failed to update progress' }
  }
}

export const awardPoints = async (userId: string, points: number, reason: string) => {
  try {
    const { error } = await supabase.rpc('award_user_points', {
      user_id: userId,
      points: points,
      reason: reason
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error awarding points:', error)
    return { success: false }
  }
}

export const updateUserStreak = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('update_user_streak', {
      user_id: userId
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating user streak:', error)
    return { success: false }
  }
}

export const getUserLearningStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('total_points, current_streak, total_time_minutes')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('completion_percentage, courses(title)')
      .eq('user_id', userId)

    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('achievements(name, points_reward)')
      .eq('user_id', userId)

    return {
      success: true,
      stats: {
        ...data,
        courses_enrolled: enrollments?.length || 0,
        courses_completed: enrollments?.filter(e => e.completion_percentage >= 100).length || 0,
        achievements_earned: achievements?.length || 0
      }
    }
  } catch (error) {
    console.error('Error fetching user learning stats:', error)
    return { success: false, stats: null }
  }
}