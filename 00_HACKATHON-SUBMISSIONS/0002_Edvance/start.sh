#!/bin/bash

echo "🚀 Starting AI Discussion Forum..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running. Please start Ollama with: ollama serve"
    echo "   Then pull the model with: ollama pull llama3.2:1b"
fi

# Start the database
echo "📦 Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check database connection
echo "🔍 Testing database connection..."
curl -s http://localhost:3000/api/test-db > /dev/null 2>&1

# Install dependencies if needed
if [ ! -d "nextjs-app/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd nextjs-app
    npm install --legacy-peer-deps
    cd ..
fi

# Start the application
echo "🌐 Starting the application..."
cd nextjs-app
npm run dev








