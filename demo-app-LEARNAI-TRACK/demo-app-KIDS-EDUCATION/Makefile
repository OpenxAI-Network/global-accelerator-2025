# Kids Education App Makefile
# This Makefile checks for required tools and runs the development server

.PHONY: help dev check-ollama check-node check-npm install-deps clean

# Default target
help:
	@echo "🌟 Kids Learning Adventure - Available Commands:"
	@echo ""
	@echo "  make dev        - Start development server (checks dependencies first)"
	@echo "  make check      - Check if all required tools are installed"
	@echo "  make install    - Install all dependencies"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make help       - Show this help message"
	@echo ""

# Main development target
dev: check-ollama check-node check-npm check-minikit install-deps
	@clear
	@echo "🚀 Starting Kids Learning Adventure development server..."
	@echo "📱 App will be available at: http://localhost:3000"
	@echo "🔄 Server will restart automatically on file changes"
	@echo "⏹️  Press Ctrl+C to stop the server"
	@echo ""
	cd nextjs-app && npm run dev

# Check if Ollama is installed and running
check-ollama:
	@echo "🔍 Checking Ollama installation..."
	@if ! command -v ollama >/dev/null 2>&1; then \
		echo "❌ Ollama is not installed!"; \
		echo "📥 Please install Ollama from: https://ollama.ai/"; \
		echo "💻 Or run: curl -fsSL https://ollama.ai/install.sh | sh"; \
		exit 1; \
	fi
	@echo "✅ Ollama is installed"
	@echo "🔍 Checking if Ollama service is running..."
	@if ! ollama list >/dev/null 2>&1; then \
		echo "⚠️  Ollama service is not running. Starting it..."; \
		ollama serve & \
		sleep 3; \
	fi
	@echo "✅ Ollama service is running"

# Check if Node.js is installed
check-node:
	@echo "🔍 Checking Node.js installation..."
	@if ! command -v node >/dev/null 2>&1; then \
		echo "❌ Node.js is not installed!"; \
		echo "📥 Please install Node.js from: https://nodejs.org/"; \
		echo "💻 Or use nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"; \
		exit 1; \
	fi
	@echo "✅ Node.js is installed (version: $(shell node --version))"

# Check if npm is installed
check-npm:
	@echo "🔍 Checking npm installation..."
	@if ! command -v npm >/dev/null 2>&1; then \
		echo "❌ npm is not installed!"; \
		echo "📥 Please install npm or use a Node.js installer that includes it"; \
		exit 1; \
	fi
	@echo "✅ npm is installed (version: $(shell npm --version))"

# Check if MiniKit is installed
check-minikit:
	@echo "🔍 Checking MiniKit installation..."
	@if ! grep -q "@coinbase/onchainkit" nextjs-app/package.json; then \
		echo "❌ MiniKit is not installed!"; \
		echo "📥 Installing MiniKit..."; \
		cd nextjs-app && npm install @coinbase/onchainkit; \
	else \
		echo "✅ MiniKit is already installed"; \
	fi

# Install dependencies
install-deps:
	@echo "📦 Installing dependencies..."
	@if [ ! -d "nextjs-app/node_modules" ]; then \
		echo "🔄 Installing npm packages..."; \
		cd nextjs-app && npm install; \
	else \
		echo "🔄 Checking for new dependencies..."; \
		cd nextjs-app && npm install; \
	fi

# Check all requirements
check: check-ollama check-node check-npm check-minikit
	@echo "🎉 All required tools are installed and ready!"
	@echo "📦 Dependencies: @coinbase/onchainkit, wagmi, viem, pino-pretty"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@if [ -d "nextjs-app/.next" ]; then \
		rm -rf nextjs-app/.next; \
		echo "✅ Cleaned .next directory"; \
	fi
	@if [ -d "nextjs-app/node_modules" ]; then \
		rm -rf nextjs-app/node_modules; \
		echo "✅ Cleaned node_modules directory"; \
	fi
	@echo "🧹 Cleanup complete!"

# Quick start (alias for dev)
start: dev

# Development with auto-restart (alias for dev)
run: dev

# Deploy to BASE mini app store
deploy:
	@echo "🚀 Deploying Kids Learning Adventure to BASE mini app store..."
	@echo "📋 This will guide you through the deployment process"
	@echo ""
	@if [ -f "deploy.sh" ]; then \
		./deploy.sh; \
	else \
		echo "❌ deploy.sh not found. Please run the deployment manually:"; \
		echo "1. cd nextjs-app"; \
		echo "2. npm run build"; \
		echo "3. vercel --prod"; \
		echo "4. Set environment variables in Vercel dashboard"; \
		echo "5. Submit to BASE mini app store"; \
	fi
