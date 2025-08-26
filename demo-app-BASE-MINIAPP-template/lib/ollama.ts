// Ollama integration for Llama 3.2
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
  };
}

export class OllamaClient {
  private endpoint: string;
  private model: string;

  constructor(endpoint: string = OLLAMA_ENDPOINT, model: string = 'llama3.2') {
    this.endpoint = endpoint;
    this.model = model;
  }

  async generateResponse(prompt: string, options?: OllamaRequest['options']): Promise<string> {
    try {
      const request: OllamaRequest = {
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          ...options
        }
      };

      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      throw error;
    }
  }

  async generateTradingSignal(symbol: string, marketData: any): Promise<string> {
    const prompt = `You are an expert AI trading analyst. Analyze the following market data for ${symbol} and provide a trading signal:

Market Data:
${JSON.stringify(marketData, null, 2)}

Please provide:
1. A clear BUY/SELL recommendation
2. Confidence level (0-100%)
3. Entry price suggestion
4. Target price
5. Stop loss level
6. Risk assessment (LOW/MEDIUM/HIGH)
7. Brief reasoning for the recommendation

Format your response as JSON with these fields:
{
  "recommendation": "BUY/SELL",
  "confidence": 85,
  "entryPrice": "0.00001234",
  "targetPrice": "0.00001500",
  "stopLoss": "0.00001100",
  "riskLevel": "MEDIUM",
  "reasoning": "Your analysis here"
}`;

    try {
      const response = await this.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error('Error generating trading signal:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<string> {
    const prompt = `You are an expert market sentiment analyst. Analyze the following text and provide sentiment analysis:

Text: "${text}"

Please provide:
1. Overall sentiment (BULLISH/BEARISH/NEUTRAL)
2. Sentiment score (-100 to +100, where -100 is extremely bearish, +100 is extremely bullish)
3. Key factors influencing the sentiment
4. Confidence level (0-100%)
5. Potential market impact

Format your response as JSON:
{
  "sentiment": "BULLISH",
  "score": 75,
  "factors": ["factor1", "factor2"],
  "confidence": 85,
  "marketImpact": "POSITIVE"
}`;

    try {
      const response = await this.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async getMarketInsights(symbol: string): Promise<string> {
    const prompt = `You are an expert crypto market analyst. Provide insights for ${symbol} token:

Please provide:
1. Current market analysis
2. Key technical levels
3. Support and resistance levels
4. Market sentiment
5. Risk factors
6. Trading recommendations

Format your response as JSON with comprehensive analysis.`;

    try {
      const response = await this.generateResponse(prompt);
      return response;
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw error;
    }
  }
}

// Default instance
export const ollamaClient = new OllamaClient();

// Helper function to parse JSON responses from Ollama
export function parseOllamaResponse(response: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error parsing Ollama response:', error);
    return null;
  }
}
