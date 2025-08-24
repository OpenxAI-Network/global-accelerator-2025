#!/bin/bash

echo "🔧 Complete Next.js Fix Script"
echo "=============================="
echo ""

echo "🚨 This script will fix common Next.js errors including:"
echo "   - Webpack module errors"
echo "   - Missing .next files (ENOENT errors)"
echo "   - Build cache corruption"
echo "   - Dependency conflicts"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Fix cancelled"
    exit 1
fi

echo "🧹 Step 1: Cleaning everything..."
cd nextjs-app

# Stop any running processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Remove all build artifacts and dependencies
rm -rf .next
rm -rf node_modules
rm -rf .swc
rm package-lock.json

echo "✅ Cleanup complete"
echo ""

echo "📦 Step 2: Fresh dependency installation..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed"
    echo "🔧 Try: npm cache clean --force"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

echo "🔍 Step 3: Type checking..."
npm run typecheck

if [ $? -ne 0 ]; then
    echo "❌ Type checking failed - fixing code issues first"
    exit 1
fi

echo "✅ Type checking passed"
echo ""

echo "🏗️ Step 4: Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

echo "🚀 Step 5: Starting development server..."
echo "   Server will start in background..."
echo ""

# Start dev server in background
npm run dev &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

echo "🔍 Step 6: Testing server..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running successfully!"
    echo ""
    echo "🎉 All issues fixed! The Stranded Island Adventure is ready to play!"
    echo "🌐 Open http://localhost:3000 in your browser"
    echo ""
    echo "🧪 Test the API:"
    echo "   curl -X POST http://localhost:3000/api/chat \\"
    echo "     -H \"Content-Type: application/json\" \\"
    echo "     -d '{\"message\":\"test\",\"storyState\":{\"currentMilestone\":1}}'"
else
    echo "❌ Server failed to start"
    echo ""
    echo "🔧 Manual troubleshooting required:"
    echo "   1. Check terminal for error messages"
    echo "   2. Verify Ollama is running: ollama list"
    echo "   3. Check port 3000: lsof -ti:3000"
    echo "   4. Try different port: PORT=3001 npm run dev"
fi

echo ""
echo "💡 If you encounter issues again, run this script: ./fix-complete.sh"
echo "📚 For detailed troubleshooting, see: TROUBLESHOOTING.md"
