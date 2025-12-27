import os
from pathlib import Path
from typing import Optional

class Config:
    """Configuration class for AI service"""
    
    def __init__(self):
        # Base paths
        self.BASE_DIR = Path(__file__).parent.parent
        self.MODEL_PATH = os.getenv("MODEL_PATH", str(self.BASE_DIR / "models"))
        self.DATA_PATH = os.getenv("DATA_PATH", str(self.BASE_DIR / "data"))
        
        # API Configuration
        self.API_HOST = os.getenv("API_HOST", "0.0.0.0")
        self.API_PORT = int(os.getenv("API_PORT", "8000"))
        self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"
        
        # Database Configuration
        self.DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://psyfi_user:psyfi_password@localhost:5432/psyfi")
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
        
        # Arweave Configuration
        self.ARWEAVE_WALLET_PATH = os.getenv("ARWEAVE_WALLET_PATH", "./arweave-wallet.json")
        self.ARWEAVE_HOST = os.getenv("ARWEAVE_HOST", "arweave.net")
        self.ARWEAVE_PORT = int(os.getenv("ARWEAVE_PORT", "443"))
        self.ARWEAVE_PROTOCOL = os.getenv("ARWEAVE_PROTOCOL", "https")
        
        # Blockchain Configuration
        self.ETHEREUM_RPC_URL = os.getenv("ETHEREUM_RPC_URL", "https://mainnet.infura.io/v3/your-project-id")
        self.POLYGON_RPC_URL = os.getenv("POLYGON_RPC_URL", "https://polygon-mainnet.infura.io/v3/your-project-id")
        self.BSC_RPC_URL = os.getenv("BSC_RPC_URL", "https://bsc-dataseed.binance.org/")
        
        # External API Keys
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY")
        self.ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
        self.POLYGONSCAN_API_KEY = os.getenv("POLYGONSCAN_API_KEY")
        self.BSCSCAN_API_KEY = os.getenv("BSCSCAN_API_KEY")
        
        # Model Configuration
        self.PREDICTION_MODEL_VERSION = os.getenv("PREDICTION_MODEL_VERSION", "1.0.0")
        self.FRAUD_MODEL_VERSION = os.getenv("FRAUD_MODEL_VERSION", "1.0.0")
        self.SENTIMENT_MODEL_VERSION = os.getenv("SENTIMENT_MODEL_VERSION", "1.0.0")
        
        # Training Configuration
        self.BATCH_SIZE = int(os.getenv("BATCH_SIZE", "32"))
        self.LEARNING_RATE = float(os.getenv("LEARNING_RATE", "0.001"))
        self.EPOCHS = int(os.getenv("EPOCHS", "100"))
        self.SEQUENCE_LENGTH = int(os.getenv("SEQUENCE_LENGTH", "60"))
        
        # Cache Configuration
        self.CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour
        self.PREDICTION_CACHE_TTL = int(os.getenv("PREDICTION_CACHE_TTL", "1800"))  # 30 minutes
        self.MARKET_DATA_CACHE_TTL = int(os.getenv("MARKET_DATA_CACHE_TTL", "300"))  # 5 minutes
        
        # Rate Limiting
        self.RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
        self.RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 hour
        
        # Logging Configuration
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.LOG_FORMAT = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        
        # Security Configuration
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # Feature Flags
        self.ENABLE_FRAUD_DETECTION = os.getenv("ENABLE_FRAUD_DETECTION", "true").lower() == "true"
        self.ENABLE_SENTIMENT_ANALYSIS = os.getenv("ENABLE_SENTIMENT_ANALYSIS", "true").lower() == "true"
        self.ENABLE_PORTFOLIO_OPTIMIZATION = os.getenv("ENABLE_PORTFOLIO_OPTIMIZATION", "true").lower() == "true"
        self.ENABLE_REAL_TIME_UPDATES = os.getenv("ENABLE_REAL_TIME_UPDATES", "true").lower() == "true"
        
        # Performance Configuration
        self.MAX_WORKERS = int(os.getenv("MAX_WORKERS", "4"))
        self.WORKER_TIMEOUT = int(os.getenv("WORKER_TIMEOUT", "300"))  # 5 minutes
        self.MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", "100"))
        
        # Data Collection Configuration
        self.DATA_COLLECTION_INTERVAL = int(os.getenv("DATA_COLLECTION_INTERVAL", "300"))  # 5 minutes
        self.MODEL_UPDATE_INTERVAL = int(os.getenv("MODEL_UPDATE_INTERVAL", "3600"))  # 1 hour
        self.FRAUD_PATTERN_UPDATE_INTERVAL = int(os.getenv("FRAUD_PATTERN_UPDATE_INTERVAL", "86400"))  # 24 hours
        
        # Validation
        self._validate_config()
    
    def _validate_config(self):
        """Validate configuration values"""
        # Create directories if they don't exist
        Path(self.MODEL_PATH).mkdir(parents=True, exist_ok=True)
        Path(self.DATA_PATH).mkdir(parents=True, exist_ok=True)
        
        # Validate required configurations
        if not self.SECRET_KEY or self.SECRET_KEY == "your-secret-key-change-in-production":
            if not self.DEBUG:
                raise ValueError("SECRET_KEY must be set in production")
        
        # Validate numeric ranges
        if self.BATCH_SIZE <= 0:
            raise ValueError("BATCH_SIZE must be positive")
        
        if self.LEARNING_RATE <= 0 or self.LEARNING_RATE >= 1:
            raise ValueError("LEARNING_RATE must be between 0 and 1")
        
        if self.SEQUENCE_LENGTH <= 0:
            raise ValueError("SEQUENCE_LENGTH must be positive")
    
    def get_database_config(self) -> dict:
        """Get database configuration"""
        return {
            "url": self.DATABASE_URL,
            "pool_size": 10,
            "max_overflow": 20,
            "pool_timeout": 30,
            "pool_recycle": 3600
        }
    
    def get_redis_config(self) -> dict:
        """Get Redis configuration"""
        return {
            "url": self.REDIS_URL,
            "decode_responses": True,
            "retry_on_timeout": True,
            "socket_timeout": 5,
            "socket_connect_timeout": 5
        }
    
    def get_arweave_config(self) -> dict:
        """Get Arweave configuration"""
        return {
            "host": self.ARWEAVE_HOST,
            "port": self.ARWEAVE_PORT,
            "protocol": self.ARWEAVE_PROTOCOL,
            "wallet_path": self.ARWEAVE_WALLET_PATH
        }
    
    def get_model_config(self) -> dict:
        """Get model configuration"""
        return {
            "batch_size": self.BATCH_SIZE,
            "learning_rate": self.LEARNING_RATE,
            "epochs": self.EPOCHS,
            "sequence_length": self.SEQUENCE_LENGTH,
            "model_path": self.MODEL_PATH
        }
    
    def is_production(self) -> bool:
        """Check if running in production"""
        return not self.DEBUG
    
    def __repr__(self):
        return f"Config(debug={self.DEBUG}, model_path='{self.MODEL_PATH}')"
