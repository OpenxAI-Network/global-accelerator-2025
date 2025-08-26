# Vibe Trading AI - Development Makefile
# Run 'make start' to get everything running!

.PHONY: help start stop clean status check-db check-frontend check-ollama init-db logs restart-db start-db wait-db start-frontend health check-docker check-ports auto-start-docker start-daemon stop-daemon

help:
	@echo "🚀 Vibe Trading AI - Development Commands"
	@echo ""
	@echo "📋 Available commands:"
	@echo "  make start          - Start everything (database + frontend)"
	@echo "  make start-daemon   - Start everything in background (daemon mode)"
	@echo "  make stop           - Stop all services"
	@echo "  make stop-daemon    - Stop daemon mode services"
	@echo "  make status         - Check status of all services"
	@echo "  make daemon-status  - Check daemon services status"
	@echo "  make health         - Run health checks"
	@echo "  make logs           - Show service logs"
	@echo "  make clean          - Remove all containers and data"
	@echo "  make restart        - Restart all services"
	@echo ""
	@echo "🔧 Individual services:"
	@echo "  make start-db       - Start database only"
	@echo "  make start-frontend - Start frontend only"
	@echo "  make init-db        - Initialize database tables"
	@echo ""
	@echo "🔍 Health checks:"
	@echo "  make check-db       - Test database connection"
	@echo "  make check-frontend - Test frontend accessibility"
	@echo "  make check-ollama   - Test Ollama AI connection"
	@echo ""
	@echo "🚨 Emergency commands:"
	@echo "  make recover        - Emergency recovery (clean + restart)"
	@echo "  make force-start    - Force start with cleanup"
	@echo ""
	@echo "💡 Development helpers:"
	@echo "  make dev-only       - Start frontend only (assumes DB running)"
	@echo "  make db-only        - Start database only"

start: check-docker check-ports start-db wait-db init-db start-frontend check-ollama status
	@echo ""
	@echo "🎉 Vibe Trading AI is ready!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🗄️  Database: localhost:5432"
	@echo "🤖 Ollama: Check status above"
	@echo ""
	@echo "💡 To keep running in background, use: make start-daemon"

start-daemon: check-docker check-ports start-db wait-db init-db start-frontend-daemon check-ollama status
	@echo ""
	@echo "🎉 Vibe Trading AI is running in background (daemon mode)!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🗄️  Database: localhost:5432"
	@echo "🤖 Ollama: Check status above"
	@echo ""
	@echo "💡 Services will keep running even if you close this terminal"
	@echo "💡 To stop: make stop-daemon"
	@echo "💡 To check status: make status"

stop:
	@echo "🛑 Stopping all services..."
	@docker stop vibe-trading-db 2>/dev/null || true
	@pkill -f "npm run dev" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "✅ All services stopped"

stop-daemon:
	@echo "🛑 Stopping daemon services..."
	@docker stop vibe-trading-db 2>/dev/null || true
	@pkill -f "npm run dev" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "✅ Daemon services stopped"

clean:
	@echo "🧹 Cleaning up..."
	@docker stop vibe-trading-db 2>/dev/null || true
	@docker rm vibe-trading-db 2>/dev/null || true
	@docker volume prune -f 2>/dev/null || true
	@pkill -f "npm run dev" 2>/dev/null || true
	@pkill -f "next dev" 2>/dev/null || true
	@echo "✅ Cleanup complete"

status:
	@echo ""
	@echo "📊 Service Status"
	@echo "=================="
	@echo "-n 🐳 Docker: "
	@docker info >/dev/null 2>&1 && echo "✅ Running" || echo "❌ Not running"
	@echo "   Status: "
	@echo ""
	@echo "-n 🗄️  Database: "
	@docker ps --filter "name=vibe-trading-db" --format "{{.Status}}" 2>/dev/null || echo "❌ Not running"
	@echo "   Port: 5432"
	@echo "   Status: "
	@docker exec vibe-trading-db pg_isready -h localhost -p 5432 -U postgres -d vibe_trading >/dev/null 2>&1 && echo "Accessible" || echo "Not accessible"
	@echo ""
	@echo "-n 🌐 Frontend: "
	@if lsof -i :3000 -t >/dev/null; then \
		echo "✅ Running (http://localhost:3000)"; \
		echo "   Port: 3000"; \
		if curl -s http://localhost:3000 >/dev/null; then \
			echo "   Status: Accessible"; \
		else \
			echo "   Status: Not accessible"; \
		fi; \
	else \
		echo "❌ Not running"; \
	fi
	@echo ""
	@echo "-n 🤖 Ollama AI: "
	@if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then \
		echo "✅ Running"; \
		echo "   Port: 11434"; \
		echo "   Status: "; \
	else \
		echo "❌ Not running"; \
	fi
	@echo ""
	@echo "📁 Environment:"
	@if [ -f .env.local ]; then echo "   ✅ .env.local exists"; else echo "   ❌ .env.local missing"; fi
	@if grep -q "DATABASE_URL" .env.local; then echo "   📍 Database config loaded"; else echo "   ⚠️  Database config missing"; fi
	@echo ""
	@echo "📦 Dependencies:"
	@if [ -d node_modules ]; then echo "   ✅ node_modules installed"; else echo "   ❌ node_modules missing"; fi

check-docker:
	@echo "🔍 Checking Docker..."
	@if ! docker --version >/dev/null 2>&1; then \
		echo "❌ Docker not installed. Please install Docker first."; \
		echo "💡 Download from: https://docker.com"; \
		echo "💡 After installation, restart your computer and try again."; \
		exit 1; \
	fi
	@if ! docker info >/dev/null 2>&1; then \
		echo "⚠️  Docker is installed but not running."; \
		echo "🔄 Attempting to start Docker automatically..."; \
		$(MAKE) auto-start-docker; \
		if ! docker info >/dev/null 2>&1; then \
			echo "❌ Failed to start Docker automatically."; \
			echo "💡 Please start Docker Desktop manually and try again."; \
			echo "💡 On macOS: Open Docker Desktop from Applications"; \
			echo "💡 On Windows: Start Docker Desktop from Start Menu"; \
			echo "💡 On Linux: Run 'sudo systemctl start docker'"; \
			exit 1; \
		fi; \
	fi
	@echo "✅ Docker is running"

auto-start-docker:
	@echo "🚀 Attempting to start Docker automatically..."
	@if [ "$$(uname)" = "Darwin" ]; then \
		echo "🍎 macOS detected - trying to start Docker Desktop..."; \
		open -a Docker 2>/dev/null || true; \
		echo "⏳ Waiting for Docker to start..."; \
		for i in 1 2 3 4 5 6 7 8 9 10; do \
			if docker info >/dev/null 2>&1; then \
				echo "✅ Docker started successfully!"; \
				break; \
			fi; \
			echo "   Waiting... ($$i/10)"; \
			sleep 3; \
		done; \
	elif [ "$$(uname)" = "Linux" ]; then \
		echo "🐧 Linux detected - trying to start Docker service..."; \
		sudo systemctl start docker 2>/dev/null || true; \
		echo "⏳ Waiting for Docker to start..."; \
		for i in 1 2 3 4 5; do \
			if docker info >/dev/null 2>&1; then \
				echo "✅ Docker started successfully!"; \
				break; \
			fi; \
			echo "   Waiting... ($$i/5)"; \
			sleep 2; \
		done; \
	else \
		echo "🪟 Windows detected - please start Docker Desktop manually"; \
		echo "💡 Open Docker Desktop from the Start Menu"; \
		exit 1; \
	fi

check-ports:
	@echo "🔍 Checking port availability..."
	@if lsof -i :5432 >/dev/null 2>&1; then \
		echo "⚠️  Port 5432 is already in use. Stopping existing process..."; \
		lsof -ti :5432 | xargs kill -9 2>/dev/null || true; \
		sleep 2; \
	fi
	@if lsof -i :3000 >/dev/null 2>&1; then \
		echo "⚠️  Port 3000 is already in use. Stopping existing process..."; \
		lsof -ti :3000 | xargs kill -9 2>/dev/null || true; \
		sleep 2; \
	fi
	@echo "✅ Ports are available"

start-db:
	@echo "🗄️  Starting PostgreSQL database..."
	@if docker ps -q --filter "name=vibe-trading-db" >/dev/null 2>&1; then \
		echo "🔄 Starting existing database container..."; \
		docker start vibe-trading-db; \
	else \
		echo "🆕 Creating new database container..."; \
		docker run -d \
			--name vibe-trading-db \
			-e POSTGRES_DB=vibe_trading \
			-e POSTGRES_USER=postgres \
			-e POSTGRES_PASSWORD=password \
			-p 5432:5432 \
			postgres:15; \
	fi

wait-db:
	@echo "⏳ Waiting for database to be ready..."
	@echo "   This may take up to 2 minutes on first run..."
	@for i in 1 2 3 4 5 6 7 8 9 10 11 12; do \
		if docker exec vibe-trading-db pg_isready -U postgres >/dev/null 2>&1; then \
			echo "✅ Database is ready!"; \
			break; \
		fi; \
		echo "   Waiting for database... ($$i/12)"; \
		sleep 10; \
	done
	@if ! docker exec vibe-trading-db pg_isready -U postgres >/dev/null 2>&1; then \
		echo "❌ Database failed to start within 2 minutes."; \
		echo "💡 Trying to restart database..."; \
		docker restart vibe-trading-db; \
		sleep 10; \
		if ! docker exec vibe-trading-db pg_isready -U postgres >/dev/null 2>&1; then \
			echo "❌ Database still not responding. Please check Docker logs:"; \
			echo "   docker logs vibe-trading-db"; \
			exit 1; \
		fi; \
	fi

init-db:
	@echo "📊 Initializing database..."
	@echo "🔧 Installing dependencies..."
	@if [ ! -d node_modules ]; then \
		echo "   Installing npm packages (this may take a few minutes)..."; \
		npm install --silent; \
	else \
		echo "   Dependencies already installed"; \
	fi
	@echo "🗃️  Creating database tables..."
	@if npm run init-db; then \
		echo "✅ Database initialized successfully!"; \
	else \
		echo "❌ Database initialization failed."; \
		echo "💡 This might be because the database isn't ready yet."; \
		echo "💡 Trying to wait a bit more and retry..."; \
		sleep 5; \
		if npm run init-db; then \
			echo "✅ Database initialized on retry!"; \
		else \
			echo "❌ Database initialization still failed."; \
			echo "💡 Please check the error above and try:"; \
			echo "   make restart"; \
			exit 1; \
		fi; \
	fi

start-frontend:
	@echo "🌐 Starting frontend..."
	@echo "🚀 Starting Next.js development server..."
	@nohup npm run dev >/dev/null 2>&1 &
	@echo "⏳ Waiting for frontend to start..."
	@echo "   This may take up to 1 minute..."
	@for i in 1 2 3 4 5 6; do \
		if curl -s http://localhost:3000 >/dev/null 2>&1; then \
			echo "✅ Frontend is running!"; \
			break; \
		fi; \
		echo "   Waiting for frontend... ($$i/6)"; \
		sleep 10; \
	done
	@if ! curl -s http://localhost:3000 >/dev/null 2>&1; then \
		echo "❌ Frontend failed to start within 1 minute."; \
		echo "💡 Checking for errors..."; \
		ps aux | grep "npm run dev" | grep -v grep || echo "   No npm process found"; \
		echo "💡 Try running 'make restart' or check the logs:"; \
		echo "   make logs"; \
		exit 1; \
	fi

start-frontend-daemon:
	@echo "🌐 Starting frontend in daemon mode..."
	@echo "🚀 Starting Next.js development server in background..."
	@nohup npm run dev >/dev/null 2>&1 &
	@echo "⏳ Waiting for frontend to start..."
	@echo "   This may take up to 1 minute..."
	@for i in 1 2 3 4 5 6; do \
		if curl -s http://localhost:3000 >/dev/null 2>&1; then \
			echo "✅ Frontend is running!"; \
			break; \
		fi; \
		echo "   Waiting for frontend... ($$i/6)"; \
		sleep 10; \
	done
	@if ! curl -s http://localhost:3000 >/dev/null 2>&1; then \
		echo "❌ Frontend failed to start within 1 minute."; \
		echo "💡 Checking for errors..."; \
		ps aux | grep "npm run dev" | grep -v grep || echo "   No npm process found"; \
		echo "💡 Try running 'make restart' or check the logs:"; \
		echo "   make logs"; \
		exit 1; \
	fi

check-db:
	@echo "🔍 Checking database connection..."
	@docker exec vibe-trading-db psql -U postgres -d vibe_trading -c "SELECT 1;" >/dev/null 2>&1 && \
		echo "✅ Database connection: OK" && \
		echo "   Host: localhost:5432" && \
		echo "   Database: vibe_trading" && \
		echo "   User: postgres" || \
		echo "❌ Database connection: Failed"

check-frontend:
	@echo "🔍 Checking frontend accessibility..."
	@curl -s http://localhost:3000 >/dev/null && \
		echo "✅ Frontend: http://localhost:3000 (accessible)" || \
		echo "❌ Frontend: Not accessible"

check-ollama:
	@echo "🤖 Checking Ollama AI status..."
	@if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then \
		echo "✅ Ollama is running on port 11434"; \
		echo "📋 Available models:"; \
		curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | while read model; do \
			echo "   🧠 $model"; \
		done; \
		echo "🔍 Testing AI response..."; \
		response=$$(curl -s -X POST "http://localhost:11434/api/generate" \
			-H "Content-Type: application/json" \
			-d '{"model":"llama3.2:3b","prompt":"Quick test - are you ready?","stream":false}' 2>/dev/null | \
			grep -o '"response":"[^"]*"' | cut -d'"' -f4 | head -2 | tr '\n' ' '); \
		if [ -n "$$response" ]; then \
			echo "✅ AI Response: $$response..."; \
		else \
			echo "⚠️  AI Response: Test failed"; \
		fi; \
	else \
		echo "❌ Ollama is not running"; \
		echo "💡 To start Ollama:"; \
		echo "   1. Install from https://ollama.ai"; \
		echo "   2. Run: ollama serve"; \
		echo "   3. Pull a model: ollama pull llama3.2:3b"; \
		echo "💡 Ollama is optional - the app will work without it"; \
	fi

restart-db:
	@echo "🔄 Restarting database..."
	@docker restart vibe-trading-db 2>/dev/null || true
	@make wait-db

logs:
	@echo "📋 Service Logs"
	@echo "==============="
	@echo "🗄️  Database logs:"
	@docker logs vibe-trading-db --tail 10 2>/dev/null || echo "Database not running"
	@echo ""
	@echo "🌐 Frontend logs:"
	@ps aux | grep "npm run dev" | grep -v grep | head -1 | awk '{print $$2}' | xargs -I {} tail -f /dev/null 2>/dev/null || echo "Frontend not running"

restart: stop start

health: check-db check-frontend check-ollama
	@echo "✅ All systems operational!"

# Emergency recovery commands
recover:
	@echo "🚨 Emergency recovery mode..."
	@echo "🧹 Cleaning everything..."
	@make clean
	@echo "🔄 Starting fresh..."
	@make start

force-start:
	@echo "💪 Force starting everything..."
	@make clean
	@make start

# Daemon management
daemon-status:
	@echo "🔍 Checking daemon services..."
	@echo "🗄️  Database:"
	@docker ps --filter "name=vibe-trading-db" --format "{{.Status}}" 2>/dev/null || echo "   ❌ Not running"
	@echo "🌐 Frontend:"
	@if lsof -i :3000 -t >/dev/null; then \
		echo "   ✅ Running on port 3000"; \
		ps aux | grep "npm run dev" | grep -v grep | head -1 | awk '{print "   PID: " $$2 " | Started: " $$9}'; \
	else \
		echo "   ❌ Not running"; \
	fi
	@echo "🤖 Ollama:"
	@if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then \
		echo "   ✅ Running on port 11434"; \
	else \
		echo "   ❌ Not running"; \
	fi

# Development helpers
dev-only:
	@echo "🚀 Starting frontend only (assumes DB is running)..."
	@npm run dev

db-only:
	@echo "🗄️  Starting database only..."
	@make start-db
	@make wait-db
	@echo "✅ Database is ready at localhost:5432"
