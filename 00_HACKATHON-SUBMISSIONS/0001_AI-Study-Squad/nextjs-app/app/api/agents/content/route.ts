import { NextRequest, NextResponse } from 'next/server';
import { ContentCreatorAgent, LearningContext } from '../../../../lib/agents';

export async function POST(req: NextRequest) {
  try {
    const context: LearningContext = await req.json();

    if (!context.topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const creator = new ContentCreatorAgent();
    const content = await creator.createContent(context);

    return NextResponse.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}