import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeAssessorAgent } from '../../../../lib/agents';

export async function POST(req: NextRequest) {
  try {
    const { topic, response } = await req.json();

    if (!topic || !response) {
      return NextResponse.json(
        { error: 'Topic and response are required' },
        { status: 400 }
      );
    }

    const assessor = new KnowledgeAssessorAgent();
    const assessment = await assessor.assessKnowledge(topic, response);

    return NextResponse.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to assess knowledge', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}