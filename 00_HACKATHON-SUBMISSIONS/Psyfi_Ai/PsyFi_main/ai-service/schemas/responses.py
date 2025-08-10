from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class PredictionResponse(BaseModel):
    asset: str
    current_price: float
    predicted_price: float
    predicted_change: float
    confidence: float = Field(..., ge=0, le=100)
    reasoning: str
    timeframe: str
    prediction_type: str
    model_version: str
    timestamp: str
    market_conditions: Optional[Dict[str, Any]] = None

class RiskFactor(BaseModel):
    pattern: str
    description: str
    severity: str
    risk_score: float = Field(..., ge=0, le=100)

class BehavioralAnalysis(BaseModel):
    patterns: List[str]
    anomalies: List[str]
    recommendations: List[str]
    behavior_score: float = Field(..., ge=0, le=100)

class TransactionSummary(BaseModel):
    total_transactions: int
    total_volume: str
    first_activity: str
    last_activity: str
    unique_addresses: int

class FraudScanResponse(BaseModel):
    scan_id: str
    wallet_address: str
    risk_level: str
    safety_score: int = Field(..., ge=0, le=100)
    risk_factors: List[RiskFactor]
    behavioral_analysis: BehavioralAnalysis
    transaction_summary: TransactionSummary
    recommendations: List[str]
    scan_timestamp: str
    model_version: str

class ChatResponse(BaseModel):
    response: str
    confidence: float = Field(..., ge=0, le=100)
    intent: Optional[str] = None
    suggestions: Optional[List[str]] = None
    timestamp: str

class AssetInsight(BaseModel):
    asset: str
    prediction: float
    confidence: float
    reasoning: str

class InsightResponse(BaseModel):
    title: str
    type: str
    timeframe: Optional[str] = None
    overall_sentiment: Optional[str] = None
    confidence: float = Field(..., ge=0, le=100)
    asset_insights: Optional[List[AssetInsight]] = None
    key_factors: List[str]
    recommendations: List[str]
    risk_factors: List[str]
    generated_at: str

class ModelStats(BaseModel):
    models_loaded: int
    assets_covered: List[str]
    total_predictions: int
    average_confidence: float
    model_performance: Dict[str, Any]
    last_updated: str

class SystemStats(BaseModel):
    uptime: str
    version: str
    total_predictions: int
    total_fraud_scans: int
    average_response_time: float

class StatsResponse(BaseModel):
    models: Dict[str, Optional[ModelStats]]
    system: SystemStats

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float = Field(..., ge=0, le=100)
    emotions: Dict[str, float]
    keywords: List[str]
    timestamp: str

class MarketDataResponse(BaseModel):
    symbol: str
    price: float
    volume: float
    market_cap: Optional[float] = None
    change_24h: float
    volatility: float
    timestamp: str

class PortfolioAllocation(BaseModel):
    asset: str
    allocation_percentage: float = Field(..., ge=0, le=100)
    recommended_amount: float
    reasoning: str

class PortfolioOptimizationResponse(BaseModel):
    allocations: List[PortfolioAllocation]
    expected_return: float
    expected_risk: float
    sharpe_ratio: float
    recommendations: List[str]
    rebalancing_frequency: str
    timestamp: str
