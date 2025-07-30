from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum

class PredictionType(str, Enum):
    PRICE = "price"
    TREND = "trend"
    SENTIMENT = "sentiment"

class Timeframe(str, Enum):
    ONE_HOUR = "1h"
    FOUR_HOURS = "4h"
    ONE_DAY = "1d"
    SEVEN_DAYS = "7d"
    THIRTY_DAYS = "30d"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class InsightType(str, Enum):
    MARKET = "market"
    PORTFOLIO = "portfolio"
    RISK = "risk"

class PredictionRequest(BaseModel):
    asset: str = Field(..., description="Asset symbol (e.g., BTC, ETH)")
    timeframe: Timeframe = Field(..., description="Prediction timeframe")
    prediction_type: PredictionType = Field(default=PredictionType.PRICE, description="Type of prediction")

class FraudScanRequest(BaseModel):
    wallet_address: str = Field(..., description="Wallet address to scan", regex=r"^0x[a-fA-F0-9]{40}$")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")

class InsightRequest(BaseModel):
    type: InsightType = Field(..., description="Type of insight to generate")
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Additional parameters")
    user_id: Optional[int] = Field(default=None, description="User ID for personalized insights")

class PortfolioOptimizationRequest(BaseModel):
    assets: List[str] = Field(..., description="List of assets to optimize")
    risk_level: RiskLevel = Field(..., description="Risk tolerance level")
    investment_amount: float = Field(..., gt=0, description="Total investment amount")
    constraints: Optional[Dict[str, Any]] = Field(default=None, description="Optimization constraints")

class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to analyze")
    context: Optional[str] = Field(default=None, description="Context for sentiment analysis")

class MarketDataRequest(BaseModel):
    symbols: List[str] = Field(..., description="List of symbols to fetch")
    timeframe: Optional[str] = Field(default="1d", description="Data timeframe")
    limit: Optional[int] = Field(default=100, ge=1, le=1000, description="Number of data points")
