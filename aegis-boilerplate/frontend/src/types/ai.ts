export interface AIContext {
  type: 'portfolio' | 'lending' | 'crossChain' | 'security' | 'general';
  description?: string;
  data?: Record<string, any>;
  chainId?: number;
  positionId?: string;
  userId?: string;
}

export interface AIAction {
  type: string;
  label: string;
  icon: string;
  data: any;
  description?: string;
}

export interface AIInsight {
  type: 'tip' | 'warning' | 'opportunity' | 'risk';
  content: string;
  confidence?: number;
  actionable?: boolean;
}

export interface AIResponse {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  context?: AIContext;
  actions?: AIAction[];
  insights?: AIInsight[];
  metadata?: Record<string, any>;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIResponse[];
  context: AIContext;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface AIPrompt {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  context: AIContext;
  examples: string[];
}

export interface AIUsage {
  userId: string;
  timestamp: Date;
  prompt: string;
  responseLength: number;
  context: AIContext;
  model: string;
  cost: number;
  tokens: {
    input: number;
    output: number;
  };
}
