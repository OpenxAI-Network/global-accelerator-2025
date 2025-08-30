import express from 'express';

const router = express.Router();

// Get AI insights
router.get('/insights', async (req, res) => {
  try {
    const aiService = req.app.locals.services.ai;
    const insights = await aiService.getRiskAssessment('default', {
      assets: ['ETH', 'BTC', 'MATIC'],
      values: [5000, 3000, 1000]
    });
    
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get security alerts
router.get('/alerts', async (req, res) => {
  try {
    const aiService = req.app.locals.services.ai;
    const alerts = await aiService.getSecurityAlerts('default');
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat endpoint for AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, context, timestamp } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    const aiService = req.app.locals.services.ai;
    
    // Generate AI response based on message type
    let response;
    if (message.toLowerCase().includes('portfolio') || message.toLowerCase().includes('risk')) {
      response = await aiService.getPortfolioInsights(context?.portfolio || {}, context);
    } else if (message.toLowerCase().includes('strategy') || message.toLowerCase().includes('recommend')) {
      response = await aiService.getStrategyRecommendations(context?.userProfile || {}, context?.marketData || {}, context);
    } else {
      // General chat response
      const prompt = `You are an AI assistant for Aegis, a cross-chain DeFi security platform. 
      User message: ${message}
      Context: ${JSON.stringify(context || {}, null, 2)}
      
      Provide a helpful, informative response about DeFi, security, or blockchain topics.`;
      
      const aiResponse = await aiService.generateContent(prompt, { maxTokens: 800, temperature: 0.3 });
      response = {
        content: aiResponse,
        actions: [],
        insights: [],
        aiGenerated: true,
        timestamp: new Date().toISOString()
      };
    }

    res.json({ 
      success: true, 
      content: response.content,
      actions: response.actions || [],
      insights: response.insights || [],
      aiGenerated: response.aiGenerated || false,
      timestamp: response.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process AI chat request' 
    });
  }
});

// Portfolio insights endpoint
router.post('/portfolio-insights', async (req, res) => {
  try {
    const { portfolioData, context, timestamp } = req.body;
    
    if (!portfolioData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Portfolio data is required' 
      });
    }

    const aiService = req.app.locals.services.ai;
    const insights = await aiService.getPortfolioInsights(portfolioData, context);
    
    res.json({ 
      success: true, 
      content: insights.content,
      actions: insights.actions || [],
      insights: insights.insights || [],
      aiGenerated: insights.aiGenerated || false,
      timestamp: insights.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Portfolio insights error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate portfolio insights' 
    });
  }
});

// Strategy recommendations endpoint
router.post('/strategy-recommendations', async (req, res) => {
  try {
    const { userProfile, marketData, context, timestamp } = req.body;
    
    if (!userProfile || !marketData) {
      return res.status(400).json({ 
        success: false, 
        error: 'User profile and market data are required' 
      });
    }

    const aiService = req.app.locals.services.ai;
    const recommendations = await aiService.getStrategyRecommendations(userProfile, marketData, context);
    
    res.json({ 
      success: true, 
      content: recommendations.content,
      actions: recommendations.actions || [],
      insights: recommendations.insights || [],
      aiGenerated: recommendations.aiGenerated || false,
      timestamp: recommendations.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Strategy recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate strategy recommendations' 
    });
  }
});

// Risk analysis endpoint
router.post('/risk-analysis', async (req, res) => {
  try {
    const { positionData, marketConditions, context, timestamp } = req.body;
    
    if (!positionData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Position data is required' 
      });
    }

    const aiService = req.app.locals.services.ai;
    const riskAnalysis = await aiService.analyzeTransaction({
      ...positionData,
      marketConditions,
      context
    });
    
    res.json({ 
      success: true, 
      content: `Risk analysis completed. Risk level: ${riskAnalysis.risk}`,
      actions: [],
      insights: [{
        type: 'risk',
        content: `Risk level: ${riskAnalysis.risk}, Confidence: ${riskAnalysis.confidence}`,
        confidence: riskAnalysis.confidence
      }],
      aiGenerated: riskAnalysis.aiGenerated || false,
      timestamp: riskAnalysis.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to analyze risk' 
    });
  }
});

// AI service status endpoint
router.get('/status', async (req, res) => {
  try {
    const aiService = req.app.locals.services.ai;
    const status = aiService.getStatus();
    
    res.json({ 
      success: true, 
      data: status 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get AI service status' 
    });
  }
});

// Test Gemini AI endpoint
router.post('/test-gemini', async (req, res) => {
  try {
    const { prompt, model, maxTokens, temperature } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }

    const aiService = req.app.locals.services.ai;
    
    if (!aiService.gemini) {
      return res.status(503).json({ 
        success: false, 
        error: 'Gemini AI not available. Please check your API key configuration.' 
      });
    }

    const response = await aiService.generateContent(prompt, {
      maxTokens: maxTokens || 500,
      temperature: temperature || 0.3
    });
    
    res.json({ 
      success: true, 
      generatedText: response,
      model: aiService.geminiModelName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to test Gemini AI' 
    });
  }
});

export default router;
