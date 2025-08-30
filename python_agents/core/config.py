"""
Configuration management for the Aegis Multi-Agent AI System.

This module provides centralized configuration management, loading settings
from environment variables and providing type-safe access to all system
configuration values.
"""

import os
import json
from typing import Dict, Any, List, Optional
from pathlib import Path
from dotenv import load_dotenv
from loguru import logger

# Load environment variables from .env file
load_dotenv()


class Config:
    """Centralized configuration management."""
    
    def __init__(self):
        """Initialize configuration from environment variables."""
        self._load_config()
    
    def _load_config(self):
        """Load all configuration values from environment."""
        # Application settings
        self.app_name = os.getenv("APP_NAME", "Aegis Multi-Agent AI System")
        self.app_version = os.getenv("APP_VERSION", "1.0.0")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        self.environment = os.getenv("ENVIRONMENT", "development")
        
        # Redis configuration
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = int(os.getenv("REDIS_DB", "0"))
        self.redis_password = os.getenv("REDIS_PASSWORD")
        self.redis_max_retries = int(os.getenv("REDIS_MAX_RETRIES", "3"))
        self.redis_retry_delay = float(os.getenv("REDIS_RETRY_DELAY", "1.0"))
        self.redis_max_queue_size = int(os.getenv("REDIS_MAX_QUEUE_SIZE", "10000"))
        
        # Neo4j configuration
        self.neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
        self.neo4j_max_connections = int(os.getenv("NEO4J_MAX_CONNECTIONS", "50"))
        self.neo4j_connection_timeout = int(os.getenv("NEO4J_CONNECTION_TIMEOUT", "30"))
        
        # ChromaDB configuration
        self.chroma_host = os.getenv("CHROMA_HOST", "localhost")
        self.chroma_port = int(os.getenv("CHROMA_PORT", "8000"))
        self.chroma_persist_directory = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
        self.chroma_anonymized_telemetry = os.getenv("CHROMA_ANONYMIZED_TELEMETRY", "false").lower() == "true"
        
        # AI model configuration
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "AIzaSyDpmYQsbFIZP7L1ZGSkjOPL3YT2nGTFSBI")
        self.gemini_model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-pro")
        self.gemini_max_tokens = int(os.getenv("GEMINI_MAX_TOKENS", "8192"))
        self.gemini_temperature = float(os.getenv("GEMINI_TEMPERATURE", "0.1"))
        self.gemini_top_p = float(os.getenv("GEMINI_TOP_P", "0.8"))
        
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.openai_model_name = os.getenv("OPENAI_MODEL_NAME", "gpt-4")
        self.openai_max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "4096"))
        
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.anthropic_model_name = os.getenv("ANTHROPIC_MODEL_NAME", "claude-3-sonnet")
        
        # Embedding model configuration
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self.embedding_dimensions = int(os.getenv("EMBEDDING_DIMENSIONS", "384"))
        self.embedding_batch_size = int(os.getenv("EMBEDDING_BATCH_SIZE", "32"))
        
        # Blockchain configuration
        self.supported_chains = self._parse_supported_chains()
        self.blockchain_rpc_urls = self._parse_blockchain_rpc_urls()
        
        # ZetaChain configuration
        self.zeta_rpc_url = os.getenv("ZETA_RPC_URL", "https://zetachain-athens-evm.blockpi.network/v1/rpc/public")
        self.zeta_chain_id = int(os.getenv("ZETA_CHAIN_ID", "7000"))
        self.zeta_contract_addresses = self._parse_zeta_contract_addresses()
        
        # HITL configuration
        self.hitl_auto_escalation = os.getenv("HITL_AUTO_ESCALATION", "true").lower() == "true"
        self.hitl_max_approval_time = int(os.getenv("HITL_MAX_APPROVAL_TIME", "60"))
        self.hitl_emergency_approvers = self._parse_emergency_approvers()
        
        # Agent configuration
        self.agent_health_check_interval = int(os.getenv("AGENT_HEALTH_CHECK_INTERVAL", "30"))
        self.agent_max_processing_time = int(os.getenv("AGENT_MAX_PROCESSING_TIME", "300"))
        self.agent_batch_size = int(os.getenv("AGENT_BATCH_SIZE", "100"))
        self.agent_max_retries = int(os.getenv("AGENT_MAX_RETRIES", "3"))
        
        # Performance configuration
        self.max_concurrent_events = int(os.getenv("MAX_CONCURRENT_EVENTS", "1000"))
        self.event_processing_timeout = int(os.getenv("EVENT_PROCESSING_TIMEOUT", "60"))
        self.threat_analysis_timeout = int(os.getenv("THREAT_ANALYSIS_TIMEOUT", "30"))
        self.action_execution_timeout = int(os.getenv("ACTION_EXECUTION_TIMEOUT", "120"))
        
        # Logging configuration
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.log_file = os.getenv("LOG_FILE", "logs/aegis_system.log")
        self.log_rotation = os.getenv("LOG_ROTATION", "100 MB")
        self.log_retention = os.getenv("LOG_RETENTION", "30 days")
        
        # Security configuration
        self.api_rate_limit = int(os.getenv("API_RATE_LIMIT", "1000"))
        self.max_request_size = int(os.getenv("MAX_REQUEST_SIZE", "10485760"))
        self.cors_origins = self._parse_cors_origins()
        
        # Monitoring configuration
        self.metrics_enabled = os.getenv("METRICS_ENABLED", "true").lower() == "true"
        self.metrics_interval = int(os.getenv("METRICS_INTERVAL", "60"))
        self.health_check_enabled = os.getenv("HEALTH_CHECK_ENABLED", "true").lower() == "true"
        self.health_check_interval = int(os.getenv("HEALTH_CHECK_INTERVAL", "30"))
        
        # Cache configuration
        self.cache_enabled = os.getenv("CACHE_ENABLED", "true").lower() == "true"
        self.cache_ttl = int(os.getenv("CACHE_TTL", "300"))
        self.cache_max_size = int(os.getenv("CACHE_MAX_SIZE", "10000"))
        
        # Database configuration
        self.database_connection_pool_size = int(os.getenv("DATABASE_CONNECTION_POOL_SIZE", "20"))
        self.database_connection_timeout = int(os.getenv("DATABASE_CONNECTION_TIMEOUT", "30"))
        self.database_query_timeout = int(os.getenv("DATABASE_QUERY_TIMEOUT", "60"))
        
        # Validate critical configuration
        self._validate_config()
        
        # Setup logging
        self._setup_logging()
    
    def _parse_supported_chains(self) -> List[int]:
        """Parse supported blockchain chain IDs."""
        try:
            chains_str = os.getenv("SUPPORTED_CHAINS", "1,56,137,42161,10,8453,1101,59144")
            return [int(chain.strip()) for chain in chains_str.split(",")]
        except (ValueError, AttributeError):
            logger.warning("Invalid SUPPORTED_CHAINS format, using defaults")
            return [1, 56, 137, 42161, 10, 8453, 1101, 59144]
    
    def _parse_blockchain_rpc_urls(self) -> Dict[str, str]:
        """Parse blockchain RPC URLs from JSON string."""
        try:
            rpc_urls_str = os.getenv("BLOCKCHAIN_RPC_URLS", "{}")
            return json.loads(rpc_urls_str)
        except (json.JSONDecodeError, AttributeError):
            logger.warning("Invalid BLOCKCHAIN_RPC_URLS format, using defaults")
            return {
                "1": "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
                "56": "https://bsc-dataseed.binance.org/",
                "137": "https://polygon-rpc.com/",
                "42161": "https://arb1.arbitrum.io/rpc",
                "10": "https://mainnet.optimism.io",
                "8453": "https://mainnet.base.org",
                "1101": "https://rpc.polygon-zkevm.gateway.fm",
                "59144": "https://rpc.linea.build"
            }
    
    def _parse_zeta_contract_addresses(self) -> Dict[str, str]:
        """Parse ZetaChain contract addresses from JSON string."""
        try:
            addresses_str = os.getenv("ZETA_CONTRACT_ADDRESSES", "{}")
            return json.loads(addresses_str)
        except (json.JSONDecodeError, AttributeError):
            logger.warning("Invalid ZETA_CONTRACT_ADDRESSES format, using defaults")
            return {
                "universal_security": "0x1234567890123456789012345678901234567890",
                "lending_pool": "0x2345678901234567890123456789012345678901",
                "voice_processor": "0x3456789012345678901234567890123456789012"
            }
    
    def _parse_emergency_approvers(self) -> List[str]:
        """Parse emergency approvers from comma-separated string."""
        try:
            approvers_str = os.getenv("HITL_EMERGENCY_APPROVERS", "emergency_admin,security_manager")
            return [approver.strip() for approver in approvers_str.split(",")]
        except (AttributeError, TypeError):
            logger.warning("Invalid HITL_EMERGENCY_APPROVERS format, using defaults")
            return ["emergency_admin", "security_manager"]
    
    def _parse_cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        try:
            origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://aegis.ai")
            return [origin.strip() for origin in origins_str.split(",")]
        except (AttributeError, TypeError):
            logger.warning("Invalid CORS_ORIGINS format, using defaults")
            return ["http://localhost:3000", "https://aegis.ai"]
    
    def _validate_config(self):
        """Validate critical configuration values."""
        errors = []
        
        # Check required API keys
        if not self.gemini_api_key:
            errors.append("GEMINI_API_KEY is required")
        
        # Check Redis configuration
        if not self.redis_host or not self.redis_port:
            errors.append("Redis host and port are required")
        
        # Check Neo4j configuration
        if not self.neo4j_uri or not self.neo4j_user or not self.neo4j_password:
            errors.append("Neo4j URI, user, and password are required")
        
        # Check ChromaDB configuration
        if not self.chroma_host or not self.chroma_port:
            errors.append("ChromaDB host and port are required")
        
        # Check ZetaChain configuration
        if not self.zeta_rpc_url or not self.zeta_chain_id:
            errors.append("ZetaChain RPC URL and chain ID are required")
        
        if errors:
            error_msg = "Configuration validation failed:\n" + "\n".join(f"- {error}" for error in errors)
            logger.error(error_msg)
            if self.environment == "production":
                raise ValueError(error_msg)
            else:
                logger.warning("Continuing with invalid configuration in development mode")
    
    def _setup_logging(self):
        """Setup logging configuration."""
        try:
            # Create logs directory if it doesn't exist
            log_path = Path(self.log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Configure loguru
            logger.remove()  # Remove default handler
            
            # Add console handler
            logger.add(
                lambda msg: print(msg, end=""),
                level=self.log_level,
                format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
            )
            
            # Add file handler
            logger.add(
                self.log_file,
                level=self.log_level,
                format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
                rotation=self.log_rotation,
                retention=self.log_retention,
                compression="zip"
            )
            
            logger.info(f"Logging configured - Level: {self.log_level}, File: {self.log_file}")
            
        except Exception as e:
            logger.error(f"Failed to setup logging: {e}")
            # Fallback to basic logging
            logger.add(lambda msg: print(msg, end=""), level="INFO")
    
    def get_redis_config(self) -> Dict[str, Any]:
        """Get Redis configuration as dictionary."""
        return {
            "url": self.redis_url,
            "host": self.redis_host,
            "port": self.redis_port,
            "db": self.redis_db,
            "password": self.redis_password,
            "max_retries": self.redis_max_retries,
            "retry_delay": self.redis_retry_delay,
            "max_queue_size": self.redis_max_queue_size
        }
    
    def get_neo4j_config(self) -> Dict[str, Any]:
        """Get Neo4j configuration as dictionary."""
        return {
            "uri": self.neo4j_uri,
            "user": self.neo4j_user,
            "password": self.neo4j_password,
            "max_connections": self.neo4j_max_connections,
            "connection_timeout": self.neo4j_connection_timeout
        }
    
    def get_chroma_config(self) -> Dict[str, Any]:
        """Get ChromaDB configuration as dictionary."""
        return {
            "host": self.chroma_host,
            "port": self.chroma_port,
            "persist_directory": self.chroma_persist_directory,
            "anonymized_telemetry": self.chroma_anonymized_telemetry
        }
    
    def get_gemini_config(self) -> Dict[str, Any]:
        """Get Gemini configuration as dictionary."""
        return {
            "api_key": self.gemini_api_key,
            "model_name": self.gemini_model_name,
            "max_tokens": self.gemini_max_tokens,
            "temperature": self.gemini_temperature,
            "top_p": self.gemini_top_p
        }
    
    def get_blockchain_config(self) -> Dict[str, Any]:
        """Get blockchain configuration as dictionary."""
        return {
            "supported_chains": self.supported_chains,
            "rpc_urls": self.blockchain_rpc_urls,
            "zeta_rpc_url": self.zeta_rpc_url,
            "zeta_chain_id": self.zeta_chain_id,
            "zeta_contract_addresses": self.zeta_contract_addresses
        }
    
    def get_hitl_config(self) -> Dict[str, Any]:
        """Get HITL configuration as dictionary."""
        return {
            "auto_escalation": self.hitl_auto_escalation,
            "max_approval_time": self.hitl_max_approval_time,
            "emergency_approvers": self.hitl_emergency_approvers
        }
    
    def get_agent_config(self) -> Dict[str, Any]:
        """Get agent configuration as dictionary."""
        return {
            "health_check_interval": self.agent_health_check_interval,
            "max_processing_time": self.agent_max_processing_time,
            "batch_size": self.agent_batch_size,
            "max_retries": self.agent_max_retries
        }
    
    def get_performance_config(self) -> Dict[str, Any]:
        """Get performance configuration as dictionary."""
        return {
            "max_concurrent_events": self.max_concurrent_events,
            "event_processing_timeout": self.event_processing_timeout,
            "threat_analysis_timeout": self.threat_analysis_timeout,
            "action_execution_timeout": self.action_execution_timeout
        }
    
    def get_monitoring_config(self) -> Dict[str, Any]:
        """Get monitoring configuration as dictionary."""
        return {
            "metrics_enabled": self.metrics_enabled,
            "metrics_interval": self.metrics_interval,
            "health_check_enabled": self.health_check_enabled,
            "health_check_interval": self.health_check_interval
        }
    
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() == "development"
    
    def is_testing(self) -> bool:
        """Check if running in testing environment."""
        return self.environment.lower() == "testing"
    
    def get_all_config(self) -> Dict[str, Any]:
        """Get all configuration as a dictionary."""
        return {
            "app": {
                "name": self.app_name,
                "version": self.app_version,
                "debug": self.debug,
                "environment": self.environment
            },
            "redis": self.get_redis_config(),
            "neo4j": self.get_neo4j_config(),
            "chroma": self.get_chroma_config(),
            "gemini": self.get_gemini_config(),
            "blockchain": self.get_blockchain_config(),
            "hitl": self.get_hitl_config(),
            "agent": self.get_agent_config(),
            "performance": self.get_performance_config(),
            "monitoring": self.get_monitoring_config(),
            "logging": {
                "level": self.log_level,
                "file": self.log_file,
                "rotation": self.log_rotation,
                "retention": self.log_retention
            },
            "security": {
                "api_rate_limit": self.api_rate_limit,
                "max_request_size": self.max_request_size,
                "cors_origins": self.cors_origins
            },
            "cache": {
                "enabled": self.cache_enabled,
                "ttl": self.cache_ttl,
                "max_size": self.cache_max_size
            },
            "database": {
                "connection_pool_size": self.database_connection_pool_size,
                "connection_timeout": self.database_connection_timeout,
                "query_timeout": self.database_query_timeout
            }
        }
    
    def reload(self):
        """Reload configuration from environment variables."""
        logger.info("Reloading configuration...")
        self._load_config()
        logger.info("Configuration reloaded successfully")
    
    def validate_connection(self, service: str) -> bool:
        """Validate connection to a specific service."""
        try:
            if service == "redis":
                import aioredis
                # This is a basic validation - actual connection test happens in MessageBroker
                return bool(self.redis_host and self.redis_port)
            
            elif service == "neo4j":
                # This is a basic validation - actual connection test happens in RAGEngine
                return bool(self.neo4j_uri and self.neo4j_user and self.neo4j_password)
            
            elif service == "chroma":
                # This is a basic validation - actual connection test happens in RAGEngine
                return bool(self.chroma_host and self.chroma_port)
            
            elif service == "gemini":
                return bool(self.gemini_api_key)
            
            else:
                logger.warning(f"Unknown service for validation: {service}")
                return False
                
        except Exception as e:
            logger.error(f"Error validating {service} connection: {e}")
            return False


# Global configuration instance
config = Config()

# Export commonly used configuration values
__all__ = [
    "config",
    "Config"
]
