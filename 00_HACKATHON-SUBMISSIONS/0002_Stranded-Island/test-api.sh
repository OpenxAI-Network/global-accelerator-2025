#!/bin/bash

echo "🧪 Testing Stranded Island Adventure API..."
echo "=========================================="
echo ""

# Check if the app is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ App is not running. Please start the app first with:"
    echo "   cd nextjs-app && npm run dev"
    echo ""
    echo "   Or use the start script: ./start.sh"
    exit 1
fi

echo "✅ App is running on http://localhost:3000"
echo ""

# Test the chat API endpoint
echo "📡 Testing chat API endpoint..."
echo ""

TEST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I want to start the adventure!",
    "storyState": {
      "inventory": [],
      "milestones": [],
      "choices": [],
      "currentLocation": "Unknown Shore",
      "health": 100,
      "relationships": {}
    }
  }')

if [ $? -eq 0 ]; then
    echo "✅ API endpoint is working!"
    echo ""
    echo "📝 Response preview:"
    echo "$TEST_RESPONSE" | head -c 200
    echo "..."
    echo ""
    echo "🎮 You can now play the game in your browser!"
else
    echo "❌ API endpoint test failed"
    echo "   Response: $TEST_RESPONSE"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Make sure Ollama is running: ollama serve"
    echo "   2. Check if the model is available: ollama list"
    echo "   3. Verify the app is running: npm run dev"
fi
