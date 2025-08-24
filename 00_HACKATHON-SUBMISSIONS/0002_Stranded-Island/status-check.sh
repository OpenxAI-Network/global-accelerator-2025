#!/bin/bash

echo "🔍 Stranded Island Adventure - Status Check"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "nextjs-app/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: 00_HACKATHON-SUBMISSIONS/0002_Stranded-Island"
    exit 1
fi

echo "📍 Project Location: $(pwd)"
echo ""

# Check Node.js
echo "🔧 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Check Ollama
echo "🤖 Checking Ollama..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama installed"
    
    # Check if Ollama is running
    if ollama list &> /dev/null; then
        echo "✅ Ollama service running"
        
        # Check for required model
        if ollama list | grep -q "llama3.2:1b"; then
            echo "✅ Required model (llama3.2:1b) available"
        else
            echo "⚠️  Required model not found. Run: ollama pull llama3.2:1b"
        fi
    else
        echo "⚠️  Ollama service not running. Start with: ollama serve"
    fi
else
    echo "❌ Ollama not installed. Visit: https://ollama.ai/"
fi

echo ""

# Check project dependencies
echo "📚 Checking project dependencies..."
cd nextjs-app

if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies missing. Run: npm install --legacy-peer-deps"
    exit 1
fi

# Check TypeScript
echo "🔍 Checking TypeScript compilation..."
if npm run typecheck &> /dev/null; then
    echo "✅ TypeScript compilation passed"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Check build
echo "🏗️ Checking build process..."
if npm run build &> /dev/null; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""

# Check if server is running
echo "🌐 Checking development server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Development server running on http://localhost:3000"
    
    # Test API endpoint
    echo "🧪 Testing API endpoint..."
    API_RESPONSE=$(curl -s -X POST http://localhost:3000/api/chat \
      -H "Content-Type: application/json" \
      -d '{"message":"test","storyState":{"currentMilestone":1}}')
    
    if [ $? -eq 0 ]; then
        echo "✅ API endpoint working"
        echo "📝 Response preview:"
        echo "$API_RESPONSE" | head -c 150
        echo "..."
    else
        echo "❌ API endpoint failed"
    fi
else
    echo "⚠️  Development server not running"
    echo "   Start with: cd nextjs-app && npm run dev"
fi

echo ""
echo "🎯 Status Summary:"
echo "=================="

# Count successes and failures
SUCCESS_COUNT=0
FAILURE_COUNT=0

if command -v node &> /dev/null; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); else FAILURE_COUNT=$((FAILURE_COUNT + 1)); fi
if command -v npm &> /dev/null; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); else FAILURE_COUNT=$((FAILURE_COUNT + 1)); fi
if command -v ollama &> /dev/null; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); else FAILURE_COUNT=$((FAILURE_COUNT + 1)); fi
if [ -d "node_modules" ]; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); else FAILURE_COUNT=$((FAILURE_COUNT + 1)); fi
if curl -s http://localhost:3000 > /dev/null; then SUCCESS_COUNT=$((SUCCESS_COUNT + 1)); else FAILURE_COUNT=$((FAILURE_COUNT + 1)); fi

echo "✅ Working components: $SUCCESS_COUNT"
echo "❌ Issues found: $FAILURE_COUNT"

if [ $FAILURE_COUNT -eq 0 ]; then
    echo ""
    echo "🎉 All systems operational! The Stranded Island Adventure is ready to play!"
    echo "🌐 Open http://localhost:3000 in your browser to start your adventure!"
else
    echo ""
    echo "🔧 Some issues detected. Use the fix scripts:"
    echo "   - ./fix-webpack.sh (for webpack errors)"
    echo "   - ./fix-complete.sh (for all issues)"
    echo "   - See TROUBLESHOOTING.md for detailed solutions"
fi

echo ""
echo "📚 For help, see: TROUBLESHOOTING.md"
echo "🧪 For testing, see: test-api.sh and test-story-progression.sh"
