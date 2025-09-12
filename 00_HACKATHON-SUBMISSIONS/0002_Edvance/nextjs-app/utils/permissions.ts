interface User {
  id: string
  email: string
  name: string
  role: 'teacher' | 'student'
  isDemo: boolean
}

export const permissions = {
  // Class management
  canCreateClass: (user: User | null): boolean => {
    return user?.role === 'teacher'
  },

  canDeleteClass: (user: User | null): boolean => {
    return user?.role === 'teacher'
  },

  canManageStudents: (user: User | null): boolean => {
    return user?.role === 'teacher'
  },

  // Document management
  canUploadDocuments: (user: User | null): boolean => {
    return user?.role === 'teacher'
  },

  canViewDocuments: (user: User | null): boolean => {
    return user !== null // Both teachers and students can view documents if enrolled
  },

  // Question management
  canDeleteAnyQuestion: (user: User | null): boolean => {
    return user?.role === 'teacher'
  },

  canDeleteOwnQuestion: (user: User | null, questionUserId: string): boolean => {
    return user?.id === questionUserId || user?.role === 'teacher'
  },

  // Answer/Comment management
  canDeleteAnyAnswer: (user: User | null): boolean => {
    return user?.role === 'teacher'
  },

  canDeleteOwnAnswer: (user: User | null, answerUserId: string): boolean => {
    return user?.id === answerUserId || user?.role === 'teacher'
  },

  // General permissions
  canAskQuestions: (user: User | null): boolean => {
    return user !== null // Both teachers and students can ask questions
  },

  canAnswerQuestions: (user: User | null): boolean => {
    return user !== null // Both teachers and students can answer questions
  },

  canJoinClasses: (user: User | null): boolean => {
    return user?.role === 'student'
  },

  canLeaveClasses: (user: User | null): boolean => {
    return user?.role === 'student'
  },

  // UI display permissions
  shouldShowTeacherFeatures: (user: User | null): boolean => {
    return user?.role === 'teacher'
  },

  shouldShowStudentFeatures: (user: User | null): boolean => {
    return user?.role === 'student'
  }
}

export const getRoleDisplayName = (role: 'teacher' | 'student'): string => {
  return role === 'teacher' ? 'Teacher' : 'Student'
}

export const getRoleColor = (role: 'teacher' | 'student'): string => {
  return role === 'teacher' ? 'purple' : 'blue'
}
