import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Format the prompt for kids
    const formattedPrompt = `You are a friendly, encouraging teacher for 5-year-old children. 
    
${prompt}

Remember to:
- Keep responses simple and age-appropriate
- Use encouraging and positive language
- Make learning fun and engaging
- Keep responses concise (under 100 words)
- Use emojis when appropriate
- Avoid any inappropriate content

Response:`;

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:3b', // Default model, can be changed
        prompt: formattedPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 200,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    
    // Clean and filter the response for kids
    let cleanResponse = data.response || 'I\'m here to help you learn! 🌟';
    
    // Basic content filtering for kids
    const inappropriateWords = ['bad', 'stupid', 'dumb', 'hate', 'kill', 'die'];
    inappropriateWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanResponse = cleanResponse.replace(regex, 'not good');
    });

    return NextResponse.json({
      response: cleanResponse,
      model: data.model,
      done: data.done,
    });

  } catch (error) {
    console.error('Ollama API error:', error);
    
    // Fallback responses for kids
    const fallbackResponses = [
      "I'm here to help you learn! 🌟",
      "Let's have fun learning together! 🎉",
      "You're doing great! Keep going! 💪",
      "Learning is fun when we do it together! 🎓",
      "I'm your friendly learning buddy! 🤖"
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return NextResponse.json({
      response: randomResponse,
      error: 'Using fallback response',
      model: 'fallback',
      done: true,
    });
  }
}

export async function GET() {
  try {
    // Check if Ollama is running
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'connected',
        models: data.models || [],
        message: 'Ollama is running and ready!'
      });
    } else {
      return NextResponse.json({
        status: 'disconnected',
        message: 'Ollama is not responding'
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'disconnected',
      message: 'Cannot connect to Ollama'
    }, { status: 503 });
  }
}
