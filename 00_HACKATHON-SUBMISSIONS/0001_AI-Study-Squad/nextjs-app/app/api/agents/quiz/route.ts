import { NextRequest, NextResponse } from 'next/server';
import { QuizMasterAgent, LearningContext } from '../../../../lib/agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    const quizMaster = new QuizMasterAgent();

    switch (action) {
      case 'generate': {
        const { context, numQuestions = 5 } = data;
        
        if (!context?.topic) {
          return NextResponse.json(
            { error: 'Topic is required in context' },
            { status: 400 }
          );
        }

        const quiz = await quizMaster.generateQuiz(context as LearningContext, numQuestions);
        
        return NextResponse.json({
          success: true,
          quiz
        });
      }

      case 'evaluate': {
        const { question, userAnswer, correctAnswer } = data;
        
        if (!question || !userAnswer || !correctAnswer) {
          return NextResponse.json(
            { error: 'Question, user answer, and correct answer are required' },
            { status: 400 }
          );
        }

        const evaluation = await quizMaster.evaluateAnswer(question, userAnswer, correctAnswer);
        
        return NextResponse.json({
          success: true,
          evaluation
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "generate" or "evaluate"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Quiz error:', error);
    return NextResponse.json(
      { error: 'Quiz operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}