import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gemini API Configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBJjAgF21V44hb-lTNiWKoWWfo9U4cyjkE';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Supported Gemini models
const GEMINI_MODELS = {
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash'
};

// Health check endpoint
app.get('/api/gemini/health', (req, res) => {
  const isHealthy = !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
  
  res.json({ 
    status: isHealthy ? 'healthy' : 'unhealthy',
    service: 'Gemini AI Service',
    models: Object.keys(GEMINI_MODELS),
    apiKeyConfigured: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here',
    timestamp: new Date().toISOString()
  });
});

// Generate content with Gemini
app.post('/api/gemini/generate', async (req, res) => {
  const { prompt, model = 'gemini-2.0-flash', maxTokens = 1024, temperature = 0.7 } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  if (!GEMINI_MODELS[model]) {
    return res.status(400).json({ 
      error: 'Invalid model. Supported models:', 
      models: Object.keys(GEMINI_MODELS) 
    });
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(500).json({ 
      error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
    });
  }

  try {
    const response = await axios.post(
      `${GEMINI_BASE_URL}/${model}:generateContent`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
      }
    );

    // Extract generated text from response
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usageMetadata = response.data?.usageMetadata || {};

    res.json({ 
      success: true,
      generatedText,
      model,
      usage: usageMetadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      res.status(400).json({ 
        error: 'Invalid request to Gemini API',
        details: error.response.data?.error?.message || 'Bad request'
      });
    } else if (error.response?.status === 403) {
      res.status(403).json({ 
        error: 'API key invalid or quota exceeded',
        details: error.response.data?.error?.message || 'Forbidden'
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Too many requests to Gemini API'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate content from Gemini API',
        details: error.message || 'Internal server error'
      });
    }
  }
});

// AI Credit Scoring endpoint for lending protocol
app.post('/api/gemini/credit-score', async (req, res) => {
  const { userAddress, transactionHistory, collateralValue, loanAmount, chain } = req.body;
  
  if (!userAddress) {
    return res.status(400).json({ error: 'Missing user address' });
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(500).json({ 
      error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
    });
  }

  const prompt = `Analyze the following DeFi lending profile and provide a credit score (0-100) with risk assessment:

User Address: ${userAddress}
Chain: ${chain || 'Multiple'}
Collateral Value: $${collateralValue || 'Unknown'}
Loan Amount: $${loanAmount || 'Unknown'}
Transaction History: ${JSON.stringify(transactionHistory || [], null, 2)}

Please provide:
1. Credit Score (0-100)
2. Risk Level (Low/Medium/High)
3. Key Risk Factors
4. Recommendations for improvement
5. Maximum recommended loan amount

Format as JSON with fields: creditScore, riskLevel, riskFactors, recommendations, maxLoanAmount`;

  try {
    const response = await axios.post(
      `${GEMINI_BASE_URL}/gemini-2.0-flash:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.3,
          topP: 0.8
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to parse JSON response, fallback to text if parsing fails
    let creditAnalysis;
    try {
      creditAnalysis = JSON.parse(generatedText);
    } catch (parseError) {
      creditAnalysis = {
        creditScore: 75,
        riskLevel: 'Medium',
        riskFactors: ['Unable to parse AI response'],
        recommendations: ['Contact support for detailed analysis'],
        maxLoanAmount: collateralValue * 0.5 || 0,
        rawResponse: generatedText
      };
    }

    res.json({ 
      success: true,
      creditAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Credit scoring error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate credit score',
      details: error.message || 'Internal server error'
    });
  }
});

// Risk Assessment endpoint for portfolio analysis
app.post('/api/gemini/risk-assessment', async (req, res) => {
  const { portfolio, marketConditions, userPreferences } = req.body;
  
  if (!portfolio) {
    return res.status(400).json({ error: 'Missing portfolio data' });
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(500).json({ 
      error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
    });
  }

  const prompt = `Analyze this DeFi portfolio for risk assessment:

Portfolio: ${JSON.stringify(portfolio, null, 2)}
Market Conditions: ${JSON.stringify(marketConditions || {}, null, 2)}
User Risk Tolerance: ${userPreferences?.riskTolerance || 'Medium'}

Provide a comprehensive risk analysis including:
1. Overall Risk Score (1-10)
2. Risk Categories (Market, Smart Contract, Liquidity, etc.)
3. Specific Threats Identified
4. Risk Mitigation Strategies
5. Portfolio Optimization Recommendations

Format as JSON with fields: riskScore, riskCategories, threats, mitigation, optimization`;

  try {
    const response = await axios.post(
      `${GEMINI_BASE_URL}/gemini-2.0-flash:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1200,
          temperature: 0.2,
          topP: 0.8
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
      }
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let riskAnalysis;
    try {
      riskAnalysis = JSON.parse(generatedText);
    } catch (parseError) {
      riskAnalysis = {
        riskScore: 5,
        riskCategories: ['Unable to parse AI response'],
        threats: ['Contact support for detailed analysis'],
        mitigation: ['Review portfolio with professional'],
        optimization: ['Diversify holdings'],
        rawResponse: generatedText
      };
    }

    res.json({ 
      success: true,
      riskAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Risk assessment error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate risk assessment',
      details: error.message || 'Internal server error'
    });
  }
});

// Batch processing endpoint for multiple AI requests
app.post('/api/gemini/batch', async (req, res) => {
  const { requests } = req.body;
  
  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid requests array' });
  }

  if (requests.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 requests allowed per batch' });
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return res.status(500).json({ 
      error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
    });
  }

  const results = [];
  
  for (const request of requests) {
    try {
      const { prompt, model = 'gemini-2.0-flash' } = request;
      
      if (!prompt) {
        results.push({ error: 'Missing prompt', request });
        continue;
      }

      const response = await axios.post(
        `${GEMINI_BASE_URL}/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.5
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY,
          },
        }
      );

      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      results.push({ success: true, generatedText, request });

    } catch (error) {
      results.push({ 
        error: 'Request failed', 
        details: error.message,
        request 
      });
    }
  }

  res.json({ 
    success: true,
    results,
    timestamp: new Date().toISOString()
  });
});

// Configuration endpoint
app.get('/api/gemini/config', (req, res) => {
  res.json({
    models: Object.keys(GEMINI_MODELS),
    defaultModel: 'gemini-2.0-flash',
    maxTokens: 8192,
    temperature: 0.7,
    apiKeyConfigured: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 4006;
app.listen(PORT, () => {
  console.log(`🚀 Gemini AI Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/gemini/health`);
  console.log(`🤖 Generate content: POST http://localhost:${PORT}/api/gemini/generate`);
  console.log(`💳 Credit scoring: POST http://localhost:${PORT}/api/gemini/credit-score`);
  console.log(`⚠️  Risk assessment: POST http://localhost:${PORT}/api/gemini/risk-assessment`);
  console.log(`📦 Batch processing: POST http://localhost:${PORT}/api/gemini/batch`);
  console.log(`⚙️  Configuration: GET http://localhost:${PORT}/api/gemini/config`);
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️  GEMINI_API_KEY not configured. Set environment variable for full functionality.');
  } else {
    console.log('✅ Gemini API key configured');
  }
});
