#!/bin/bash

# Aegis Cross-Chain DeFi Boilerplate - Quick Start Script
# This script will help you set up the development environment quickly

set -e

echo "🚀 Aegis Cross-Chain DeFi Boilerplate - Quick Start"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js and try again."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check if Redis is running (optional but recommended)
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is installed but not running. Starting Redis..."
        redis-server --daemonize yes
        sleep 2
        if redis-cli ping &> /dev/null; then
            echo "✅ Redis started successfully"
        else
            echo "⚠️  Could not start Redis. Continuing without Redis..."
        fi
    fi
else
    echo "⚠️  Redis not found. Install Redis for caching and WebSocket support."
    echo "   Ubuntu/Debian: sudo apt-get install redis-server"
    echo "   macOS: brew install redis"
    echo "   Windows: https://redis.io/docs/getting-started/installation/install-redis-on-windows/"
fi

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:4173

# WebSocket
WEBSOCKET_URL=ws://localhost:3001

# AI Service (Get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/aegis
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your_jwt_secret_here
EOF
    echo "✅ Created backend/.env"
else
    echo "✅ backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3001

# AI Service
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
VITE_APP_NAME=Aegis
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ Created frontend/.env"
else
    echo "✅ frontend/.env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed successfully"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/public/sounds

# Download sample notification sounds
echo "🔊 Downloading sample notification sounds..."
cd frontend/public/sounds
if [ ! -f "alert-high.mp3" ]; then
    echo "⚠️  Please add your own notification sound files:"
    echo "   - alert-high.mp3 (for high priority notifications)"
    echo "   - alert-medium.mp3 (for medium priority notifications)"
    echo "   - alert-low.mp3 (for low priority notifications)"
fi
cd ../../..

echo "✅ Directory structure created"

# Display next steps
echo ""
echo "🎉 Setup complete! Here are your next steps:"
echo ""
echo "1. 🔑 Get your Gemini API key:"
echo "   - Visit: https://makersuite.google.com/app/apikey"
echo "   - Add it to both .env files"
echo ""
echo "2. 🚀 Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. 🌐 Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. 🌍 Open your browser:"
echo "   Navigate to: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete setup guide"
echo "   - Component examples in src/components/"
echo "   - API documentation in backend/routes/"
echo ""
echo "🆘 Need help?"
echo "   - Discord: https://discord.gg/aegis"
echo "   - Telegram: https://t.me/aegis_ai"
echo "   - Email: support@aegis.ai"
echo ""
echo "Happy building! 🚀"
