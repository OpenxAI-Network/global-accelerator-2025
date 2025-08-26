import { NextRequest, NextResponse } from 'next/server';
import { StudyBuddyAgent, LearningContext } from '../../../../lib/agents';

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const buddy = new StudyBuddyAgent();
    const response = await buddy.helpWithQuestion(question, context as LearningContext | undefined);

    return NextResponse.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Study buddy error:', error);
    return NextResponse.json(
      { error: 'Failed to get help', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}