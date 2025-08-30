#!/bin/bash

echo "🚀 Starting AEGIS Revenue Server..."
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/revenueServer.js" ]; then
    echo "❌ revenueServer.js not found. Please run this script from the project root."
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if express and cors are installed
if ! npm list express &> /dev/null; then
    echo "📦 Installing Express..."
    npm install express
fi

if ! npm list cors &> /dev/null; then
    echo "📦 Installing CORS..."
    npm install cors
fi

echo "✅ Dependencies checked and installed"
echo ""

# Start the revenue server
echo "🌐 Starting AEGIS Revenue Server on port 4001..."
echo "📊 Revenue API will be available at: http://localhost:4001/api/revenue"
echo "🔍 Health check at: http://localhost:4001/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node revenueServer.js
