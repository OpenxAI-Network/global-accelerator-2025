#!/bin/bash

# Vibe Trading AI - Startup Script
# Alternative to Makefile for users who don't have Make

set -e

echo "🚀 Vibe Trading AI - Starting up..."
echo ""

# Check if Docker is running
echo "🔍 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi
echo "✅ Docker is running"

# Check ports
echo "🔍 Checking port availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. Stopping existing process..."
    pkill -f "next dev" || true
    sleep 2
fi

if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5432 is already in use. Stopping existing process..."
    docker stop vibe-trading-db 2>/dev/null || true
    sleep 2
fi
echo "✅ Ports are available"

# Start database
echo "🗄️  Starting PostgreSQL database..."
if docker ps -q -f name=vibe-trading-db | grep -q .; then
    echo "✅ Database container already running"
else
    if docker ps -aq -f name=vibe-trading-db | grep -q .; then
        echo "🔄 Starting existing database container..."
        docker start vibe-trading-db
    else
        echo "🆕 Creating new database container..."
        docker run --name vibe-trading-db \
            -e POSTGRES_DB=vibe_trading \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=password \
            -p 5432:5432 \
            -d postgres:15
    fi
fi

# Wait for database
echo "⏳ Waiting for database to be ready..."
until docker exec vibe-trading-db pg_isready -U postgres -d vibe_trading > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ Database is ready"

# Initialize database
echo "📊 Initializing database..."
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vibe_trading
DB_USER=postgres
DB_PASSWORD=password
EOF
fi

echo "🔧 Installing dependencies..."
npm install --silent

echo "🗃️  Creating database tables..."
npm run init-db --silent
echo "✅ Database initialized"

# Start frontend
echo "🌐 Starting frontend..."
echo "🚀 Starting Next.js development server..."
nohup npm run dev > .next.log 2>&1 &

echo "⏳ Waiting for frontend to start..."
until curl -s http://localhost:3000 > /dev/null 2>&1; do
    echo "   Waiting for frontend..."
    sleep 3
done
echo "✅ Frontend is running"

# Show status
echo ""
echo "📊 Service Status"
echo "=================="

echo -n "🗄️  Database: "
if docker ps -q -f name=vibe-trading-db | grep -q .; then
    echo "✅ Running (vibe-trading-db)"
    echo "   Port: 5432"
    echo "   Status: $(docker inspect --format='{{.State.Status}}' vibe-trading-db 2>/dev/null || echo 'Unknown')"
else
    echo "❌ Not running"
fi

echo ""
echo -n "🌐 Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Running (http://localhost:3000)"
    echo "   Port: 3000"
    echo "   Status: Accessible"
else
    echo "❌ Not accessible"
fi

echo ""
echo "📁 Environment:"
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists"
    echo "   📍 Database config loaded"
else
    echo "   ❌ .env.local missing"
fi

echo ""
echo "📦 Dependencies:"
if [ -d node_modules ]; then
    echo "   ✅ node_modules installed"
else
    echo "   ❌ node_modules missing"
fi

echo ""
echo "🎉 Vibe Trading AI is ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📊 Check status anytime with: make status"
echo "🛑 Stop everything with: make stop"
echo ""
echo "💡 Tip: Install Make for easier management: brew install make"
