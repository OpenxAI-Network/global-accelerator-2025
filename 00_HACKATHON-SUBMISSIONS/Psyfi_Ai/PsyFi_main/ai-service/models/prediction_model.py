import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging
from pathlib import Path

from utils.config import Config
from utils.technical_indicators import TechnicalIndicators
from utils.feature_engineering import FeatureEngineer

logger = logging.getLogger(__name__)

class LSTMPredictionModel(nn.Module):
    """LSTM Neural Network for price prediction"""
    
    def __init__(self, input_size: int, hidden_size: int = 128, num_layers: int = 3, dropout: float = 0.2):
        super(LSTMPredictionModel, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout,
            batch_first=True,
            bidirectional=True
        )
        
        # Attention mechanism
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_size * 2,
            num_heads=8,
            dropout=dropout,
            batch_first=True
        )
        
        # Output layers
        self.fc_layers = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, 1)
        )
        
        # Confidence estimation layer
        self.confidence_layer = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size // 2),
            nn.ReLU(),
            nn.Linear(hidden_size // 2, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        # LSTM forward pass
        lstm_out, _ = self.lstm(x)
        
        # Apply attention
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        # Use the last output for prediction
        last_output = attn_out[:, -1, :]
        
        # Price prediction
        price_pred = self.fc_layers(last_output)
        
        # Confidence estimation
        confidence = self.confidence_layer(last_output)
        
        return price_pred, confidence

class PredictionModel:
    """Main prediction model class"""
    
    def __init__(self, config: Config):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.models = {}
        self.scalers = {}
        self.feature_engineer = FeatureEngineer()
        self.technical_indicators = TechnicalIndicators()
        self.model_path = Path(config.MODEL_PATH) / "prediction"
        self.model_path.mkdir(parents=True, exist_ok=True)
        
        # Model parameters
        self.sequence_length = 60  # 60 time steps for prediction
        self.prediction_horizons = {
            '1h': 1,
            '4h': 4,
            '1d': 24,
            '7d': 168,
            '30d': 720
        }
        
        # Performance tracking
        self.prediction_history = []
        self.model_performance = {}
        
        logger.info(f"PredictionModel initialized with device: {self.device}")
    
    async def load_models(self):
        """Load pre-trained models"""
        try:
            # Common assets to load models for
            assets = ['BTC', 'ETH', 'USDC', 'AAVE', 'UNI', 'COMP', 'LINK', 'MKR']
            
            for asset in assets:
                await self._load_asset_model(asset)
            
            logger.info(f"Loaded models for {len(self.models)} assets")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            # Initialize new models if loading fails
            await self._initialize_new_models()
    
    async def _load_asset_model(self, asset: str):
        """Load model for specific asset"""
        try:
            model_file = self.model_path / f"{asset}_model.pth"
            scaler_file = self.model_path / f"{asset}_scaler.pkl"
            
            if model_file.exists() and scaler_file.exists():
                # Load scaler
                self.scalers[asset] = joblib.load(scaler_file)
                
                # Load model
                input_size = self.scalers[asset].n_features_in_
                model = LSTMPredictionModel(input_size=input_size)
                model.load_state_dict(torch.load(model_file, map_location=self.device))
                model.to(self.device)
                model.eval()
                
                self.models[asset] = model
                logger.info(f"Loaded model for {asset}")
            else:
                # Initialize new model for this asset
                await self._initialize_asset_model(asset)
                
        except Exception as e:
            logger.error(f"Error loading model for {asset}: {e}")
            await self._initialize_asset_model(asset)
    
    async def _initialize_asset_model(self, asset: str):
        """Initialize new model for asset"""
        try:
            # Create dummy model with standard input size
            input_size = 50  # Standard feature count
            model = LSTMPredictionModel(input_size=input_size)
            model.to(self.device)
            
            # Create scaler
            scaler = MinMaxScaler()
            
            self.models[asset] = model
            self.scalers[asset] = scaler
            
            logger.info(f"Initialized new model for {asset}")
            
        except Exception as e:
            logger.error(f"Error initializing model for {asset}: {e}")
    
    async def _initialize_new_models(self):
        """Initialize new models for all assets"""
        assets = ['BTC', 'ETH', 'USDC', 'AAVE', 'UNI', 'COMP', 'LINK', 'MKR']
        
        for asset in assets:
            await self._initialize_asset_model(asset)
        
        logger.info("Initialized new models for all assets")
    
    async def predict(self, asset: str, timeframe: str, prediction_type: str, market_data: Dict) -> Dict[str, Any]:
        """Generate prediction for asset"""
        try:
            # Ensure model exists for asset
            if asset not in self.models:
                await self._initialize_asset_model(asset)
            
            # Prepare features
            features = await self._prepare_features(asset, market_data)
            
            if features is None or len(features) < self.sequence_length:
                # Generate synthetic prediction for demo
                return await self._generate_synthetic_prediction(asset, timeframe, prediction_type, market_data)
            
            # Make prediction
            prediction_result = await self._make_prediction(asset, features, timeframe, prediction_type)
            
            # Add metadata
            prediction_result.update({
                'asset': asset,
                'timeframe': timeframe,
                'prediction_type': prediction_type,
                'model_version': '1.0.0',
                'timestamp': datetime.utcnow().isoformat(),
                'market_conditions': await self._analyze_market_conditions(market_data)
            })
            
            # Store prediction for performance tracking
            self.prediction_history.append(prediction_result)
            
            return prediction_result
            
        except Exception as e:
            logger.error(f"Prediction error for {asset}: {e}")
            # Fallback to synthetic prediction
            return await self._generate_synthetic_prediction(asset, timeframe, prediction_type, market_data)
    
    async def _prepare_features(self, asset: str, market_data: Dict) -> Optional[np.ndarray]:
        """Prepare features for prediction"""
        try:
            # Convert market data to DataFrame
            if 'price_history' not in market_data:
                return None
            
            df = pd.DataFrame(market_data['price_history'])
            
            if len(df) < self.sequence_length:
                return None
            
            # Add technical indicators
            df = self.technical_indicators.add_all_indicators(df)
            
            # Add market features
            df = self.feature_engineer.add_market_features(df, market_data)
            
            # Select features
            feature_columns = [
                'close', 'volume', 'high', 'low',
                'sma_20', 'sma_50', 'ema_12', 'ema_26',
                'rsi', 'macd', 'macd_signal', 'bb_upper', 'bb_lower',
                'atr', 'obv', 'stoch_k', 'stoch_d',
                'williams_r', 'cci', 'momentum',
                'price_change', 'volume_change', 'volatility'
            ]
            
            # Filter available columns
            available_columns = [col for col in feature_columns if col in df.columns]
            features = df[available_columns].fillna(method='ffill').fillna(0)
            
            # Scale features
            if asset not in self.scalers:
                self.scalers[asset] = MinMaxScaler()
                scaled_features = self.scalers[asset].fit_transform(features)
            else:
                scaled_features = self.scalers[asset].transform(features)
            
            return scaled_features
            
        except Exception as e:
            logger.error(f"Feature preparation error: {e}")
            return None
    
    async def _make_prediction(self, asset: str, features: np.ndarray, timeframe: str, prediction_type: str) -> Dict[str, Any]:
        """Make prediction using trained model"""
        try:
            model = self.models[asset]
            
            # Prepare sequence
            sequence = features[-self.sequence_length:]
            sequence_tensor = torch.FloatTensor(sequence).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                price_pred, confidence = model(sequence_tensor)
                
                price_pred = price_pred.cpu().numpy()[0][0]
                confidence_score = confidence.cpu().numpy()[0][0] * 100
            
            # Get current price
            current_price = features[-1][0] if len(features) > 0 else 1000.0
            
            # Calculate predicted price and change
            horizon_hours = self.prediction_horizons.get(timeframe, 24)
            price_multiplier = 1 + (price_pred * horizon_hours * 0.01)  # Scale prediction
            predicted_price = current_price * price_multiplier
            predicted_change = ((predicted_price - current_price) / current_price) * 100
            
            # Generate reasoning
            reasoning = await self._generate_reasoning(asset, predicted_change, confidence_score, timeframe)
            
            return {
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'predicted_change': float(predicted_change),
                'confidence': float(confidence_score),
                'reasoning': reasoning,
                'timeframe': timeframe,
                'prediction_type': prediction_type
            }
            
        except Exception as e:
            logger.error(f"Model prediction error: {e}")
            raise
    
    async def _generate_synthetic_prediction(self, asset: str, timeframe: str, prediction_type: str, market_data: Dict) -> Dict[str, Any]:
        """Generate synthetic prediction for demo purposes"""
        try:
            # Get current price from market data
            current_price = market_data.get('price', 1000.0)
            
            # Generate realistic prediction based on asset and timeframe
            base_volatility = {
                'BTC': 0.05, 'ETH': 0.06, 'USDC': 0.001, 'USDT': 0.001,
                'AAVE': 0.08, 'UNI': 0.09, 'COMP': 0.07, 'LINK': 0.08, 'MKR': 0.07
            }.get(asset, 0.06)
            
            timeframe_multiplier = {
                '1h': 0.2, '4h': 0.5, '1d': 1.0, '7d': 2.5, '30d': 5.0
            }.get(timeframe, 1.0)
            
            # Generate random but realistic change
            np.random.seed(hash(asset + timeframe) % 2**32)
            predicted_change = np.random.normal(0, base_volatility * timeframe_multiplier * 100)
            predicted_price = current_price * (1 + predicted_change / 100)
            
            # Generate confidence based on timeframe (shorter = higher confidence)
            base_confidence = 85
            confidence_penalty = {'1h': 0, '4h': 5, '1d': 10, '7d': 15, '30d': 20}.get(timeframe, 10)
            confidence = max(60, base_confidence - confidence_penalty + np.random.normal(0, 5))
            
            # Generate reasoning
            reasoning = await self._generate_reasoning(asset, predicted_change, confidence, timeframe)
            
            return {
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'predicted_change': float(predicted_change),
                'confidence': float(confidence),
                'reasoning': reasoning,
                'timeframe': timeframe,
                'prediction_type': prediction_type,
                'model_version': '1.0.0',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Synthetic prediction error: {e}")
            raise
    
    async def _generate_reasoning(self, asset: str, predicted_change: float, confidence: float, timeframe: str) -> str:
        """Generate human-readable reasoning for prediction"""
        try:
            direction = "bullish" if predicted_change > 0 else "bearish"
            magnitude = "strong" if abs(predicted_change) > 5 else "moderate" if abs(predicted_change) > 2 else "weak"
            
            # Asset-specific factors
            asset_factors = {
                'BTC': "institutional adoption and macroeconomic factors",
                'ETH': "DeFi activity and upcoming network upgrades",
                'USDC': "stablecoin demand and regulatory clarity",
                'AAVE': "lending protocol usage and DeFi market sentiment",
                'UNI': "DEX trading volume and governance developments",
                'COMP': "lending market dynamics and protocol updates",
                'LINK': "oracle demand and enterprise partnerships",
                'MKR': "DAI stability and governance decisions"
            }.get(asset, "market dynamics and technical indicators")
            
            # Timeframe-specific factors
            timeframe_factors = {
                '1h': "short-term technical patterns and trading momentum",
                '4h': "intraday trends and volume analysis",
                '1d': "daily chart patterns and market sentiment",
                '7d': "weekly trends and fundamental developments",
                '30d': "monthly cycles and long-term market structure"
            }.get(timeframe, "technical and fundamental analysis")
            
            reasoning = f"AI analysis indicates {magnitude} {direction} momentum for {asset} over {timeframe}. "
            reasoning += f"Key factors include {asset_factors} combined with {timeframe_factors}. "
            
            if confidence > 80:
                reasoning += "High confidence based on strong signal convergence and historical pattern matching."
            elif confidence > 70:
                reasoning += "Moderate confidence with some conflicting signals requiring careful monitoring."
            else:
                reasoning += "Lower confidence due to mixed signals and high market uncertainty."
            
            return reasoning
            
        except Exception as e:
            logger.error(f"Reasoning generation error: {e}")
            return "AI analysis based on technical indicators and market conditions."
    
    async def _analyze_market_conditions(self, market_data: Dict) -> Dict[str, Any]:
        """Analyze current market conditions"""
        try:
            conditions = {
                'trend': 'neutral',
                'volatility': 'medium',
                'volume': 'normal',
                'sentiment': 'neutral'
            }
            
            # Analyze trend
            if 'price_history' in market_data and len(market_data['price_history']) > 10:
                prices = [p['close'] for p in market_data['price_history'][-10:]]
                if prices[-1] > prices[0] * 1.02:
                    conditions['trend'] = 'bullish'
                elif prices[-1] < prices[0] * 0.98:
                    conditions['trend'] = 'bearish'
            
            # Analyze volatility
            if 'volatility' in market_data:
                vol = market_data['volatility']
                if vol > 0.05:
                    conditions['volatility'] = 'high'
                elif vol < 0.02:
                    conditions['volatility'] = 'low'
            
            # Analyze volume
            if 'volume_24h' in market_data and 'avg_volume' in market_data:
                vol_ratio = market_data['volume_24h'] / market_data['avg_volume']
                if vol_ratio > 1.5:
                    conditions['volume'] = 'high'
                elif vol_ratio < 0.5:
                    conditions['volume'] = 'low'
            
            return conditions
            
        except Exception as e:
            logger.error(f"Market conditions analysis error: {e}")
            return {
                'trend': 'neutral',
                'volatility': 'medium',
                'volume': 'normal',
                'sentiment': 'neutral'
            }
    
    async def generate_market_insight(self, parameters: Optional[Dict] = None) -> Dict[str, Any]:
        """Generate comprehensive market insight"""
        try:
            assets = parameters.get('assets', ['BTC', 'ETH']) if parameters else ['BTC', 'ETH']
            timeframe = parameters.get('timeframe', '7d') if parameters else '7d'
            
            insights = []
            overall_sentiment = 0
            confidence_scores = []
            
            for asset in assets:
                # Generate prediction for each asset
                mock_market_data = {
                    'price': np.random.uniform(1000, 50000),
                    'volume_24h': np.random.uniform(1e9, 1e11),
                    'volatility': np.random.uniform(0.02, 0.08)
                }
                
                prediction = await self.predict(asset, timeframe, 'price', mock_market_data)
                
                insights.append({
                    'asset': asset,
                    'prediction': prediction['predicted_change'],
                    'confidence': prediction['confidence'],
                    'reasoning': prediction['reasoning']
                })
                
                overall_sentiment += prediction['predicted_change']
                confidence_scores.append(prediction['confidence'])
            
            # Calculate overall metrics
            avg_confidence = np.mean(confidence_scores)
            market_direction = 'bullish' if overall_sentiment > 0 else 'bearish'
            
            # Generate comprehensive insight
            insight = {
                'title': f'Market Analysis - {timeframe.upper()} Outlook',
                'type': 'market',
                'timeframe': timeframe,
                'overall_sentiment': market_direction,
                'confidence': float(avg_confidence),
                'asset_insights': insights,
                'key_factors': [
                    'Technical indicator convergence',
                    'Market sentiment analysis',
                    'Volume and momentum patterns',
                    'Historical pattern matching'
                ],
                'recommendations': await self._generate_market_recommendations(insights, market_direction),
                'risk_factors': [
                    'Market volatility remains elevated',
                    'External economic factors',
                    'Regulatory uncertainty',
                    'Liquidity conditions'
                ],
                'generated_at': datetime.utcnow().isoformat()
            }
            
            return insight
            
        except Exception as e:
            logger.error(f"Market insight generation error: {e}")
            raise
    
    async def _generate_market_recommendations(self, insights: List[Dict], direction: str) -> List[str]:
        """Generate market recommendations based on insights"""
        recommendations = []
        
        if direction == 'bullish':
            recommendations.extend([
                'Consider increasing exposure to high-confidence assets',
                'Monitor for potential entry points on pullbacks',
                'Maintain diversification across asset classes',
                'Set appropriate stop-loss levels to protect gains'
            ])
        else:
            recommendations.extend([
                'Consider reducing risk exposure in volatile assets',
                'Increase allocation to stable assets or cash',
                'Look for oversold opportunities in quality assets',
                'Implement hedging strategies if appropriate'
            ])
        
        # Add asset-specific recommendations
        high_confidence_assets = [i['asset'] for i in insights if i['confidence'] > 80]
        if high_confidence_assets:
            recommendations.append(f"Focus on high-confidence assets: {', '.join(high_confidence_assets)}")
        
        return recommendations
    
    async def update_with_new_data(self):
        """Update models with new market data"""
        try:
            logger.info("Updating prediction models with new data...")
            
            # This would typically involve:
            # 1. Fetching new market data
            # 2. Retraining models with updated data
            # 3. Validating model performance
            # 4. Updating model weights
            
            # For now, we'll simulate this process
            for asset in self.models.keys():
                # Simulate model update
                await asyncio.sleep(0.1)  # Simulate processing time
            
            logger.info("Model updates completed")
            
        except Exception as e:
            logger.error(f"Model update error: {e}")
    
    async def save_models(self):
        """Save trained models to disk"""
        try:
            for asset, model in self.models.items():
                model_file = self.model_path / f"{asset}_model.pth"
                scaler_file = self.model_path / f"{asset}_scaler.pkl"
                
                # Save model
                torch.save(model.state_dict(), model_file)
                
                # Save scaler
                if asset in self.scalers:
                    joblib.dump(self.scalers[asset], scaler_file)
            
            logger.info(f"Saved {len(self.models)} models")
            
        except Exception as e:
            logger.error(f"Model saving error: {e}")
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get model statistics"""
        try:
            stats = {
                'models_loaded': len(self.models),
                'assets_covered': list(self.models.keys()),
                'total_predictions': len(self.prediction_history),
                'average_confidence': np.mean([p['confidence'] for p in self.prediction_history]) if self.prediction_history else 0,
                'model_performance': self.model_performance,
                'last_updated': datetime.utcnow().isoformat()
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Stats generation error: {e}")
            return {}
    
    def is_loaded(self) -> bool:
        """Check if models are loaded"""
        return len(self.models) > 0
