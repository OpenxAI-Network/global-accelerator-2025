"""
Configuration settings for the Aegis Multi-Agent AI System.

This module provides centralized configuration management using Pydantic
for environment variables and system settings.
"""

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseSettings, Field, validator
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    This class provides type-safe configuration management with
    validation and default values for all system components.
    """
    
    # Application settings
    APP_NAME: str = Field(default="Aegis Multi-Agent AI System", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    DEBUG: bool = Field(default=False, description="Debug mode")
    ENVIRONMENT: str = Field(default="development", description="Environment (development/staging/production)")
    
    # Redis configuration
    REDIS_URL: str = Field(default="redis://localhost:6379", description="Redis connection URL")
    REDIS_HOST: str = Field(default="localhost", description="Redis host")
    REDIS_PORT: int = Field(default=6379, description="Redis port")
    REDIS_DB: int = Field(default=0, description="Redis database number")
    REDIS_PASSWORD: Optional[str] = Field(default=None, description="Redis password")
    REDIS_MAX_RETRIES: int = Field(default=3, description="Maximum Redis connection retries")
    REDIS_RETRY_DELAY: float = Field(default=1.0, description="Redis retry delay in seconds")
    REDIS_MAX_QUEUE_SIZE: int = Field(default=10000, description="Maximum Redis queue size")
    
    # Neo4j configuration
    NEO4J_URI: str = Field(default="bolt://localhost:7687", description="Neo4j connection URI")
    NEO4J_USER: str = Field(default="neo4j", description="Neo4j username")
    NEO4J_PASSWORD: str = Field(default="password", description="Neo4j password")
    NEO4J_MAX_CONNECTIONS: int = Field(default=50, description="Maximum Neo4j connections")
    NEO4J_CONNECTION_TIMEOUT: int = Field(default=30, description="Neo4j connection timeout in seconds")
    
    # ChromaDB configuration
    CHROMA_HOST: str = Field(default="localhost", description="ChromaDB host")
    CHROMA_PORT: int = Field(default=8000, description="ChromaDB port")
    CHROMA_PERSIST_DIRECTORY: str = Field(default="./chroma_db", description="ChromaDB persistence directory")
    CHROMA_ANONYMIZED_TELEMETRY: bool = Field(default=False, description="ChromaDB telemetry setting")
    
    # AI model configuration
    GEMINI_API_KEY: str = Field(default="AIzaSyDpmYQsbFIZP7L1ZGSkjOPL3YT2nGTFSBI", description="Google Gemini API key")
    GEMINI_MODEL_NAME: str = Field(default="gemini-2.5-pro", description="Gemini model to use")
    GEMINI_MAX_TOKENS: int = Field(default=8192, description="Maximum tokens for Gemini responses")
    GEMINI_TEMPERATURE: float = Field(default=0.1, description="Gemini response temperature")
    GEMINI_TOP_P: float = Field(default=0.8, description="Gemini top-p parameter")
    
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API key (optional)")
    OPENAI_MODEL_NAME: str = Field(default="gpt-4", description="OpenAI model to use")
    OPENAI_MAX_TOKENS: int = Field(default=4096, description="Maximum tokens for OpenAI responses")
    
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, description="Anthropic API key (optional)")
    ANTHROPIC_MODEL_NAME: str = Field(default="claude-3-sonnet", description="Anthropic model to use")
    
    # Embedding model configuration
    EMBEDDING_MODEL: str = Field(default="all-MiniLM-L6-v2", description="Sentence transformer model for embeddings")
    EMBEDDING_DIMENSIONS: int = Field(default=384, description="Embedding vector dimensions")
    EMBEDDING_BATCH_SIZE: int = Field(default=32, description="Batch size for embedding generation")
    
    # Blockchain configuration
    SUPPORTED_CHAINS: List[int] = Field(
        default=[1, 56, 137, 42161, 10, 8453, 1101, 59144],
        description="Supported blockchain chain IDs"
    )
    
    BLOCKCHAIN_RPC_URLS: Dict[str, str] = Field(
        default={
            "1": "https://mainnet.infura.io/v3/YOUR_KEY",  # Ethereum
            "56": "https://bsc-dataseed.binance.org/",     # BSC
            "137": "https://polygon-rpc.com/",             # Polygon
            "42161": "https://arb1.arbitrum.io/rpc",       # Arbitrum
            "10": "https://mainnet.optimism.io",            # Optimism
            "8453": "https://mainnet.base.org",             # Base
            "1101": "https://rpc.polygon-zkevm.gateway.fm", # Polygon zkEVM
            "59144": "https://rpc.linea.build"             # Linea
        },
        description="RPC URLs for supported blockchains"
    )
    
    # ZetaChain configuration
    ZETA_RPC_URL: str = Field(
        default="https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
        description="ZetaChain RPC URL"
    )
    ZETA_CHAIN_ID: int = Field(default=7000, description="ZetaChain chain ID")
    ZETA_CONTRACT_ADDRESSES: Dict[str, str] = Field(
        default={
            "universal_security": "0x...",
            "lending_pool": "0x...",
            "voice_processor": "0x..."
        },
        description="ZetaChain contract addresses"
    )
    
    # HITL Console configuration
    HITL_AUTO_ESCALATION: bool = Field(default=True, description="Enable automatic escalation")
    HITL_MAX_APPROVAL_TIME: int = Field(default=60, description="Maximum approval time in minutes")
    HITL_EMERGENCY_APPROVERS: List[str] = Field(
        default=["emergency_admin", "security_manager"],
        description="Emergency approver addresses"
    )
    HITL_ESCALATION_TIMEOUTS: Dict[str, int] = Field(
        default={
            "supervisor": 30,
            "manager": 60,
            "director": 120,
            "executive": 240,
            "emergency": 15
        },
        description="Escalation timeouts in minutes"
    )
    
    # Agent configuration
    AGENT_HEALTH_CHECK_INTERVAL: int = Field(default=30, description="Agent health check interval in seconds")
    AGENT_MAX_PROCESSING_TIME: int = Field(default=300, description="Maximum event processing time in seconds")
    AGENT_BATCH_SIZE: int = Field(default=100, description="Batch size for event processing")
    AGENT_MAX_RETRIES: int = Field(default=3, description="Maximum retries for failed operations")
    
    # Performance configuration
    MAX_CONCURRENT_EVENTS: int = Field(default=1000, description="Maximum concurrent events to process")
    EVENT_PROCESSING_TIMEOUT: int = Field(default=60, description="Event processing timeout in seconds")
    THREAT_ANALYSIS_TIMEOUT: int = Field(default=30, description="Threat analysis timeout in seconds")
    ACTION_EXECUTION_TIMEOUT: int = Field(default=120, description="Action execution timeout in seconds")
    
    # Logging configuration
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FORMAT: str = Field(
        default="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}",
        description="Log format string"
    )
    LOG_FILE: str = Field(default="logs/aegis_system.log", description="Log file path")
    LOG_ROTATION: str = Field(default="100 MB", description="Log rotation size")
    LOG_RETENTION: str = Field(default="30 days", description="Log retention period")
    
    # Security configuration
    API_RATE_LIMIT: int = Field(default=1000, description="API rate limit per minute")
    MAX_REQUEST_SIZE: int = Field(default=10485760, description="Maximum request size in bytes (10MB)")
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "https://aegis.ai"],
        description="Allowed CORS origins"
    )
    
    # Monitoring configuration
    METRICS_ENABLED: bool = Field(default=True, description="Enable metrics collection")
    METRICS_INTERVAL: int = Field(default=60, description="Metrics collection interval in seconds")
    HEALTH_CHECK_ENABLED: bool = Field(default=True, description="Enable health checks")
    HEALTH_CHECK_INTERVAL: int = Field(default=30, description="Health check interval in seconds")
    
    # Cache configuration
    CACHE_ENABLED: bool = Field(default=True, description="Enable caching")
    CACHE_TTL: int = Field(default=300, description="Cache TTL in seconds")
    CACHE_MAX_SIZE: int = Field(default=10000, description="Maximum cache size")
    
    # Database configuration
    DATABASE_CONNECTION_POOL_SIZE: int = Field(default=20, description="Database connection pool size")
    DATABASE_CONNECTION_TIMEOUT: int = Field(default=30, description="Database connection timeout in seconds")
    DATABASE_QUERY_TIMEOUT: int = Field(default=60, description="Database query timeout in seconds")
    
    # File paths
    BASE_DIR: Path = Field(default=Path(__file__).parent.parent, description="Base directory")
    LOGS_DIR: Path = Field(default=Path("logs"), description="Logs directory")
    DATA_DIR: Path = Field(default=Path("data"), description="Data directory")
    CONFIG_DIR: Path = Field(default=Path("config"), description="Configuration directory")
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    @validator("SUPPORTED_CHAINS", pre=True)
    def parse_supported_chains(cls, v):
        """Parse supported chains from environment variable."""
        if isinstance(v, str):
            return [int(chain.strip()) for chain in v.split(",")]
        return v
    
    @validator("BLOCKCHAIN_RPC_URLS", pre=True)
    def parse_blockchain_rpc_urls(cls, v):
        """Parse blockchain RPC URLs from environment variable."""
        if isinstance(v, str):
            # Parse from JSON string
            import json
            return json.loads(v)
        return v
    
    @validator("ZETA_CONTRACT_ADDRESSES", pre=True)
    def parse_zeta_contract_addresses(cls, v):
        """Parse ZetaChain contract addresses from environment variable."""
        if isinstance(v, str):
            # Parse from JSON string
            import json
            return json.loads(v)
        return v
    
    @validator("HITL_EMERGENCY_APPROVERS", pre=True)
    def parse_hitl_emergency_approvers(cls, v):
        """Parse HITL emergency approvers from environment variable."""
        if isinstance(v, str):
            return [approver.strip() for approver in v.split(",")]
        return v
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from environment variable."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    def get_redis_config(self) -> Dict[str, Any]:
        """Get Redis configuration dictionary."""
        return {
            "url": self.REDIS_URL,
            "host": self.REDIS_HOST,
            "port": self.REDIS_PORT,
            "db": self.REDIS_DB,
            "password": self.REDIS_PASSWORD,
            "max_retries": self.REDIS_MAX_RETRIES,
            "retry_delay": self.REDIS_RETRY_DELAY,
            "max_queue_size": self.REDIS_MAX_QUEUE_SIZE
        }
    
    def get_neo4j_config(self) -> Dict[str, Any]:
        """Get Neo4j configuration dictionary."""
        return {
            "uri": self.NEO4J_URI,
            "user": self.NEO4J_USER,
            "password": self.NEO4J_PASSWORD,
            "max_connections": self.NEO4J_MAX_CONNECTIONS,
            "connection_timeout": self.NEO4J_CONNECTION_TIMEOUT
        }
    
    def get_chromadb_config(self) -> Dict[str, Any]:
        """Get ChromaDB configuration dictionary."""
        return {
            "host": self.CHROMA_HOST,
            "port": self.CHROMA_PORT,
            "persist_directory": self.CHROMA_PERSIST_DIRECTORY,
            "anonymized_telemetry": self.CHROMA_ANONYMIZED_TELEMETRY
        }
    
    def get_gemini_config(self) -> Dict[str, Any]:
        """Get Gemini configuration dictionary."""
        return {
            "api_key": self.GEMINI_API_KEY,
            "model_name": self.GEMINI_MODEL_NAME,
            "max_tokens": self.GEMINI_MAX_TOKENS,
            "temperature": self.GEMINI_TEMPERATURE,
            "top_p": self.GEMINI_TOP_P
        }
    
    def get_blockchain_config(self) -> Dict[str, Any]:
        """Get blockchain configuration dictionary."""
        return {
            "supported_chains": self.SUPPORTED_CHAINS,
            "rpc_urls": self.BLOCKCHAIN_RPC_URLS,
            "max_connections": self.DATABASE_CONNECTION_POOL_SIZE,
            "connection_timeout": self.DATABASE_CONNECTION_TIMEOUT,
            "query_timeout": self.DATABASE_QUERY_TIMEOUT
        }
    
    def get_zetachain_config(self) -> Dict[str, Any]:
        """Get ZetaChain configuration dictionary."""
        return {
            "rpc_url": self.ZETA_RPC_URL,
            "chain_id": self.ZETA_CHAIN_ID,
            "contract_addresses": self.ZETA_CONTRACT_ADDRESSES
        }
    
    def get_hitl_config(self) -> Dict[str, Any]:
        """Get HITL console configuration dictionary."""
        return {
            "auto_escalation": self.HITL_AUTO_ESCALATION,
            "max_approval_time": self.HITL_MAX_APPROVAL_TIME,
            "emergency_approvers": self.HITL_EMERGENCY_APPROVERS,
            "escalation_timeouts": self.HITL_ESCALATION_TIMEOUTS
        }
    
    def get_agent_config(self) -> Dict[str, Any]:
        """Get agent configuration dictionary."""
        return {
            "health_check_interval": self.AGENT_HEALTH_CHECK_INTERVAL,
            "max_processing_time": self.AGENT_MAX_PROCESSING_TIME,
            "batch_size": self.AGENT_BATCH_SIZE,
            "max_retries": self.AGENT_MAX_RETRIES
        }
    
    def get_performance_config(self) -> Dict[str, Any]:
        """Get performance configuration dictionary."""
        return {
            "max_concurrent_events": self.MAX_CONCURRENT_EVENTS,
            "event_processing_timeout": self.EVENT_PROCESSING_TIMEOUT,
            "threat_analysis_timeout": self.THREAT_ANALYSIS_TIMEOUT,
            "action_execution_timeout": self.ACTION_EXECUTION_TIMEOUT
        }
    
    def get_logging_config(self) -> Dict[str, Any]:
        """Get logging configuration dictionary."""
        return {
            "level": self.LOG_LEVEL,
            "format": self.LOG_FORMAT,
            "file": self.LOG_FILE,
            "rotation": self.LOG_ROTATION,
            "retention": self.LOG_RETENTION
        }
    
    def get_security_config(self) -> Dict[str, Any]:
        """Get security configuration dictionary."""
        return {
            "api_rate_limit": self.API_RATE_LIMIT,
            "max_request_size": self.MAX_REQUEST_SIZE,
            "cors_origins": self.CORS_ORIGINS
        }
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        """Get monitoring configuration dictionary."""
        return {
            "metrics_enabled": self.METRICS_ENABLED,
            "metrics_interval": self.METRICS_INTERVAL,
            "health_check_enabled": self.HEALTH_CHECK_ENABLED,
            "health_check_interval": self.HEALTH_CHECK_INTERVAL
        }
    
    def get_cache_config(self) -> Dict[str, Any]:
        """Get cache configuration dictionary."""
        return {
            "enabled": self.CACHE_ENABLED,
            "ttl": self.CACHE_TTL,
            "max_size": self.CACHE_MAX_SIZE
        }
    
    def get_database_config(self) -> Dict[str, Any]:
        """Get database configuration dictionary."""
        return {
            "connection_pool_size": self.DATABASE_CONNECTION_POOL_SIZE,
            "connection_timeout": self.DATABASE_CONNECTION_TIMEOUT,
            "query_timeout": self.DATABASE_QUERY_TIMEOUT
        }
    
    def create_directories(self):
        """Create necessary directories."""
        self.LOGS_DIR.mkdir(exist_ok=True)
        self.DATA_DIR.mkdir(exist_ok=True)
        self.CONFIG_DIR.mkdir(exist_ok=True)
    
    def validate_configuration(self) -> bool:
        """Validate configuration settings."""
        try:
            # Check required API keys
            if not self.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY is required")
            
            # Check Redis configuration
            if not self.REDIS_URL and (not self.REDIS_HOST or not self.REDIS_PORT):
                raise ValueError("Either REDIS_URL or REDIS_HOST+REDIS_PORT must be specified")
            
            # Check Neo4j configuration
            if not self.NEO4J_URI:
                raise ValueError("NEO4J_URI is required")
            
            # Check ChromaDB configuration
            if not self.CHROMA_HOST or not self.CHROMA_PORT:
                raise ValueError("CHROMA_HOST and CHROMA_PORT are required")
            
            # Check blockchain configuration
            if not self.SUPPORTED_CHAINS:
                raise ValueError("SUPPORTED_CHAINS must not be empty")
            
            if not self.BLOCKCHAIN_RPC_URLS:
                raise ValueError("BLOCKCHAIN_RPC_URLS must not be empty")
            
            # Check ZetaChain configuration
            if not self.ZETA_RPC_URL:
                raise ValueError("ZETA_RPC_URL is required")
            
            return True
            
        except Exception as e:
            print(f"Configuration validation failed: {e}")
            return False
    
    def print_configuration(self):
        """Print current configuration (excluding sensitive data)."""
        config_summary = {
            "Application": {
                "Name": self.APP_NAME,
                "Version": self.APP_VERSION,
                "Environment": self.ENVIRONMENT,
                "Debug": self.DEBUG
            },
            "Redis": {
                "Host": self.REDIS_HOST,
                "Port": self.REDIS_PORT,
                "Database": self.REDIS_DB
            },
            "Neo4j": {
                "URI": self.NEO4J_URI,
                "User": self.NEO4J_USER
            },
            "ChromaDB": {
                "Host": self.CHROMA_HOST,
                "Port": self.CHROMA_PORT
            },
            "AI Models": {
                "Gemini Model": self.GEMINI_MODEL_NAME,
                "Embedding Model": self.EMBEDDING_MODEL
            },
            "Blockchain": {
                "Supported Chains": self.SUPPORTED_CHAINS,
                "ZetaChain ID": self.ZETA_CHAIN_ID
            },
            "Performance": {
                "Max Concurrent Events": self.MAX_CONCURRENT_EVENTS,
                "Event Processing Timeout": self.EVENT_PROCESSING_TIMEOUT
            }
        }
        
        print("Configuration Summary:")
        print("=" * 50)
        for category, settings in config_summary.items():
            print(f"\n{category}:")
            for key, value in settings.items():
                print(f"  {key}: {value}")


# Create global settings instance
settings = Settings()

# Validate configuration on import
if not settings.validate_configuration():
    print("⚠️  Configuration validation failed. Please check your environment variables.")
    print("   Required: GEMINI_API_KEY")
    print("   Recommended: REDIS_URL, NEO4J_URI, CHROMA_HOST, CHROMA_PORT")
    print("   See .env.example for template")

# Create directories
settings.create_directories()
