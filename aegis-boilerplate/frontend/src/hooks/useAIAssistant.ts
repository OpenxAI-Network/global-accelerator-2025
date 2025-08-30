import { useState, useCallback } from 'react';
import { AIResponse, AIContext } from '../types/ai';

interface AIAssistantResponse {
  content: string;
  actions?: Array<{
    type: string;
    label: string;
    icon: string;
    data: any;
  }>;
  insights?: Array<{
    type: 'tip' | 'warning' | 'opportunity' | 'risk';
    content: string;
    confidence?: number;
    actionable?: boolean;
  }>;
}

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string, 
    context?: AIContext
  ): Promise<AIAssistantResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.content) {
        throw new Error('Invalid AI response format');
      }

      return {
        content: data.content,
        actions: data.actions || [],
        insights: data.insights || [],
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPortfolioInsights = useCallback(async (
    portfolioData: any,
    context?: AIContext
  ): Promise<AIAssistantResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/portfolio-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioData,
          context,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.content,
        actions: data.actions || [],
        insights: data.insights || [],
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get portfolio insights';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStrategyRecommendations = useCallback(async (
    userProfile: any,
    marketData: any,
    context?: AIContext
  ): Promise<AIAssistantResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/strategy-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          marketData,
          context,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.content,
        actions: data.actions || [],
        insights: data.insights || [],
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get strategy recommendations';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeRisk = useCallback(async (
    positionData: any,
    marketConditions: any,
    context?: AIContext
  ): Promise<AIAssistantResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionData,
          marketConditions,
          context,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.content,
        actions: data.actions || [],
        insights: data.insights || [],
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze risk';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    getPortfolioInsights,
    getStrategyRecommendations,
    analyzeRisk,
    isLoading,
    error,
    clearError,
  };
};
