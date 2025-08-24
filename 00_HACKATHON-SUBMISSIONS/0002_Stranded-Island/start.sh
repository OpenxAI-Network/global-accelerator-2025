#!/bin/bash

echo "🏝️ Welcome to Stranded Island Adventure! 🏝️"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.17+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18.17+ is required. Current version: $(node -v)"
    echo "   Please update Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install Ollama first."
    echo "   Visit: https://ollama.ai/"
    exit 1
fi

echo "✅ Ollama is installed"

# Check if Ollama is running
if ! ollama list &> /dev/null; then
    echo "🔄 Starting Ollama service..."
    ollama serve &
    sleep 5
fi

# Check if required model is available
if ! ollama list | grep -q "llama3.2:1b"; then
    echo "📥 Downloading required Ollama model (llama3.2:1b)..."
    echo "   This may take a few minutes depending on your internet connection."
    ollama pull llama3.2:1b
fi

echo "✅ Required model is available"

# Navigate to the app directory
cd nextjs-app

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (this may take a moment)..."
    npm install --legacy-peer-deps
fi

echo "✅ Dependencies are installed"
echo ""
echo "🚀 Starting the adventure game..."
echo "   The game will open in your browser at: http://localhost:3000"
echo ""
echo "   Press Ctrl+C to stop the game when you're done playing."
echo ""

# Start the development server
npm run dev
