# 🔥 Vibe Trading AI - AEGIS Integration

A production-ready AI-powered trading signals system integrated into the AEGIS AI Liquid Vault platform. This feature provides real-time sentiment analysis, price charts, and trading insights powered by Base chain, Farcaster social data, and Ollama AI.

## ✨ Features

- **🤖 AI Sentiment Analysis**: Ollama AI analyzes Farcaster social posts for trading insights
- **📊 Real-time Charts**: Interactive price charts with sentiment correlation dots
- **🔗 Base Chain Integration**: Seamless integration with Base chain for real trading
- **📱 Mobile-First Design**: Optimized for mobile devices and Base Mini App
- **💾 Smart Database**: PostgreSQL backend for comprehensive data storage
- **⚡ Live Updates**: Real-time data updates every few minutes

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

### 3. Initialize Database

```bash
npm run init-db
```

### 4. Populate with Data

```bash
# Generate ETH price history
npm run populate-eth-prices

# Collect Farcaster social data
npm run pull-eth-data

# Sync mentions with price data (IMPORTANT!)
npm run sync-mentions-prices
```

### 5. Check System Status

```bash
npm run check-db
```

### 6. Start Development Server

```bash
npm run dev
```

### 7. Access Vibe Trading AI

Navigate to: `http://localhost:3000/vibe-trading`

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (React/Vite)  │◄──►│   (Vite Dev)    │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ollama        │    │   Price Service │    │   Cache Layer   │
│   (Local AI)    │    │   (Mock Data)   │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Database Schema

### Tables

- **`tokens`**: Available trading tokens (ETH, WETH, USDC, etc.)
- **`price_history`**: Historical price data with timestamps
- **`farcaster_casts`**: Social media posts from Farcaster
- **`token_mentions`**: AI sentiment analysis results

### Key Features

- Separated concerns for scalability
- Time-based indexing for fast queries
- Foreign key relationships for data integrity
- Unique constraints to prevent duplicates

## 🔧 Scripts Reference

### Database Management

```bash
# Initialize database schema
npm run init-db

# Check database health and status
npm run check-db
```

### Data Population

```bash
# Generate ETH price data (last hour, every minute)
npm run populate-eth-prices

# Generate historical price data (7 days, every hour)
npm run populate-eth-prices historical

# Start continuous price streaming
npm run populate-eth-prices stream
```

### Social Data Collection

```bash
# Collect Farcaster ETH mentions
npm run pull-eth-data

# Start continuous data collection
npm run pull-eth-data stream
```

### Data Synchronization

```bash
# Sync mentions with price data
npm run sync-mentions-prices

# Validate sync results
npm run sync-mentions-prices validate

# Start continuous sync service
npm run sync-mentions-prices stream
```

## 🎯 Usage Guide

### 1. View Trading Dashboard

The main dashboard shows:
- Real-time ETH price charts
- Social sentiment analysis
- Trending mentions from Farcaster
- AI-powered trading insights

### 2. Analyze Sentiment

- Green dots = Positive sentiment
- Red dots = Negative sentiment  
- Gray dots = Neutral sentiment
- Click on dots to view social posts

### 3. Ask AI Assistant

Use the AI Trading Assistant to:
- Get market analysis
- Ask trading questions
- Receive sentiment insights
- Get trading recommendations

### 4. Monitor System Health

The System Status panel shows:
- Database connectivity
- AI service availability
- Price feed status
- Social data collection status

## 🔌 Integration Points

### Base Chain

- Real-time price feeds via Chainlink
- Trading functionality through MiniKit
- Base Mini App compatibility

### Farcaster

- Social sentiment data collection
- Real-time post monitoring
- Community sentiment analysis

### Ollama AI

- Local AI sentiment analysis
- Trading insights generation
- Market trend analysis

## 🛠️ Development

### Adding New Tokens

1. Insert into `tokens` table
2. Update price service
3. Extend UI components
4. Add sentiment analysis

### Customizing AI Models

1. Install new Ollama model: `ollama pull <model-name>`
2. Update OllamaClient configuration
3. Test with sample data
4. Deploy to production

### Extending Data Sources

1. Create API client for new service
2. Implement caching strategy
3. Update database schema if needed
4. Add UI components

## 🚨 Troubleshooting

### Common Issues

**Sentiment dots not showing on charts?**
```bash
npm run sync-mentions-prices
```

**No price data available?**
```bash
npm run populate-eth-prices
```

**Database connection failed?**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env.local
- Run `npm run check-db`

**AI assistant not responding?**
- Check Ollama is running: `ollama serve`
- Verify Ollama model is installed
- Check network connectivity

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check detailed database status
npm run check-db
```

## 📱 Mobile & Base Mini App

### Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Progressive Web App ready
- Base Mini App compatible

### MiniKit Integration

- Base chain wallet connection
- Trading functionality
- Price feed integration
- Social sentiment display

## 🔒 Security & Privacy

### Data Protection

- No private keys stored
- Encrypted database connections
- Rate limiting on API endpoints
- Input validation and sanitization

### Compliance

- GDPR compliant data handling
- User consent management
- Data retention policies
- Audit logging

## 📈 Performance Optimization

### Caching Strategy

- Database query optimization
- Indexed time-based queries
- Connection pooling
- Real-time data streaming

### Scalability

- Horizontal scaling ready
- Load balancing support
- Microservices architecture
- Container deployment ready

## 🚀 Production Deployment

### Environment Setup

1. Use production database
2. Configure SSL/TLS
3. Set up monitoring
4. Enable logging

### Database Considerations

- Use managed PostgreSQL
- Set up automated backups
- Monitor performance
- Implement connection pooling

### AI Model Deployment

- Use GPU instances
- Set up model versioning
- Monitor resource usage
- Implement fallback models

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing

## 📚 Learning Resources

### Technologies Used

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Base Documentation](https://docs.base.org/)
- [MiniKit Guide](https://docs.onchainkit.com/minikit)

### Related Projects

- [AEGIS AI Liquid Vault](https://github.com/your-org/aegis-ai-liquid-vault)
- [Base Mini Apps](https://docs.base.org/mini-apps)
- [Farcaster Protocol](https://docs.farcaster.xyz/)

## 📄 License

This project is part of the AEGIS AI Liquid Vault platform and is available under the MIT License.

## 🙏 Acknowledgments

- Ollama team for local AI capabilities
- PostgreSQL community for robust database
- Base team for Mini App framework
- Coinbase for OnchainKit and MiniKit
- Farcaster for social data protocol

---

**Happy Trading! 🚀📈**

For support, visit: [AEGIS AI Support](https://support.aegis.ai)
