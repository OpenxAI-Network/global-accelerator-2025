# 🚀 Vibe Trading AI - Base Mini App

> **A production-ready Base Mini App for AI-powered trading signals - perfect for beginners learning to code!**

## ✅ **What This App Does:**

- **🔗 Real Base Mini App** - Uses Coinbase OnchainKit MiniKit
- **💰 Real trading functionality** - Integrates with Base chain trading
- **📊 Real price feeds** - Chainlink price feeds + local database for Base chain tokens
- **🗄️ Real database** - PostgreSQL with real price history and sentiment
- **🤖 AI sentiment analysis** - Ollama analyzes Farcaster social posts about $ETH
- **📱 Base Mini App ready** - MiniKit integration prepared

## 🎯 Quick Start Checklist (For Noobs!)

| Step | What to do | Status |
|------|------------|---------|
| 1️⃣ | Install [Docker Desktop](https://docker.com) | ⬜ |
| 2️⃣ | Install [Node.js](https://nodejs.org) | ⬜ |
| 3️⃣ | Clone this repo | ⬜ |
| 4️⃣ | Run `make start` | ⬜ |
| 5️⃣ | Open http://localhost:3000 | ⬜ |

**🎉 That's it! Everything else installs automatically!**

---

## 🚀 Getting Started (Super Simple!)

### Step 1: Install the Basics
1. **Docker Desktop** - [Download & Install](https://docker.com)
2. **Node.js** - [Download & Install](https://nodejs.org)

### Step 2: Get the Code
```bash
git clone <your-repo>
cd demo-app-BASE-MINIAPP-template
```

### Step 3: Start Everything
```bash
make start
```

### Step 4: Open Your App
Go to http://localhost:3000 in your browser

**🎯 That's literally it! The Makefile does everything else automatically.**

---

## 🎯 What This App Does (Step by Step):

1. **📱 Collects social posts** from Farcaster about $ETH tokens
2. **🤖 Analyzes sentiment** using Ollama AI (positive/negative/neutral)
3. **💾 Stores everything** in PostgreSQL database
4. **📊 Shows real-time charts** with price and sentiment data
5. **💰 Integrates trading** with Base chain through MiniKit
6. **🔄 Updates automatically** every few minutes

**This is perfect for learning how real apps work!**

## 🆘 For Complete Beginners (Uni Student Friendly!)

> **🎉 Good news! This project automatically installs everything you need!**

If you're new to development, don't worry - the setup is designed to be as simple as possible:

### What You Need to Install First (One-time setup):
1. **Docker Desktop** - Download from [docker.com](https://docker.com) and install
2. **Node.js** - Download from [nodejs.org](https://nodejs.org) and install
3. **Git** - Usually comes with your computer, or download from [git-scm.com](https://git-scm.com)

### What Gets Installed Automatically:
- ✅ **All project dependencies** (npm packages)
- ✅ **Database setup** (PostgreSQL tables)
- ✅ **Sample data** (price history, etc.)
- ✅ **Everything else** needed to run the app

### The Magic Command:
```bash
make start
```

**That's it!** This one command will:
1. Check if Docker is running
2. Install all npm packages automatically
3. Set up the database with sample data
4. Start the website
5. Show you the status of everything

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js      │◄──►│   (PostgreSQL)  │
│                 │    │    API Routes)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ollama        │    │   Price Service │    │   Cache Layer   │
│   (Local AI)    │    │   (Chainlink)   │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔗 **Data Sources & Storage:**

- **📊 Chainlink Price Feeds** - Gets real-time $ETH prices directly from Base chain
- **📱 Farcaster API** - Collects social posts about $ETH (free, no key needed)
- **🤖 Ollama AI** - Analyzes sentiment of each post (local, no key needed)
- **🗄️ PostgreSQL** - Stores everything (posts, sentiment, prices)
- **📱 Base Mini App** - Connects to Base chain for trading

## 🤖 **How AI Sentiment Analysis Works:**

### **Step 1: Collect Social Data**
- The app automatically searches Farcaster for posts containing "$ETH"
- Finds posts like: "ETH is going to the moon! 🚀" or "ETH looking bearish today 📉"
- Collects about 100-200 posts every few hours

### **Step 2: AI Analysis**
- **Ollama AI** reads each post and determines if it's:
  - 🟢 **Positive** (bullish, excited, optimistic)
  - 🔴 **Negative** (bearish, worried, pessimistic)  
  - ⚪ **Neutral** (just mentioning ETH, no clear sentiment)

### **Step 3: Store in Database**
- Each post gets stored in PostgreSQL with:
  - The original text
  - AI sentiment score
  - Timestamp
  - Author information
  - Price at that moment

### **Step 4: Display on Charts**
- The frontend shows price charts with **sentiment dots**
- Green dots = positive posts, Red dots = negative posts
- You can see how social sentiment relates to price movements!

**This is how real trading apps work - they analyze social media to predict market moves!**

## 🔧 **Environment Variables:**

Before starting, you need to set up your environment variables. Copy the example file and fill in your values:

```bash
cp env.example .env.local
```

### **Required Variables:**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | Local: `postgresql://postgres:password@localhost:5432/vibe_trading` |
| `BASE_RPC_URL` | Base chain RPC endpoint | Free: `https://mainnet.base.org` (rate limited)<br/>Paid: Alchemy/Infura |
| `CHAINLINK_BASE_ETH_USD` | Chainlink ETH/USD price feed | Visit [Chainlink docs](https://docs.chain.link/data-feeds/price-feeds/addresses?network=base) |

### **Optional Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | App base URL for API calls | `http://localhost:3000` |

### **Not Needed (Legacy APIs Removed):**

- ❌ `NEYNAR_API_KEY` - Neynar search API removed
- ❌ `FARCASTER_*` - Farcaster integration removed

## 🚀 Quick Start

### **Step 1: Start the App**
```bash
# Start everything (database + frontend)
make start-daemon

# Or start step by step:
make start-db        # Start PostgreSQL database
make start-frontend  # Start Next.js frontend
```

### **Step 2: Initialize Database (IMPORTANT!)**
```bash
# Create clean database schema (run this ONCE after starting database)
npm run init-db
```

### **Step 3: Populate with Real Data**
```bash
# Get ETH price history for the past hour (every minute)
npm run populate-eth-prices

# Get recent Farcaster posts about $ETH
npm run pull-eth-data

# CRITICAL: Sync mentions with price data (ensures sentiment dots plot correctly)
npm run sync-mentions-prices

# Check if data was stored
npm run check-db
```

### **Step 4: View Your App**
- 🌐 **Frontend**: http://localhost:3000
- 🗄️ **Database**: localhost:5432
- 🤖 **Ollama**: Make sure it's running (ollama serve)

**💡 Note**: `make start` only creates empty tables. You MUST run the setup scripts to get real data!

### **Why Sentiment Dots Need Price Sync**
The sentiment dots on the chart only appear when we have **both**:
1. **Farcaster mentions** (social posts about $ETH)
2. **Price data** at those exact timestamps

Without the `npm run sync-mentions-prices` step, you'll see mentions but no dots on the chart because the system can't match mention timestamps with price data.

### 🎯 For Noobs: What You'll See
After running `make start`, you should see:
- ✅ Docker is running
- ✅ Ports are available
- ✅ Database started
- ✅ Dependencies installed (this might take a few minutes)
- ✅ Database initialized
- ✅ Frontend started
- 🎉 **Success message with website URL!**

**If anything fails, the error message will tell you exactly what to fix!**

### 🚨 Common Beginner Issues & Solutions

#### "Docker not installed" Error
**Problem**: You see "Docker not installed" when running `make start`
**Solution**: 
1. Go to [docker.com](https://docker.com)
2. Download Docker Desktop for your operating system
3. Install and restart your computer
4. Run `make start` again

#### "Node.js not found" Error
**Problem**: You see "node: command not found" or similar
**Solution**:
1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version (recommended)
3. Install and restart your terminal
4. Run `make start` again

#### "Port already in use" Error
**Problem**: Port 3000 or 5432 is already in use
**Solution**: 
1. The Makefile automatically fixes this! 
2. If it still fails, restart your computer
3. Or run `make clean` then `make start`

#### "Permission denied" Error
**Problem**: You see permission errors on Mac/Linux
**Solution**:
1. Make sure Docker Desktop is running
2. Try running `sudo make start` (enter your password when asked)
3. Or restart Docker Desktop

#### "Database connection failed" Error
**Problem**: Database won't connect
**Solution**:
1. Make sure Docker Desktop is running
2. Wait a few minutes for the database to start
3. Run `make restart` to try again

#### "npm install failed" Error
**Problem**: Dependencies won't install
**Solution**:
1. Check your internet connection
2. Try running `npm install` manually first
3. If using a corporate network, ask IT about npm access
4. Try using a different network (like mobile hotspot)

### 💡 Pro Tips for Beginners
- **First time setup takes 5-10 minutes** - be patient!
- **Keep Docker Desktop running** while developing
- **If something breaks**, just run `make restart`
- **The website will be at** http://localhost:3000
- **All your data is saved** in the Docker container

## 🛠️ Development Workflow

### Starting Development
```bash
# Start everything
make start

# Check status
make status

# View logs
make logs
```

### Stopping Services
```bash
# Stop everything
make stop

# Clean up containers
make clean
```

### Troubleshooting
```bash
# Check database connection
make check-db

# Check frontend status
make check-frontend

# Restart everything
make restart

# Full health check
make health
```

## 🗄️ Database Schema

### **Clean, Scalable Design**
The database is designed to handle multiple tokens and scale efficiently:

#### **Tables**
- **`tokens`** - Token information (ETH, WETH, WBTC, DAI, USDC)
- **`price_history`** - Price data for all tokens at regular intervals
- **`farcaster_casts`** - All Farcaster social posts
- **`token_mentions`** - Links tokens to posts with sentiment analysis

#### **Key Features**
- **Separated concerns** - Prices and mentions are in separate tables
- **Scalable design** - Easy to add new tokens (just insert into `tokens` table)
- **Time-based indexing** - Fast queries by timestamp
- **Foreign key relationships** - Data integrity guaranteed
- **Unique constraints** - Prevents duplicate data

#### **Data Flow**
1. **Token prices** are stored every minute in `price_history`
2. **Farcaster posts** are stored in `farcaster_casts`
3. **Token mentions** link posts to tokens with sentiment
4. **Charts** combine price data with mention timestamps

**This design allows you to see price movements before, during, and after social mentions!**

## 🎨 Customization Guide

### Adding New Tokens
1. **Update price service** to fetch new token data
2. **Add database entries** for the new token
3. **Extend UI components** to display new data

### Integrating New AI Models
1. **Pull model**: `ollama pull <model-name>`
2. **Update OllamaClient** to use new model
3. **Test integration** with sample data

### Adding New Data Sources
1. **Create API client** for the new service
2. **Implement caching** strategy
3. **Update database schema** if needed
4. **Add UI components** to display data

## 🚀 Production Deployment

### Environment Setup
- **Change default passwords**
- **Use environment variables** for all secrets
- **Set up proper SSL/TLS**
- **Configure firewall rules**

### Database Considerations
- **Use managed PostgreSQL** (AWS RDS, Google Cloud SQL)
- **Set up automated backups**
- **Monitor performance** with proper indexes
- **Implement connection pooling**

### Ollama in Production
- **Use GPU instances** for better performance
- **Set up model versioning**
- **Monitor resource usage**
- **Implement fallback models**

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
make check-db

# Restart database
make restart-db
```

#### Ollama Not Responding
```bash
# Check Ollama status
ollama list

# Restart Ollama
ollama serve
```

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :5432
lsof -i :3000

# Kill conflicting processes
make clean
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check detailed logs
make logs
```

## 📚 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)

### PostgreSQL
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Library](https://node-postgres.com/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

### Ollama
- [Ollama Documentation](https://ollama.ai/docs)
- [Model Library](https://ollama.ai/library)
- [API Reference](https://github.com/ollama/ollama/blob/main/docs/api.md)

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Base Mini Apps
- [Base Documentation](https://docs.base.org/mini-apps)
- [MiniKit Guide](https://docs.base.org/mini-apps/quickstart/existing-apps/add-minikit)
- [OnchainKit](https://onchainkit.com/)

## 🤝 Contributing

This is a demo app designed to help developers learn. Feel free to:

1. **Fork the repository**
2. **Create feature branches**
3. **Submit pull requests**
4. **Report issues**
5. **Share your own implementations**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Ollama team** for making local AI accessible
- **PostgreSQL community** for the robust database
- **Next.js team** for the amazing React framework
- **Chainlink** for real-time price feeds on Base chain
- **Base team** for the Mini App framework
- **Coinbase** for OnchainKit and MiniKit

---

**Happy building! 🚀**

> This demo shows you can build production-ready AI applications with local models and proper database architecture. Use it as a starting point for your own projects!

**⚠️ Important**: Run `npm run sync-mentions-prices` after pulling Farcaster data to ensure sentiment dots appear on the chart!

## 🔧 Troubleshooting

### **Sentiment Dots Not Showing?**
If you see mentions in the panel but no dots on the chart:

1. **Check the console** - Look for debugging messages about sentiment data
2. **Verify data exists** - Run `npm run check-db` to see mention and price counts
3. **Sync mentions with prices** - Run `npm run sync-mentions-prices` to ensure price data exists for each mention timestamp
4. **Check time range** - Make sure you're viewing a time range that includes your mention data

### **Common Issues**
- **"No social sentiment data" message**: Run the sync script to connect mentions with prices
- **Chart shows but no dots**: Mentions exist but lack corresponding price data
- **Hydration errors**: These are fixed by the client-side rendering in TradingChart
