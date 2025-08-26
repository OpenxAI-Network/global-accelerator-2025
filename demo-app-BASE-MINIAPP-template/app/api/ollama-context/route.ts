import { NextRequest, NextResponse } from 'next/server';

// Simple Ollama client for server-side usage
class OllamaClient {
  private endpoint: string;

  constructor() {
    this.endpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
  }

  async generateResponse(prompt: string, model: string = 'llama3.2:3b'): Promise<string> {
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
}

export async function POST(request: NextRequest) {
  let question = '';
  let model = 'llama3.2:3b';
  
  try {
    const body = await request.json();
    question = body.question || '';
    model = body.model || 'llama3.2:3b';

    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Question is required'
      }, { status: 400 });
    }

    // Get current Base token price data (default to ETH)
    let priceContext = '';
    try {
      const priceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/base-price?token=ETH`);
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        if (priceData.success && priceData.data) {
          priceContext = `Current ${priceData.data.token} price: $${priceData.data.price?.toFixed(8) || 'N/A'} (${priceData.data.isStable ? 'stablecoin' : 'volatile'}, last updated: ${new Date(priceData.data.lastUpdated).toLocaleString()})`;
        }
      }
    } catch (error) {
      priceContext = 'Price data unavailable';
    }

    // Get recent price history for context
    let historyContext = '';
    try {
      const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/price-history?token=ETH&hours=24`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success && historyData.data.length > 0) {
          const history = historyData.data;
          const oldestPrice = history[0].price;
          const newestPrice = history[history.length - 1].price;
          const priceChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;
          const trend = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'stable';
          historyContext = `Price trend: ${trend} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}% over last 24h)`;
        }
      }
    } catch (error) {
      historyContext = 'Price history unavailable';
    }

    // Get social feed context from trending tokens
    let socialContext = '';
    try {
      const trendingResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/farcaster/trending?days=7&limit=20`);
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        if (trendingData.success && trendingData.data.trendingTokens.baseChain.length > 0) {
          const topToken = trendingData.data.trendingTokens.baseChain[0];
          socialContext = `Top trending Base token: $${topToken.token} with ${topToken.mentionCount} mentions. Recent sentiment from Farcaster community shows active discussion.`;
        } else {
          socialContext = `Farcaster social feed: Analyzing recent posts for Base chain token mentions. Community sentiment appears active.`;
        }
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
      socialContext = `Farcaster social feed: Community sentiment analysis available.`;
    }

    // Create context-aware prompt
    const contextPrompt = `You are a crypto trading AI assistant. Here's the current context:

${priceContext}
${historyContext}
${socialContext}

User Question: ${question}

Please provide a helpful, informed response based on this context. Be concise but insightful. If you're asked about trading advice, always include appropriate risk warnings.`;

    const ollama = new OllamaClient();
    const response = await ollama.generateResponse(contextPrompt, model);

    return NextResponse.json({
      success: true,
      data: {
        response,
        context: {
          price: priceContext,
          history: historyContext,
          social: socialContext
        },
        model,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Ollama context API error:', error);
    
    // Get fallback context data
    let fallbackPriceContext = 'Price data unavailable';
    let fallbackHistoryContext = 'Price history unavailable';
    let fallbackSocialContext = 'Social data unavailable';
    
    try {
      const priceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/base-price?token=ETH`);
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        if (priceData.success && priceData.data) {
          fallbackPriceContext = `Current ${priceData.data.token} price: $${priceData.data.price?.toFixed(8) || 'N/A'} (${priceData.data.isStable ? 'stablecoin' : 'volatile'})`;
        }
      }
    } catch (error) {
      // Keep default fallback
    }
    
    try {
      const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/price-history?token=ETH&hours=24`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success && historyData.data.length > 0) {
          const history = historyData.data;
          const oldestPrice = history[0].price;
          const newestPrice = history[history.length - 1].price;
          const priceChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;
          fallbackHistoryContext = `Price trend: ${priceChange > 0 ? 'up' : 'down'} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}% over last 24h)`;
        }
      }
    } catch (error) {
      // Keep default fallback
    }
    
    const fallbackResponse = `I'm sorry, I'm currently unable to access my AI capabilities. However, based on the available data:

${fallbackPriceContext}
${fallbackHistoryContext}
${fallbackSocialContext}

For your question: "${question}", I'd recommend checking the current market conditions and consulting with a financial advisor before making any trading decisions.`;

    return NextResponse.json({
      success: false,
      error: 'Ollama not available, using fallback response',
      data: {
        response: fallbackResponse,
        context: {
          price: fallbackPriceContext,
          history: fallbackHistoryContext,
          social: fallbackSocialContext
        },
        model: 'fallback',
        timestamp: new Date().toISOString()
      }
    });
  }
}

export async function GET() {
  try {
    // Get current context data for display
    let priceContext = '';
    let historyContext = '';
    
    try {
      const priceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/base-price?token=ETH`);
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        if (priceData.success && priceData.data) {
          priceContext = `Current ${priceData.data.token} price: $${priceData.data.price?.toFixed(8) || 'N/A'} (${priceData.data.isStable ? 'stablecoin' : 'volatile'})`;
        }
      }
    } catch (error) {
      priceContext = 'Price data unavailable';
    }
    
    try {
      const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/price-history?token=ETH&hours=24`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success && historyData.data.length > 0) {
          const history = historyData.data;
          const oldestPrice = history[0].price;
          const newestPrice = history[history.length - 1].price;
          const priceChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;
          historyContext = `24h change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`;
        }
      }
    } catch (error) {
      historyContext = 'Price history unavailable';
    }

    return NextResponse.json({
      success: true,
      data: {
        price: priceContext,
        history: historyContext,
        social: 'Social feed data available',
        model: 'llama3.2:3b',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get context data'
    });
  }
}
