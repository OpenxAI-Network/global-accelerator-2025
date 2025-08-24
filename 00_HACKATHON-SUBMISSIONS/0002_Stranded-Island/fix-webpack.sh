#!/bin/bash

echo "🔧 Fixing Webpack Module Error..."
echo "================================="
echo ""

echo "🧹 Cleaning build cache..."
cd nextjs-app

# Remove build cache
rm -rf .next
rm -rf node_modules/.cache

echo "✅ Cache cleared successfully"
echo ""

echo "🚀 Restarting development server..."
echo "   The server will start in a few seconds..."
echo ""

# Start dev server in background
npm run dev &

# Wait for server to start
sleep 8

echo "🔍 Testing server status..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "🌐 Open http://localhost:3000 in your browser"
    echo ""
    echo "🎮 The Stranded Island Adventure should now work without webpack errors!"
else
    echo "❌ Server failed to start. Check the terminal for errors."
    echo ""
    echo "🔧 Try these additional steps:"
    echo "   1. Check if port 3000 is in use: lsof -ti:3000"
    echo "   2. Kill conflicting processes: kill -9 \$(lsof -ti:3000)"
    echo "   3. Restart manually: npm run dev"
fi

echo ""
echo "💡 If you see webpack errors again, run this script: ./fix-webpack.sh"
