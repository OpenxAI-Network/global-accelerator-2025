export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit input length
};

export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const browserInfo = typeof window !== 'undefined' 
    ? window.navigator.userAgent.replace(/\D/g, '').substr(0, 5)
    : '00000';
  return `session_${timestamp}_${random}_${browserInfo}`;
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const parseAgentResponse = (content: string): {
  sections: Array<{ title: string; content: string }>;
  hasQuiz: boolean;
  hasCode: boolean;
} => {
  const sections: Array<{ title: string; content: string }> = [];
  const lines = content.split('\n');
  let currentSection = { title: 'Main', content: '' };
  
  for (const line of lines) {
    if (line.match(/^#+\s+/)) {
      if (currentSection.content) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace(/^#+\s+/, ''),
        content: ''
      };
    } else {
      currentSection.content += line + '\n';
    }
  }
  
  if (currentSection.content) {
    sections.push(currentSection);
  }
  
  const hasQuiz = content.toLowerCase().includes('quiz') || 
                  content.toLowerCase().includes('question');
  const hasCode = content.includes('```');
  
  return { sections, hasQuiz, hasCode };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const validateTopic = (topic: string): { 
  isValid: boolean; 
  error?: string 
} => {
  if (!topic || topic.trim().length === 0) {
    return { isValid: false, error: 'Topic cannot be empty' };
  }
  
  if (topic.length < 3) {
    return { isValid: false, error: 'Topic must be at least 3 characters' };
  }
  
  if (topic.length > 100) {
    return { isValid: false, error: 'Topic must be less than 100 characters' };
  }
  
  // Check for inappropriate content (basic filter)
  const inappropriateTerms = ['spam', 'test123', 'asdf'];
  if (inappropriateTerms.some(term => topic.toLowerCase().includes(term))) {
    return { isValid: false, error: 'Please enter a valid learning topic' };
  }
  
  return { isValid: true };
};

export const storageManager = {
  saveSession: (sessionId: string, data: any) => {
    if (typeof window === 'undefined') return;
    try {
      const sessions = JSON.parse(localStorage.getItem('ai_study_sessions') || '{}');
      sessions[sessionId] = {
        ...data,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('ai_study_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },
  
  loadSession: (sessionId: string): any => {
    if (typeof window === 'undefined') return null;
    try {
      const sessions = JSON.parse(localStorage.getItem('ai_study_sessions') || '{}');
      return sessions[sessionId] || null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  },
  
  getAllSessions: (): Record<string, any> => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('ai_study_sessions') || '{}');
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return {};
    }
  },
  
  clearOldSessions: (daysToKeep: number = 7) => {
    if (typeof window === 'undefined') return;
    try {
      const sessions = JSON.parse(localStorage.getItem('ai_study_sessions') || '{}');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const filteredSessions = Object.entries(sessions).reduce((acc, [key, value]: [string, any]) => {
        if (new Date(value.savedAt) > cutoffDate) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      localStorage.setItem('ai_study_sessions', JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Failed to clear old sessions:', error);
    }
  }
};

export const analyticsTracker = {
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    // In production, integrate with analytics service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      console.log('Analytics Event:', eventName, properties);
      // window.gtag('event', eventName, properties);
    }
  },
  
  trackSessionStart: (topic: string, level: string) => {
    analyticsTracker.trackEvent('session_started', { topic, level });
  },
  
  trackAgentInteraction: (agentName: string, queryType: string) => {
    analyticsTracker.trackEvent('agent_interaction', { agentName, queryType });
  },
  
  trackSessionEnd: (duration: number, messageCount: number) => {
    analyticsTracker.trackEvent('session_ended', { duration, messageCount });
  }
};