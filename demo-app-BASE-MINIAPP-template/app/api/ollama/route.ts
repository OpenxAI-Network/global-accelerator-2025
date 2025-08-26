import { NextRequest, NextResponse } from 'next/server';

// Simple Ollama client for server-side usage
class OllamaClient {
  private endpoint: string;

  constructor() {
    this.endpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
  }

  async generateResponse(prompt: string, model: string = 'llama3.2'): Promise<string> {
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response generated';
    } catch (error) {
      console.error('Ollama error:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number; reasoning: string }> {
    // Create varied prompts for different responses each time
    const promptVariations = [
      `Analyze the sentiment of this text and respond with JSON: sentiment (BULLISH/BEARISH/NEUTRAL), score (0-100), reasoning. Text: "${text}"`,
      `What's the mood of this text? Give me JSON with: sentiment field, confidence score 0-100, and your reasoning. Here's the text: "${text}"`,
      `JSON sentiment analysis needed: sentiment (BULLISH/BEARISH/NEUTRAL), score 0-100, reasoning. Analyze: "${text}"`,
      `Sentiment check time! JSON response with: sentiment, score 0-100, reasoning. Text to analyze: "${text}"`
    ];
    
    const randomPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];

    try {
      const response = await this.generateResponse(randomPrompt);
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(response);
        return {
          sentiment: parsed.sentiment || 'NEUTRAL',
          score: parsed.score || 50,
          reasoning: parsed.reasoning || 'Analysis completed'
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          sentiment: 'NEUTRAL',
          score: 50,
          reasoning: 'AI analysis completed (fallback response)'
        };
      }
    } catch (error) {
      // Return fallback data if Ollama is not available
      return {
        sentiment: 'neutral',
        score: 50,
        reasoning: 'Sentiment analysis unavailable - Ollama not running'
      };
    }
  }

  async generateTradingSignal(priceData: any): Promise<{ action: string; confidence: number; reasoning: string }> {
    // Create varied prompts for different responses each time
    const promptVariations = [
      `Based on this price data, generate a trading signal. Current Price: $${priceData.price}, Last Updated: ${priceData.lastUpdated}, Cache Status: ${priceData.isStale ? 'Stale' : 'Fresh'}. Give me JSON with: action (BUY/SELL/HOLD), confidence 0-100, reasoning.`,
      `Trading signal needed! Price: $${priceData.price}, Updated: ${priceData.lastUpdated}, Cache: ${priceData.isStale ? 'Stale' : 'Fresh'}. JSON response: action field, confidence 0-100, reasoning.`,
      `What's your trading advice? Price $${priceData.price}, Time ${priceData.lastUpdated}, Cache ${priceData.isStale ? 'Stale' : 'Fresh'}. JSON: action, confidence 0-100, reasoning.`,
      `Time for trading wisdom! Current price $${priceData.price}, last update ${priceData.lastUpdated}, cache status ${priceData.isStale ? 'Stale' : 'Fresh'}. JSON format: action, confidence, reasoning.`
    ];
    
    const randomPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];

    try {
      const response = await this.generateResponse(randomPrompt);
      
      try {
        const parsed = JSON.parse(response);
        return {
          action: parsed.action || 'HOLD',
          confidence: parsed.confidence || 50,
          reasoning: parsed.reasoning || 'Analysis completed'
        };
      } catch (parseError) {
        return {
          action: 'HOLD',
          confidence: 50,
          reasoning: 'AI analysis completed (fallback response)'
        };
      }
    } catch (error) {
      return {
        action: 'HOLD',
        confidence: 50,
        reasoning: 'Trading signal unavailable - Ollama not running'
      };
    }
  }

  async generateCustomResponse(text: string): Promise<string> {
    // Create varied prompts that will generate different responses each time
    const promptVariations = [
      `${text} And then say Ready to start vibe coding!`,
      `${text} Also mention you're ready to start vibe coding or words to that effect.`,
      `${text} Then express your readiness to begin vibe coding in your own words.`,
      `${text} And add something about being ready to start vibe coding.`,
      `${text} Then say you're ready to start vibe coding, but put it in your own unique way.`,
      `${text} And finish by saying you're ready to start vibe coding, but be creative about it.`,
      `${text} Then express your excitement about starting vibe coding in a fresh way.`,
      `${text} And conclude with your readiness to start vibe coding, but make it original.`
    ];
    
    const randomPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];
    
    try {
      // Use the exact model name that's available
      return await this.generateResponse(randomPrompt, 'llama3.2:3b');
    } catch (error) {
      return `${text} Ready to start vibe coding! (Ollama not available)`;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, text, priceData, model = 'llama3.2' } = await request.json();

    const ollama = new OllamaClient();

    let result: any;

    switch (action) {
      case 'sentiment':
        result = await ollama.analyzeSentiment(text);
        break;
      case 'trading_signal':
        result = await ollama.generateTradingSignal(priceData);
        break;
      case 'generate':
        result = { response: await ollama.generateCustomResponse(text) };
        break;
      case 'custom':
        result = { response: await ollama.generateCustomResponse(text) };
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: sentiment, trading_signal, generate, or custom'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      model: model,
      action: action
    });

  } catch (error) {
    console.error('Ollama API route error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET endpoint to check Ollama status
export async function GET() {
  try {
    const ollama = new OllamaClient();
    
    // Try to generate a simple response to test connection
    const testResponse = await ollama.generateResponse('Hello', 'llama3.2:3b');
    
    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'Ollama is running and responding',
      test_response: testResponse.substring(0, 50) + '...'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'disconnected',
      message: 'Ollama is not available',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
