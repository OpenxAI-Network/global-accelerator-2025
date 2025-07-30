from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, List
import os
from datetime import datetime, timedelta
import json

# Import our modules
from models.prediction_model import PredictionModel
from models.fraud_detection_model import FraudDetectionModel
from models.sentiment_model import SentimentModel
from models.portfolio_optimizer import PortfolioOptimizer
from services.data_service import DataService
from services.arweave_service import ArweaveService
from services.blockchain_service import BlockchainService
from utils.logger import setup_logger
from utils.config import Config
from schemas.requests import (
    PredictionRequest,
    FraudScanRequest,
    ChatRequest,
    InsightRequest,
    PortfolioOptimizationRequest
)
from schemas.responses import (
    PredictionResponse,
    FraudScanResponse,
    ChatResponse,
    InsightResponse,
    StatsResponse
)

# Setup logging
logger = setup_logger(__name__)

# Global variables for models and services
prediction_model: Optional[PredictionModel] = None
fraud_model: Optional[FraudDetectionModel] = None
sentiment_model: Optional[SentimentModel] = None
portfolio_optimizer: Optional[PortfolioOptimizer] = None
data_service: Optional[DataService] = None
arweave_service: Optional[ArweaveService] = None
blockchain_service: Optional[BlockchainService] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🤖 Starting PsyFi AI Service...")
    
    global prediction_model, fraud_model, sentiment_model, portfolio_optimizer
    global data_service, arweave_service, blockchain_service
    
    try:
        # Initialize configuration
        config = Config()
        
        # Initialize services
        logger.info("Initializing services...")
        data_service = DataService(config)
        arweave_service = ArweaveService(config)
        blockchain_service = BlockchainService(config)
        
        await data_service.initialize()
        await arweave_service.initialize()
        await blockchain_service.initialize()
        
        # Initialize AI models
        logger.info("Loading AI models...")
        prediction_model = PredictionModel(config)
        fraud_model = FraudDetectionModel(config)
        sentiment_model = SentimentModel(config)
        portfolio_optimizer = PortfolioOptimizer(config)
        
        # Load pre-trained models
        await prediction_model.load_models()
        await fraud_model.load_models()
        await sentiment_model.load_models()
        await portfolio_optimizer.load_models()
        
        # Start background tasks
        asyncio.create_task(background_model_updates())
        asyncio.create_task(background_data_collection())
        
        logger.info("✅ PsyFi AI Service started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to start AI service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down PsyFi AI Service...")
    
    # Save models
    if prediction_model:
        await prediction_model.save_models()
    if fraud_model:
        await fraud_model.save_models()
    if sentiment_model:
        await sentiment_model.save_models()
    if portfolio_optimizer:
        await portfolio_optimizer.save_models()
    
    # Close services
    if data_service:
        await data_service.close()
    if arweave_service:
        await arweave_service.close()
    if blockchain_service:
        await blockchain_service.close()
    
    logger.info("✅ AI Service shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="PsyFi AI Service",
    description="AI-powered DeFi analysis and prediction service",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "models_loaded": {
            "prediction": prediction_model is not None and prediction_model.is_loaded(),
            "fraud_detection": fraud_model is not None and fraud_model.is_loaded(),
            "sentiment": sentiment_model is not None and sentiment_model.is_loaded(),
            "portfolio_optimizer": portfolio_optimizer is not None and portfolio_optimizer.is_loaded()
        }
    }

# AI Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest, background_tasks: BackgroundTasks):
    """Generate AI prediction for asset price/trend"""
    try:
        if not prediction_model or not prediction_model.is_loaded():
            raise HTTPException(status_code=503, detail="Prediction model not available")
        
        logger.info(f"Generating prediction for {request.asset} ({request.timeframe})")
        
        # Get current market data
        market_data = await data_service.get_market_data(request.asset)
        if not market_data:
            raise HTTPException(status_code=404, detail=f"Market data not found for {request.asset}")
        
        # Generate prediction
        prediction_result = await prediction_model.predict(
            asset=request.asset,
            timeframe=request.timeframe,
            prediction_type=request.prediction_type,
            market_data=market_data
        )
        
        # Store prediction on Arweave in background
        background_tasks.add_task(
            store_prediction_on_arweave,
            prediction_result,
            request.asset
        )
        
        return PredictionResponse(**prediction_result)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Fraud Detection endpoint
@app.post("/fraud/scan", response_model=FraudScanResponse)
async def scan_fraud(request: FraudScanRequest, background_tasks: BackgroundTasks):
    """Scan wallet address for fraudulent activity"""
    try:
        if not fraud_model or not fraud_model.is_loaded():
            raise HTTPException(status_code=503, detail="Fraud detection model not available")
        
        logger.info(f"Scanning wallet for fraud: {request.wallet_address}")
        
        # Get wallet transaction history
        wallet_data = await blockchain_service.get_wallet_data(request.wallet_address)
        if not wallet_data:
            raise HTTPException(status_code=404, detail="Wallet data not found")
        
        # Perform fraud analysis
        fraud_result = await fraud_model.analyze_wallet(
            wallet_address=request.wallet_address,
            wallet_data=wallet_data
        )
        
        # Store scan result on Arweave in background
        background_tasks.add_task(
            store_fraud_scan_on_arweave,
            fraud_result,
            request.wallet_address
        )
        
        return FraudScanResponse(**fraud_result)
        
    except Exception as e:
        logger.error(f"Fraud scan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# AI Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """AI chat interface for user queries"""
    try:
        if not sentiment_model or not sentiment_model.is_loaded():
            raise HTTPException(status_code=503, detail="Chat model not available")
        
        logger.info(f"Processing chat message: {request.message[:50]}...")
        
        # Analyze message sentiment and intent
        message_analysis = await sentiment_model.analyze_message(request.message)
        
        # Get relevant context
        context = await get_chat_context(request.context, message_analysis)
        
        # Generate response
        response = await sentiment_model.generate_response(
            message=request.message,
            context=context,
            analysis=message_analysis
        )
        
        return ChatResponse(**response)
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate AI Insight endpoint
@app.post("/generate-insight", response_model=InsightResponse)
async def generate_insight(request: InsightRequest, background_tasks: BackgroundTasks):
    """Generate comprehensive AI insight"""
    try:
        logger.info(f"Generating {request.type} insight")
        
        # Route to appropriate model based on insight type
        if request.type == "market":
            if not prediction_model or not prediction_model.is_loaded():
                raise HTTPException(status_code=503, detail="Prediction model not available")
            insight = await prediction_model.generate_market_insight(request.parameters)
            
        elif request.type == "portfolio":
            if not portfolio_optimizer or not portfolio_optimizer.is_loaded():
                raise HTTPException(status_code=503, detail="Portfolio optimizer not available")
            insight = await portfolio_optimizer.generate_portfolio_insight(request.parameters)
            
        elif request.type == "risk":
            if not fraud_model or not fraud_model.is_loaded():
                raise HTTPException(status_code=503, detail="Risk model not available")
            insight = await fraud_model.generate_risk_insight(request.parameters)
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown insight type: {request.type}")
        
        # Store insight on Arweave in background
        background_tasks.add_task(
            store_insight_on_arweave,
            insight,
            request.type
        )
        
        return InsightResponse(**insight)
        
    except Exception as e:
        logger.error(f"Insight generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Portfolio Optimization endpoint
@app.post("/optimize-portfolio")
async def optimize_portfolio(request: PortfolioOptimizationRequest):
    """Optimize portfolio allocation using AI"""
    try:
        if not portfolio_optimizer or not portfolio_optimizer.is_loaded():
            raise HTTPException(status_code=503, detail="Portfolio optimizer not available")
        
        logger.info(f"Optimizing portfolio for risk level: {request.risk_level}")
        
        # Get market data for assets
        market_data = {}
        for asset in request.assets:
            data = await data_service.get_market_data(asset)
            if data:
                market_data[asset] = data
        
        # Perform optimization
        optimization_result = await portfolio_optimizer.optimize(
            assets=request.assets,
            risk_level=request.risk_level,
            investment_amount=request.investment_amount,
            constraints=request.constraints,
            market_data=market_data
        )
        
        return optimization_result
        
    except Exception as e:
        logger.error(f"Portfolio optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model Statistics endpoint
@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get AI model statistics and performance metrics"""
    try:
        stats = {
            "models": {
                "prediction": await prediction_model.get_stats() if prediction_model else None,
                "fraud_detection": await fraud_model.get_stats() if fraud_model else None,
                "sentiment": await sentiment_model.get_stats() if sentiment_model else None,
                "portfolio_optimizer": await portfolio_optimizer.get_stats() if portfolio_optimizer else None
            },
            "system": {
                "uptime": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "total_predictions": await get_total_predictions(),
                "total_fraud_scans": await get_total_fraud_scans(),
                "average_response_time": await get_average_response_time()
            }
        }
        
        return StatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Market Data endpoint
@app.get("/market/{symbol}")
async def get_market_data(symbol: str):
    """Get current market data for a symbol"""
    try:
        if not data_service:
            raise HTTPException(status_code=503, detail="Data service not available")
        
        market_data = await data_service.get_market_data(symbol)
        if not market_data:
            raise HTTPException(status_code=404, detail=f"Market data not found for {symbol}")
        
        return market_data
        
    except Exception as e:
        logger.error(f"Market data error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment Analysis endpoint
@app.post("/sentiment")
async def analyze_sentiment(text: str):
    """Analyze sentiment of text"""
    try:
        if not sentiment_model or not sentiment_model.is_loaded():
            raise HTTPException(status_code=503, detail="Sentiment model not available")
        
        sentiment = await sentiment_model.analyze_text_sentiment(text)
        return sentiment
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background Tasks
async def background_model_updates():
    """Background task to update models periodically"""
    while True:
        try:
            logger.info("Running background model updates...")
            
            # Update prediction models with new data
            if prediction_model:
                await prediction_model.update_with_new_data()
            
            # Update fraud detection patterns
            if fraud_model:
                await fraud_model.update_fraud_patterns()
            
            # Update sentiment analysis
            if sentiment_model:
                await sentiment_model.update_sentiment_data()
            
            # Update portfolio optimization parameters
            if portfolio_optimizer:
                await portfolio_optimizer.update_market_parameters()
            
            logger.info("Background model updates completed")
            
        except Exception as e:
            logger.error(f"Background update error: {e}")
        
        # Wait 1 hour before next update
        await asyncio.sleep(3600)

async def background_data_collection():
    """Background task to collect market data"""
    while True:
        try:
            logger.info("Collecting market data...")
            
            if data_service:
                await data_service.collect_market_data()
                await data_service.collect_social_sentiment()
                await data_service.collect_defi_data()
            
            logger.info("Market data collection completed")
            
        except Exception as e:
            logger.error(f"Data collection error: {e}")
        
        # Wait 5 minutes before next collection
        await asyncio.sleep(300)

# Helper functions
async def store_prediction_on_arweave(prediction: Dict[str, Any], asset: str):
    """Store prediction result on Arweave"""
    try:
        if arweave_service:
            await arweave_service.store_prediction(prediction, asset)
    except Exception as e:
        logger.error(f"Failed to store prediction on Arweave: {e}")

async def store_fraud_scan_on_arweave(scan_result: Dict[str, Any], wallet_address: str):
    """Store fraud scan result on Arweave"""
    try:
        if arweave_service:
            await arweave_service.store_fraud_scan(scan_result, wallet_address)
    except Exception as e:
        logger.error(f"Failed to store fraud scan on Arweave: {e}")

async def store_insight_on_arweave(insight: Dict[str, Any], insight_type: str):
    """Store AI insight on Arweave"""
    try:
        if arweave_service:
            await arweave_service.store_insight(insight, insight_type)
    except Exception as e:
        logger.error(f"Failed to store insight on Arweave: {e}")

async def get_chat_context(user_context: Optional[Dict], message_analysis: Dict) -> Dict:
    """Get relevant context for chat response"""
    context = user_context or {}
    
    # Add market context if relevant
    if message_analysis.get("intent") == "market_query":
        if data_service:
            context["market_data"] = await data_service.get_trending_assets()
    
    # Add portfolio context if relevant
    if message_analysis.get("intent") == "portfolio_query":
        context["portfolio_tips"] = await get_portfolio_tips()
    
    return context

async def get_portfolio_tips() -> List[str]:
    """Get general portfolio tips"""
    return [
        "Diversify across different asset classes",
        "Consider your risk tolerance",
        "Regular rebalancing is important",
        "Don't invest more than you can afford to lose"
    ]

async def get_total_predictions() -> int:
    """Get total number of predictions made"""
    # This would typically query a database
    return 0

async def get_total_fraud_scans() -> int:
    """Get total number of fraud scans performed"""
    # This would typically query a database
    return 0

async def get_average_response_time() -> float:
    """Get average API response time"""
    # This would typically be calculated from metrics
    return 0.0

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
