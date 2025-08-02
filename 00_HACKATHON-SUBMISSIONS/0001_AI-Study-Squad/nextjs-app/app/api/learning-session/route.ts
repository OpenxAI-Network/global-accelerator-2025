import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '../../../lib/agents';

// Store orchestrators per session (in production, use proper session management)
const sessions = new Map<string, AgentOrchestrator>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, action, data } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get or create orchestrator for this session
    let orchestrator = sessions.get(sessionId);
    if (!orchestrator) {
      orchestrator = new AgentOrchestrator();
      sessions.set(sessionId, orchestrator);
    }

    switch (action) {
      case 'start': {
        const { topic, initialAssessment } = data;
        if (!topic) {
          return NextResponse.json({ error: 'Topic required' }, { status: 400 });
        }
        
        const responses = await orchestrator.startLearningSession(topic, initialAssessment);
        return NextResponse.json({ 
          success: true, 
          responses,
          sessionId 
        });
      }

      case 'query': {
        const { query, queryType = 'general' } = data;
        if (!query) {
          return NextResponse.json({ error: 'Query required' }, { status: 400 });
        }
        
        const response = await orchestrator.processUserQuery(query, queryType);
        return NextResponse.json({ 
          success: true, 
          response,
          sessionId 
        });
      }

      case 'history': {
        const history = orchestrator.getSessionHistory();
        return NextResponse.json({ 
          success: true, 
          history,
          sessionId 
        });
      }

      case 'end': {
        sessions.delete(sessionId);
        return NextResponse.json({ 
          success: true, 
          message: 'Session ended',
          sessionId 
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Learning session error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Clean up old sessions periodically (in production, use proper session management)
setInterval(() => {
  if (sessions.size > 100) {
    const keysToDelete = Array.from(sessions.keys()).slice(0, 50);
    keysToDelete.forEach(key => sessions.delete(key));
  }
}, 60000); // Every minute