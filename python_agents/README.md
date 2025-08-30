# Aegis Multi-Agent AI System - Python Implementation

This directory contains the Python implementation of the Aegis Multi-Agent AI System, featuring a sophisticated multi-agent architecture with Redis message brokering, RAG + Knowledge Graph integration, multimodal AI processing, and Human-in-the-Loop oversight.

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** with pip
2. **Redis** server running on localhost:6379
3. **Neo4j** database running on localhost:7687
4. **ChromaDB** running on localhost:8000
5. **Google Gemini API key** (required)

### Installation

1. **Clone and navigate to the directory:**
   ```bash
   cd python_agents
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp env.template .env
   # Edit .env with your API keys and service URLs
   ```

4. **Start the system:**
   ```bash
   python start.py
   ```

## 🏗️ Architecture

The system is built around a **multi-agent architecture** with the following key components:

### Core Components

- **Agent Orchestrator** (`core/agent_orchestrator.py`) - Main coordinator for all agents
- **Message Broker** (`core/message_broker.py`) - Redis-based communication system
- **RAG Engine** (`core/rag_engine.py`) - Hybrid knowledge graph + vector search
- **HITL Console** (`core/hitl_console.py`) - Human-in-the-Loop oversight
- **Configuration** (`core/config.py`) - Centralized configuration management

### Data Models

- **Events** (`models/events.py`) - Blockchain event structures
- **Threats** (`models/threats.py`) - Threat analysis and risk assessment
- **Actions** (`models/actions.py`) - Security action definitions
- **Agents** (`models/agents.py`) - Agent communication and status
- **HITL** (`models/hitl.py`) - Human oversight data structures

### Agent Types

1. **Perception Agent** - Monitors blockchain events across multiple chains
2. **Cognitive Agent** - Analyzes threats using AI (Gemini 2.5 Pro)
3. **Action Agent** - Executes security measures via ZetaChain
4. **Learning Module** - Self-improvement and pattern recognition

## 🔧 Configuration

### Environment Variables

Copy `env.template` to `.env` and configure:

```bash
# Required: Google Gemini API key
GEMINI_API_KEY="your_gemini_api_key_here"

# Redis configuration
REDIS_URL="redis://localhost:6379"

# Neo4j configuration
NEO4J_URI="bolt://localhost:7687"
NEO4J_PASSWORD="your_neo4j_password"

# ChromaDB configuration
CHROMA_HOST="localhost"
CHROMA_PORT=8000

# Blockchain RPC URLs
BLOCKCHAIN_RPC_URLS='{"1":"https://mainnet.infura.io/v3/YOUR_KEY"}'

# ZetaChain configuration
ZETA_RPC_URL="https://zetachain-athens-evm.blockpi.network/v1/rpc/public"
```

### Service Setup

1. **Redis:**
   ```bash
   # Install Redis
   sudo apt-get install redis-server
   # or
   brew install redis
   
   # Start Redis
   redis-server
   ```

2. **Neo4j:**
   ```bash
   # Download from https://neo4j.com/download/
   # Start Neo4j
   neo4j start
   ```

3. **ChromaDB:**
   ```bash
   # Install ChromaDB
   pip install chromadb
   
   # Start ChromaDB server
   chroma run --host localhost --port 8000
   ```

## 🎯 Usage

### Interactive Startup

```bash
python start.py
```

Available commands:
- `start` - Start the main system
- `demo` - Run the demonstration
- `validate` - Validate configuration
- `status` - Show system status
- `help` - Show help information

### Direct Execution

```bash
# Start main system
python main.py

# Run demo
python demo.py

# Validate configuration only
python main.py --validate-only

# Show system status
python main.py --status
```

### Demo Mode

The demo script demonstrates:
1. **Agent Registration** - Registering sample agents
2. **Event Generation** - Creating sample blockchain events
3. **Workflow Execution** - Running security workflows
4. **System Monitoring** - Displaying performance metrics

## 🔍 System Features

### Multi-Agent Coordination

- **Event-driven architecture** with Redis message brokering
- **Priority queues** for critical events
- **Load balancing** across multiple agents
- **Health monitoring** and automatic failover

### AI-Powered Threat Detection

- **Gemini 2.5 Pro** integration for threat analysis
- **RAG + Knowledge Graph** for comprehensive intelligence
- **Pattern recognition** and anomaly detection
- **Risk scoring** and confidence assessment

### Cross-Chain Security

- **Multi-chain monitoring** (Ethereum, BSC, Polygon, etc.)
- **ZetaChain integration** for cross-chain operations
- **Universal security layer** deployment
- **Bridge protocol monitoring**

### Human-in-the-Loop

- **Approval workflows** for critical actions
- **Automatic escalation** based on risk levels
- **Audit trails** and compliance tracking
- **Emergency override** capabilities

## 📊 Monitoring & Metrics

### System Status

```bash
python start.py
# Then type: status
```

### Performance Metrics

- Event processing rates
- Agent response times
- Workflow completion rates
- System health indicators

### Logging

- **Structured logging** with loguru
- **Log rotation** and compression
- **Multiple log levels** (DEBUG, INFO, WARNING, ERROR)
- **Log files** in `logs/` directory

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_agents.py

# Run with coverage
pytest --cov=.
```

### Integration Tests

```bash
# Test with real services
python -m pytest tests/integration/ -v

# Test specific components
python -m pytest tests/integration/test_redis.py -v
```

## 🚀 Deployment

### Development

```bash
# Start all services
docker-compose up -d

# Run the system
python main.py
```

### Production

```bash
# Set environment
export ENVIRONMENT=production

# Start with process manager
pm2 start main.py --name aegis-system

# Monitor
pm2 status
pm2 logs aegis-system
```

### Docker

```bash
# Build image
docker build -t aegis-system .

# Run container
docker run -d --name aegis \
  -p 8000:8000 \
  --env-file .env \
  aegis-system
```

## 🔧 Troubleshooting

### Common Issues

1. **Redis Connection Failed:**
   - Ensure Redis server is running
   - Check Redis URL in `.env`
   - Verify Redis port accessibility

2. **Neo4j Connection Failed:**
   - Ensure Neo4j is running
   - Check credentials in `.env`
   - Verify bolt port accessibility

3. **Gemini API Error:**
   - Verify API key in `.env`
   - Check API quota and limits
   - Ensure internet connectivity

4. **ChromaDB Connection Failed:**
   - Ensure ChromaDB server is running
   - Check host and port in `.env`
   - Verify service accessibility

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Run with verbose output
python main.py --debug
```

### Health Checks

```bash
# Validate configuration
python start.py
# Then type: validate

# Check system status
python start.py
# Then type: status
```

## 📚 API Reference

### Core Classes

- `AgentOrchestrator` - Main system coordinator
- `MessageBroker` - Redis message handling
- `RAGEngine` - Knowledge retrieval system
- `HITLConsole` - Human oversight interface

### Key Methods

- `orchestrator.start()` - Start the system
- `orchestrator.register_agent()` - Register new agents
- `orchestrator.submit_event()` - Submit blockchain events
- `orchestrator.trigger_workflow()` - Execute security workflows

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests**
5. **Submit a pull request**

### Development Setup

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Setup pre-commit hooks
pre-commit install

# Run linting
flake8 .
black .
isort .
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **ZetaChain** for cross-chain infrastructure
- **Redis** for message brokering
- **Neo4j** for knowledge graphs
- **ChromaDB** for vector storage

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the configuration guide
- Consult the API documentation

---

**🚀 Ready to secure the blockchain with AI-powered multi-agent intelligence!**
