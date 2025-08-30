#!/bin/bash

# Aegis AI - Gemini AI Setup Script
# This script helps set up and test the Google Gemini AI integration

set -e

echo "🚀 Aegis AI - Gemini AI Setup Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from template..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_success "Created .env file from template"
    else
        print_error "env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if Gemini API key is configured
if grep -q "your_gemini_api_key_here" .env; then
    print_warning "Gemini API key not configured in .env file"
    echo ""
    echo "To get your Gemini API key:"
    echo "1. Go to https://makersuite.google.com/app/apikey"
    echo "2. Sign in with your Google account"
    echo "3. Create a new API key"
    echo "4. Copy the API key and update your .env file"
    echo ""
    read -p "Enter your Gemini API key (or press Enter to skip): " GEMINI_API_KEY
    
    if [ ! -z "$GEMINI_API_KEY" ]; then
        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/your_gemini_api_key_here/$GEMINI_API_KEY/g" .env
        else
            # Linux
            sed -i "s/your_gemini_api_key_here/$GEMINI_API_KEY/g" .env
        fi
        print_success "Updated .env file with Gemini API key"
    else
        print_warning "Skipping Gemini API key configuration"
    fi
else
    print_success "Gemini API key already configured"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Check if backend dependencies are installed
if [ -d "aegis-boilerplate/backend" ]; then
    print_status "Installing backend dependencies..."
    cd aegis-boilerplate/backend
    npm install
    cd ../..
fi

# Check if Python dependencies are installed
if [ -d "python_agents" ]; then
    print_status "Installing Python dependencies..."
    cd python_agents
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    fi
    cd ..
fi

# Test Gemini AI service
print_status "Testing Gemini AI service..."

# Start Gemini service in background
if [ -f "backend/geminiService.js" ]; then
    print_status "Starting Gemini AI service..."
    cd backend
    node geminiService.js &
    GEMINI_PID=$!
    cd ..
    
    # Wait for service to start
    sleep 3
    
    # Test health endpoint
    if curl -s http://localhost:4006/api/gemini/health > /dev/null; then
        print_success "Gemini AI service is running"
        
        # Test configuration endpoint
        CONFIG_RESPONSE=$(curl -s http://localhost:4006/api/gemini/config)
        if echo "$CONFIG_RESPONSE" | grep -q "apiKeyConfigured.*true"; then
            print_success "Gemini API key is working"
        else
            print_warning "Gemini API key may not be working properly"
        fi
        
        # Test content generation
        print_status "Testing content generation..."
        TEST_RESPONSE=$(curl -s -X POST http://localhost:4006/api/gemini/generate \
            -H "Content-Type: application/json" \
            -d '{"prompt": "Hello, how are you?", "maxTokens": 50}')
        
        if echo "$TEST_RESPONSE" | grep -q "success.*true"; then
            print_success "Content generation is working"
        else
            print_warning "Content generation may have issues"
        fi
        
    else
        print_error "Failed to start Gemini AI service"
    fi
    
    # Stop Gemini service
    kill $GEMINI_PID 2>/dev/null || true
else
    print_warning "Gemini service file not found"
fi

# Test main backend AI integration
print_status "Testing main backend AI integration..."

# Start main backend in background
if [ -f "aegis-boilerplate/backend/server.js" ]; then
    print_status "Starting main backend..."
    cd aegis-boilerplate/backend
    node server.js &
    BACKEND_PID=$!
    cd ..
    
    # Wait for service to start
    sleep 3
    
    # Test AI status endpoint
    if curl -s http://localhost:3001/api/ai/status > /dev/null; then
        print_success "Main backend AI service is running"
        
        # Test AI insights endpoint
        if curl -s http://localhost:3001/api/ai/insights > /dev/null; then
            print_success "AI insights endpoint is working"
        else
            print_warning "AI insights endpoint may have issues"
        fi
        
    else
        print_error "Failed to start main backend"
    fi
    
    # Stop backend
    kill $BACKEND_PID 2>/dev/null || true
else
    print_warning "Main backend file not found"
fi

# Create startup script
print_status "Creating startup script..."

cat > start-gemini-ai.sh << 'EOF'
#!/bin/bash

# Aegis AI - Start Gemini AI Services
echo "🚀 Starting Aegis AI Gemini Services..."

# Start Gemini AI service
echo "Starting Gemini AI service on port 4006..."
cd backend
node geminiService.js &
GEMINI_PID=$!
cd ..

# Start main backend with AI integration
echo "Starting main backend with AI integration on port 3001..."
cd aegis-boilerplate/backend
node server.js &
BACKEND_PID=$!
cd ..

echo "✅ Services started!"
echo "   Gemini AI: http://localhost:4006"
echo "   Main Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $GEMINI_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for services
wait
EOF

chmod +x start-gemini-ai.sh
print_success "Created startup script: start-gemini-ai.sh"

# Create test script
print_status "Creating test script..."

cat > test-gemini-ai.sh << 'EOF'
#!/bin/bash

# Aegis AI - Test Gemini AI Integration
echo "🧪 Testing Aegis AI Gemini Integration..."

# Test Gemini service
echo "Testing Gemini AI service..."
if curl -s http://localhost:4006/api/gemini/health > /dev/null; then
    echo "✅ Gemini service is running"
    
    # Test content generation
    echo "Testing content generation..."
    RESPONSE=$(curl -s -X POST http://localhost:4006/api/gemini/generate \
        -H "Content-Type: application/json" \
        -d '{"prompt": "Explain DeFi in one sentence", "maxTokens": 100}')
    
    if echo "$RESPONSE" | grep -q "success.*true"; then
        echo "✅ Content generation working"
        echo "Sample response: $(echo "$RESPONSE" | jq -r '.generatedText' 2>/dev/null || echo 'Response received')"
    else
        echo "❌ Content generation failed"
    fi
else
    echo "❌ Gemini service not running"
fi

echo ""

# Test main backend AI
echo "Testing main backend AI integration..."
if curl -s http://localhost:3001/api/ai/status > /dev/null; then
    echo "✅ Main backend AI is running"
    
    # Test AI insights
    echo "Testing AI insights..."
    if curl -s http://localhost:3001/api/ai/insights > /dev/null; then
        echo "✅ AI insights working"
    else
        echo "❌ AI insights failed"
    fi
else
    echo "❌ Main backend AI not running"
fi

echo ""
echo "🎯 Test completed!"
EOF

chmod +x test-gemini-ai.sh
print_success "Created test script: test-gemini-ai.sh"

# Final instructions
echo ""
echo "🎉 Gemini AI Setup Complete!"
echo "============================"
echo ""
echo "Next steps:"
echo "1. Update your .env file with your actual API keys"
echo "2. Run: ./start-gemini-ai.sh"
echo "3. Test with: ./test-gemini-ai.sh"
echo ""
echo "Available endpoints:"
echo "  Gemini AI Service: http://localhost:4006"
echo "  Main Backend: http://localhost:3001"
echo ""
echo "Documentation:"
echo "  - Gemini API: https://ai.google.dev/docs"
echo "  - Aegis AI: README-AI-AGENT.md"
echo ""
print_success "Setup complete! 🚀"
