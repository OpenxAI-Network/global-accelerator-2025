import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LearningContext {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  previousKnowledge?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  weakAreas?: string[];
  strongAreas?: string[];
}

export interface AgentResponse {
  agent: string;
  content: string;
  metadata?: Record<string, any>;
}

class BaseAgent {
  protected name: string;
  protected systemPrompt: string;
  protected model: string = 'llama3.2:1b';

  constructor(name: string, systemPrompt: string) {
    this.name = name;
    this.systemPrompt = systemPrompt;
  }

  async execute(prompt: string, context?: any): Promise<AgentResponse> {
    try {
      const response = await ollama.chat({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: false
      });

      return {
        agent: this.name,
        content: response.message.content,
        metadata: context
      };
    } catch (error) {
      console.error(`${this.name} error:`, error);
      return {
        agent: this.name,
        content: `Error in ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: true }
      };
    }
  }
}

export class KnowledgeAssessorAgent extends BaseAgent {
  constructor() {
    super(
      'Knowledge Assessor',
      `You are an expert educational assessor. Your role is to:
      1. Evaluate the student's current knowledge level
      2. Identify knowledge gaps and weak areas
      3. Determine the appropriate starting point for learning
      4. Suggest prerequisite topics if needed
      5. Create a knowledge profile
      
      Be encouraging but honest about areas that need improvement.
      Output your assessment in a clear, structured format.`
    );
  }

  async assessKnowledge(topic: string, userResponse: string): Promise<AgentResponse> {
    const prompt = `Assess the following response about "${topic}":
    
    Student's response: "${userResponse}"
    
    Provide:
    1. Current knowledge level (beginner/intermediate/advanced)
    2. Key concepts understood
    3. Knowledge gaps identified
    4. Recommended focus areas
    5. Confidence score (0-100)`;

    return this.execute(prompt);
  }
}

export class ContentCreatorAgent extends BaseAgent {
  constructor() {
    super(
      'Content Creator',
      `You are an expert educational content creator. Your role is to:
      1. Generate clear, engaging learning materials
      2. Adapt content to the student's level
      3. Include examples and analogies
      4. Break down complex concepts
      5. Create structured lessons
      
      Make content accessible and interesting.
      Use markdown formatting for better readability.`
    );
  }

  async createContent(context: LearningContext): Promise<AgentResponse> {
    const prompt = `Create a learning module for:
    Topic: ${context.topic}
    Level: ${context.level}
    Learning Style: ${context.learningStyle || 'general'}
    ${context.weakAreas ? `Focus on weak areas: ${context.weakAreas.join(', ')}` : ''}
    
    Include:
    1. Overview
    2. Key concepts with explanations
    3. Real-world examples
    4. Practice exercises
    5. Summary`;

    return this.execute(prompt, context);
  }
}

export class QuizMasterAgent extends BaseAgent {
  constructor() {
    super(
      'Quiz Master',
      `You are an expert quiz creator and evaluator. Your role is to:
      1. Generate appropriate quiz questions
      2. Create different question types (multiple choice, true/false, open-ended)
      3. Adapt difficulty to student level
      4. Provide detailed feedback on answers
      5. Track performance patterns
      
      Make quizzes challenging but fair.
      Always explain why answers are correct or incorrect.`
    );
  }

  async generateQuiz(context: LearningContext, numQuestions: number = 5): Promise<AgentResponse> {
    const prompt = `Create a quiz with ${numQuestions} questions about:
    Topic: ${context.topic}
    Level: ${context.level}
    
    Format each question as:
    Q[number]: [Question]
    Type: [multiple-choice/true-false/open-ended]
    Options: [if applicable]
    Answer: [correct answer]
    Explanation: [why this is correct]`;

    return this.execute(prompt, context);
  }

  async evaluateAnswer(question: string, userAnswer: string, correctAnswer: string): Promise<AgentResponse> {
    const prompt = `Evaluate this answer:
    Question: ${question}
    Student's Answer: ${userAnswer}
    Correct Answer: ${correctAnswer}
    
    Provide:
    1. Is the answer correct? (yes/no/partially)
    2. Score (0-100)
    3. Detailed feedback
    4. What the student understood correctly
    5. What needs improvement
    6. Hint for next attempt (if incorrect)`;

    return this.execute(prompt);
  }
}

export class ProgressTrackerAgent extends BaseAgent {
  constructor() {
    super(
      'Progress Tracker',
      `You are an expert learning analytics specialist. Your role is to:
      1. Track learning progress over time
      2. Identify patterns in performance
      3. Suggest adjustments to learning path
      4. Celebrate achievements
      5. Provide motivational feedback
      
      Be encouraging and data-driven in your analysis.`
    );
  }

  async analyzeProgress(learningHistory: any[]): Promise<AgentResponse> {
    const prompt = `Analyze this learning progress:
    ${JSON.stringify(learningHistory, null, 2)}
    
    Provide:
    1. Overall progress assessment
    2. Strengths demonstrated
    3. Areas showing improvement
    4. Areas needing more work
    5. Recommended next steps
    6. Motivational message`;

    return this.execute(prompt, { history: learningHistory });
  }
}

export class StudyBuddyAgent extends BaseAgent {
  constructor() {
    super(
      'Study Buddy',
      `You are a friendly, supportive AI study companion. Your role is to:
      1. Answer questions in a conversational way
      2. Provide encouragement and motivation
      3. Offer study tips and strategies
      4. Help with problem-solving
      5. Make learning fun and engaging
      
      Be friendly, patient, and supportive.
      Use analogies and real-world examples.
      Encourage curiosity and exploration.`
    );
  }

  async helpWithQuestion(question: string, context?: LearningContext): Promise<AgentResponse> {
    const prompt = `A student asks: "${question}"
    ${context ? `They are learning about: ${context.topic} at ${context.level} level` : ''}
    
    Provide a helpful, encouraging response that:
    1. Directly answers their question
    2. Explains the concept clearly
    3. Gives an example or analogy
    4. Suggests a way to remember it
    5. Encourages further exploration`;

    return this.execute(prompt, context);
  }
}

export class AgentOrchestrator {
  private knowledgeAssessor: KnowledgeAssessorAgent;
  private contentCreator: ContentCreatorAgent;
  private quizMaster: QuizMasterAgent;
  private progressTracker: ProgressTrackerAgent;
  private studyBuddy: StudyBuddyAgent;
  private learningContext: LearningContext | null = null;
  private sessionHistory: AgentResponse[] = [];

  constructor() {
    this.knowledgeAssessor = new KnowledgeAssessorAgent();
    this.contentCreator = new ContentCreatorAgent();
    this.quizMaster = new QuizMasterAgent();
    this.progressTracker = new ProgressTrackerAgent();
    this.studyBuddy = new StudyBuddyAgent();
  }

  setContext(context: LearningContext) {
    this.learningContext = context;
  }

  async startLearningSession(topic: string, initialAssessment?: string): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];

    // Step 1: Assess knowledge if initial assessment provided
    if (initialAssessment) {
      const assessment = await this.knowledgeAssessor.assessKnowledge(topic, initialAssessment);
      responses.push(assessment);
      
      // Update context based on assessment
      this.learningContext = {
        topic,
        level: this.extractLevel(assessment.content),
        weakAreas: this.extractWeakAreas(assessment.content)
      };
    } else {
      this.learningContext = {
        topic,
        level: 'beginner'
      };
    }

    // Step 2: Create personalized content
    const content = await this.contentCreator.createContent(this.learningContext);
    responses.push(content);

    // Step 3: Generate initial quiz
    const quiz = await this.quizMaster.generateQuiz(this.learningContext, 3);
    responses.push(quiz);

    this.sessionHistory.push(...responses);
    return responses;
  }

  async processUserQuery(query: string, queryType: 'question' | 'quiz_answer' | 'general'): Promise<AgentResponse> {
    let response: AgentResponse;

    switch (queryType) {
      case 'question':
        response = await this.studyBuddy.helpWithQuestion(query, this.learningContext || undefined);
        break;
      
      case 'quiz_answer':
        // This would need the question and correct answer context
        response = await this.quizMaster.evaluateAnswer(
          'Previous question', // Would be passed from frontend
          query,
          'Correct answer' // Would be stored from quiz generation
        );
        break;
      
      case 'general':
      default:
        response = await this.studyBuddy.helpWithQuestion(query, this.learningContext || undefined);
    }

    this.sessionHistory.push(response);
    
    // Periodically analyze progress
    if (this.sessionHistory.length % 10 === 0) {
      const progressAnalysis = await this.progressTracker.analyzeProgress(this.sessionHistory);
      this.sessionHistory.push(progressAnalysis);
      return progressAnalysis;
    }

    return response;
  }

  private extractLevel(assessmentContent: string): 'beginner' | 'intermediate' | 'advanced' {
    const lower = assessmentContent.toLowerCase();
    if (lower.includes('advanced')) return 'advanced';
    if (lower.includes('intermediate')) return 'intermediate';
    return 'beginner';
  }

  private extractWeakAreas(assessmentContent: string): string[] {
    // Simple extraction - in production would use more sophisticated parsing
    const weakAreasMatch = assessmentContent.match(/weak areas?:?\s*([^\n]+)/i);
    if (weakAreasMatch) {
      return weakAreasMatch[1].split(',').map(area => area.trim());
    }
    return [];
  }

  getSessionHistory(): AgentResponse[] {
    return this.sessionHistory;
  }
}