# Aegis AI - Google Gemini AI Integration

This document provides comprehensive information about the Google Gemini AI integration in the Aegis AI Liquid Vault system.

## 🎯 Overview

The Aegis AI system integrates Google's Gemini AI models to provide intelligent, AI-powered features including:

- **Risk Assessment**: AI-powered portfolio risk analysis
- **Security Alerts**: Intelligent threat detection and alerts
- **Transaction Analysis**: Real-time transaction security analysis
- **Portfolio Insights**: AI-generated investment recommendations
- **Strategy Recommendations**: Personalized DeFi strategy suggestions
- **Natural Language Processing**: Conversational AI assistance

## 🚀 Quick Start

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key for configuration

### 2. Setup Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your API keys
nano .env
```

Update these key variables:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL_NAME=gemini-2.0-flash
```

### 3. Run Setup Script

```bash
# Make script executable
chmod +x scripts/setup-gemini-ai.sh

# Run setup
./scripts/setup-gemini-ai.sh
```

### 4. Start Services

```bash
# Start all Gemini AI services
./start-gemini-ai.sh
```

### 5. Test Integration

```bash
# Test all AI endpoints
./test-gemini-ai.sh
```

## 🏗️ Architecture

### Service Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Aegis AI Architecture                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend Components                                        │
│  ├── AegisAI.tsx                                           │
│  ├── ContextualAIAssistance.tsx                            │
│  └── useAIAssistant.ts                                     │
├─────────────────────────────────────────────────────────────┤
│  Backend AI Service                                         │
│  ├── services/ai.js (Gemini Integration)                   │
│  ├── routes/ai.js (API Endpoints)                          │
│  └── geminiService.js (Standalone Service)                 │
├─────────────────────────────────────────────────────────────┤
│  Google Gemini AI                                           │
│  ├── gemini-2.0-flash (Fast, Efficient)                   │
│  ├── gemini-1.5-pro (Advanced Reasoning)                  │
│  └── gemini-1.5-flash (Balanced Performance)              │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints

#### Main Backend AI Routes (`/api/ai/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/insights` | GET | Get AI-generated portfolio insights |
| `/alerts` | GET | Get security alerts |
| `/chat` | POST | AI chat endpoint |
| `/portfolio-insights` | POST | Generate portfolio insights |
| `/strategy-recommendations` | POST | Get strategy recommendations |
| `/risk-analysis` | POST | Analyze transaction risk |
| `/status` | GET | AI service status |
| `/test-gemini` | POST | Test Gemini AI directly |

#### Standalone Gemini Service (`/api/gemini/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/generate` | POST | Generate content |
| `/credit-score` | POST | Generate credit scores |
| `/risk-assessment` | POST | Portfolio risk assessment |
| `/batch` | POST | Batch processing |
| `/config` | GET | Service configuration |

## 🔧 Configuration

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
GEMINI_MODEL_NAME=gemini-2.0-flash
GEMINI_MAX_TOKENS=8192
GEMINI_TEMPERATURE=0.1
GEMINI_TOP_P=0.8
```

### Model Selection

| Model | Use Case | Performance | Cost |
|-------|----------|-------------|------|
| `gemini-2.0-flash` | General purpose, fast responses | ⚡⚡⚡ | 💰 |
| `gemini-1.5-pro` | Complex reasoning, analysis | ⚡⚡ | 💰💰 |
| `gemini-1.5-flash` | Balanced performance | ⚡⚡⚡ | 💰💰 |

## 📱 Frontend Usage

### AI Assistant Hook

```tsx
import { useAIAssistant } from '../hooks/useAIAssistant';

const { sendMessage, getPortfolioInsights, analyzeRisk, isLoading, error } = useAIAssistant();

// Send a message to AI
const handleSendMessage = async () => {
  try {
    const response = await sendMessage("Analyze my portfolio risk", {
      portfolio: portfolioData,
      context: "risk-assessment"
    });
    
    console.log('AI Response:', response.content);
  } catch (err) {
    console.error('AI Error:', err);
  }
};
```

### AI Components

#### AegisAI Component
```tsx
import AegisAI from '../components/AegisAI';

<AegisAI 
  messages={conversation}
  onSendMessage={handleSendMessage}
/>
```

#### Contextual AI Assistance
```tsx
import ContextualAIAssistance from '../components/ContextualAIAssistance';

<ContextualAIAssistance
  context={{
    portfolio: portfolioData,
    userProfile: userProfile,
    marketData: marketData
  }}
  onAction={handleAIAction}
/>
```

## 🔌 Backend Integration

### AI Service Usage

```javascript
import { AIService } from './services/ai.js';

const aiService = new AIService();

// Risk assessment
const riskAnalysis = await aiService.getRiskAssessment(userId, portfolio);

// Security alerts
const alerts = await aiService.getSecurityAlerts(userId);

// Transaction analysis
const txAnalysis = await aiService.analyzeTransaction(txData);

// Portfolio insights
const insights = await aiService.getPortfolioInsights(portfolioData, context);
```

### Custom AI Prompts

```javascript
// Generate custom content
const response = await aiService.generateContent(prompt, {
  maxTokens: 1000,
  temperature: 0.3,
  topP: 0.8
});
```

## 🧪 Testing

### Manual Testing

```bash
# Test Gemini service health
curl http://localhost:4006/api/gemini/health

# Test content generation
curl -X POST http://localhost:4006/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain DeFi", "maxTokens": 100}'

# Test main backend AI
curl http://localhost:3001/api/ai/status
curl http://localhost:3001/api/ai/insights
```

### Automated Testing

```bash
# Run the test script
./test-gemini-ai.sh

# Run specific tests
npm test -- --grep "AI"
```

## 📊 Monitoring & Debugging

### Health Checks

- **Gemini Service**: `http://localhost:4006/api/gemini/health`
- **Main Backend**: `http://localhost:3001/health`
- **AI Status**: `http://localhost:3001/api/ai/status`

### Logs

```bash
# View Gemini service logs
tail -f backend/gemini.log

# View main backend logs
tail -f aegis-boilerplate/backend/server.log
```

### Error Handling

The system includes comprehensive error handling:

- **API Key Issues**: Clear error messages for missing/invalid keys
- **Rate Limiting**: Automatic retry and fallback mechanisms
- **Model Failures**: Fallback to mock responses when AI is unavailable
- **Network Issues**: Graceful degradation and error reporting

## 🔒 Security Features

### Safety Settings

```javascript
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
```

### Input Validation

- Prompt length limits
- Content filtering
- Rate limiting per user
- Input sanitization

## 🚀 Performance Optimization

### Caching

- Response caching for repeated queries
- Model response optimization
- Batch processing for multiple requests

### Token Management

- Dynamic token allocation based on request complexity
- Efficient prompt engineering
- Response length optimization

## 🔄 Integration Examples

### DeFi Risk Analysis

```javascript
const riskPrompt = `Analyze this DeFi portfolio for risk assessment:

Portfolio: ${JSON.stringify(portfolio, null, 2)}
Market Conditions: ${JSON.stringify(marketData, null, 2)}

Provide risk analysis including:
1. Overall Risk Score (1-100)
2. Risk Categories
3. Specific Threats
4. Mitigation Strategies
5. Recommendations

Format as JSON.`;

const riskAnalysis = await aiService.generateContent(riskPrompt, {
  maxTokens: 1500,
  temperature: 0.2
});
```

### Transaction Security

```javascript
const securityPrompt = `Analyze this blockchain transaction for security risks:

Transaction: ${JSON.stringify(txData, null, 2)}

Provide security analysis including:
1. Risk Level (low/medium/high)
2. Confidence Score (0-1)
3. Security Recommendation
4. Potential Flags
5. Gas Fee Analysis

Format as JSON.`;

const securityAnalysis = await aiService.generateContent(securityPrompt, {
  maxTokens: 1200,
  temperature: 0.1
});
```

## 📚 Advanced Features

### Batch Processing

```javascript
// Process multiple AI requests efficiently
const batchResponse = await fetch('/api/gemini/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requests: [
      { prompt: "Analyze ETH risk", model: "gemini-2.0-flash" },
      { prompt: "BTC market analysis", model: "gemini-2.0-flash" },
      { prompt: "DeFi strategy", model: "gemini-1.5-pro" }
    ]
  })
});
```

### Context-Aware Responses

```javascript
// Provide context for better AI responses
const response = await sendMessage("What should I do with my portfolio?", {
  portfolio: {
    assets: ['ETH', 'BTC', 'MATIC'],
    values: [5000, 3000, 1000],
    riskTolerance: 'medium'
  },
  marketData: {
    volatility: 'high',
    trend: 'bullish',
    gasFees: 'moderate'
  }
});
```

## 🐛 Troubleshooting

### Common Issues

#### 1. API Key Not Working
```bash
# Check environment variable
echo $GEMINI_API_KEY

# Verify .env file
cat .env | grep GEMINI_API_KEY

# Test API key directly
curl -H "X-goog-api-key: YOUR_KEY" \
  "https://generativelanguage.googleapis.com/v1beta/models"
```

#### 2. Service Not Starting
```bash
# Check ports
netstat -tulpn | grep :4006
netstat -tulpn | grep :3001

# Check logs
tail -f backend/geminiService.js.log
```

#### 3. AI Responses Not Working
```bash
# Test health endpoints
curl http://localhost:4006/api/gemini/health
curl http://localhost:3001/api/ai/status

# Check API responses
curl -X POST http://localhost:4006/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "maxTokens": 50}'
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=debug

# Restart services
./start-gemini-ai.sh
```

## 📈 Scaling & Production

### Production Deployment

```bash
# Use PM2 for process management
npm install -g pm2

# Start services with PM2
pm2 start backend/geminiService.js --name "gemini-ai"
pm2 start aegis-boilerplate/backend/server.js --name "aegis-backend"

# Monitor services
pm2 monit
pm2 logs
```

### Load Balancing

- Multiple Gemini service instances
- API key rotation
- Rate limiting per instance
- Health check monitoring

### Monitoring

- Response time metrics
- Error rate tracking
- Token usage monitoring
- Cost optimization

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd aegis-ai-liquid-vault

# Install dependencies
npm install

# Setup environment
cp env.example .env

# Run development mode
npm run dev
```

### Testing New Features

```bash
# Run tests
npm test

# Run specific AI tests
npm test -- --grep "AI"

# Run integration tests
npm run test:integration
```

## 📞 Support

### Getting Help

1. **Documentation**: Check this README and related docs
2. **Issues**: Create GitHub issues for bugs
3. **Discussions**: Use GitHub discussions for questions
4. **Community**: Join our Discord/Telegram channels

### Useful Links

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Aegis AI Documentation](README-AI-AGENT.md)
- [Project Issues](https://github.com/your-repo/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎯 Ready to get started?** Run `./scripts/setup-gemini-ai.sh` to begin!
