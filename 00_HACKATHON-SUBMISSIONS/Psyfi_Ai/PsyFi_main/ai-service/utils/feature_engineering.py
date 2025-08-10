import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime, timedelta

class FeatureEngineer:
    """Feature engineering utilities for financial data"""
    
    def __init__(self):
        self.feature_cache = {}
    
    def add_market_features(self, df: pd.DataFrame, market_data: Dict[str, Any]) -> pd.DataFrame:
        """Add market-specific features to dataframe"""
        df = df.copy()
        
        # Price-based features
        df = self.add_price_features(df)
        
        # Volume-based features
        df = self.add_volume_features(df)
        
        # Time-based features
        df = self.add_time_features(df)
        
        # Volatility features
        df = self.add_volatility_features(df)
        
        # Market sentiment features
        df = self.add_sentiment_features(df, market_data)
        
        # Cross-asset features
        df = self.add_cross_asset_features(df, market_data)
        
        return df
    
    def add_price_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add price-based features"""
        # Price changes
        df['price_change'] = df['close'].pct_change()
        df['price_change_2'] = df['close'].pct_change(periods=2)
        df['price_change_5'] = df['close'].pct_change(periods=5)
        df['price_change_10'] = df['close'].pct_change(periods=10)
        
        # Log returns
        df['log_return'] = np.log(df['close'] / df['close'].shift(1))
        
        # Price position relative to recent range
        df['price_position_5'] = (df['close'] - df['close'].rolling(5).min()) / (
            df['close'].rolling(5).max() - df['close'].rolling(5).min()
        )
        df['price_position_20'] = (df['close'] - df['close'].rolling(20).min()) / (
            df['close'].rolling(20).max() - df['close'].rolling(20).min()
        )
        
        # High-Low spread
        df['hl_spread'] = (df['high'] - df['low']) / df['close']
        df['hl_spread_ma'] = df['hl_spread'].rolling(window=10).mean()
        
        # Gap analysis
        df['gap'] = (df['open'] - df['close'].shift(1)) / df['close'].shift(1)
        df['gap_filled'] = np.where(
            (df['gap'] > 0) & (df['low'] <= df['close'].shift(1)), 1,
            np.where((df['gap'] < 0) & (df['high'] >= df['close'].shift(1)), 1, 0)
        )
        
        return df
    
    def add_volume_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add volume-based features"""
        # Volume changes
        df['volume_change'] = df['volume'].pct_change()
        df['volume_change_5'] = df['volume'].pct_change(periods=5)
        
        # Volume moving averages
        df['volume_ma_5'] = df['volume'].rolling(window=5).mean()
        df['volume_ma_20'] = df['volume'].rolling(window=20).mean()
        
        # Volume ratios
        df['volume_ratio_5'] = df['volume'] / df['volume_ma_5']
        df['volume_ratio_20'] = df['volume'] / df['volume_ma_20']
        
        # Price-Volume relationship
        df['pv_trend'] = np.sign(df['price_change']) * np.sign(df['volume_change'])
        
        # Volume-weighted price
        df['vwap'] = (df['close'] * df['volume']).rolling(window=20).sum() / df['volume'].rolling(window=20).sum()
        df['price_vs_vwap'] = df['close'] / df['vwap'] - 1
        
        return df
    
    def add_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add time-based features"""
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Hour of day
            df['hour'] = df['timestamp'].dt.hour
            df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
            df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
            
            # Day of week
            df['day_of_week'] = df['timestamp'].dt.dayofweek
            df['dow_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
            df['dow_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
            
            # Month
            df['month'] = df['timestamp'].dt.month
            df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
            df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
            
            # Weekend indicator
            df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
            
            # Market session indicators (assuming UTC)
            df['asian_session'] = ((df['hour'] >= 0) & (df['hour'] < 8)).astype(int)
            df['european_session'] = ((df['hour'] >= 8) & (df['hour'] < 16)).astype(int)
            df['us_session'] = ((df['hour'] >= 16) & (df['hour'] < 24)).astype(int)
        
        return df
    
    def add_volatility  >= 16) & (df['hour'] < 24)).astype(int)
        
        return df
    
    def add_volatility_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add volatility-based features"""
        # Rolling volatility
        df['volatility_5'] = df['log_return'].rolling(window=5).std()
        df['volatility_20'] = df['log_return'].rolling(window=20).std()
        df['volatility_60'] = df['log_return'].rolling(window=60).std()
        
        # Volatility ratios
        df['vol_ratio_5_20'] = df['volatility_5'] / df['volatility_20']
        df['vol_ratio_20_60'] = df['volatility_20'] / df['volatility_60']
        
        # Realized volatility
        df['realized_vol'] = np.sqrt(252) * df['log_return'].rolling(window=20).std()
        
        # Volatility of volatility
        df['vol_of_vol'] = df['volatility_20'].rolling(window=10).std()
        
        # Parkinson volatility (using high-low)
        df['parkinson_vol'] = np.sqrt(
            (1 / (4 * np.log(2))) * (np.log(df['high'] / df['low']) ** 2)
        ).rolling(window=20).mean()
        
        # Garman-Klass volatility
        df['gk_vol'] = np.sqrt(
            0.5 * (np.log(df['high'] / df['low']) ** 2) - 
            (2 * np.log(2) - 1) * (np.log(df['close'] / df['open']) ** 2)
        ).rolling(window=20).mean()
        
        return df
    
    def add_sentiment_features(self, df: pd.DataFrame, market_data: Dict[str, Any]) -> pd.DataFrame:
        """Add market sentiment features"""
        # Fear & Greed Index (simulated)
        np.random.seed(42)
        df['fear_greed_index'] = 50 + 30 * np.sin(np.arange(len(df)) * 0.1) + np.random.normal(0, 10, len(df))
        df['fear_greed_index'] = np.clip(df['fear_greed_index'], 0, 100)
        
        # VIX-like volatility index (simulated)
        df['vix_like'] = 20 + 15 * (1 / df['close'].pct_change().rolling(20).std()).fillna(1)
        df['vix_like'] = np.clip(df['vix_like'], 10, 80)
        
        # Social sentiment (simulated)
        df['social_sentiment'] = 0.5 + 0.3 * np.sin(np.arange(len(df)) * 0.05) + np.random.normal(0, 0.1, len(df))
        df['social_sentiment'] = np.clip(df['social_sentiment'], 0, 1)
        
        # News sentiment (simulated)
        df['news_sentiment'] = 0.5 + 0.2 * df['price_change'].rolling(5).mean().fillna(0)
        df['news_sentiment'] = np.clip(df['news_sentiment'], 0, 1)
        
        # Market regime indicator
        df['bull_market'] = (df['close'] > df['close'].rolling(200).mean()).astype(int)
        df['bear_market'] = (df['close'] < df['close'].rolling(200).mean()).astype(int)
        
        return df
    
    def add_cross_asset_features(self, df: pd.DataFrame, market_data: Dict[str, Any]) -> pd.DataFrame:
        """Add cross-asset correlation features"""
        # Bitcoin correlation (simulated)
        btc_returns = np.random.normal(0, 0.05, len(df))
        df['btc_correlation'] = df['log_return'].rolling(30).corr(pd.Series(btc_returns))
        
        # Market cap weight (simulated)
        df['market_cap_weight'] = market_data.get('market_cap', 1000000000) / 1e12
        
        # Sector performance (simulated)
        df['sector_performance'] = 1 + 0.1 * np.sin(np.arange(len(df)) * 0.02)
        
        # Risk-on/Risk-off indicator
        df['risk_on'] = (df['volatility_20'] < df['volatility_20'].rolling(60).mean()).astype(int)
        
        return df
    
    def create_lagged_features(self, df: pd.DataFrame, columns: List[str], lags: List[int]) -> pd.DataFrame:
        """Create lagged features for specified columns"""
        df = df.copy()
        
        for col in columns:
            if col in df.columns:
                for lag in lags:
                    df[f'{col}_lag_{lag}'] = df[col].shift(lag)
        
        return df
    
    def create_rolling_features(self, df: pd.DataFrame, columns: List[str], windows: List[int]) -> pd.DataFrame:
        """Create rolling statistical features"""
        df = df.copy()
        
        for col in columns:
            if col in df.columns:
                for window in windows:
                    df[f'{col}_mean_{window}'] = df[col].rolling(window).mean()
                    df[f'{col}_std_{window}'] = df[col].rolling(window).std()
                    df[f'{col}_min_{window}'] = df[col].rolling(window).min()
                    df[f'{col}_max_{window}'] = df[col].rolling(window).max()
                    df[f'{col}_skew_{window}'] = df[col].rolling(window).skew()
                    df[f'{col}_kurt_{window}'] = df[col].rolling(window).kurt()
        
        return df
    
    def create_interaction_features(self, df: pd.DataFrame, feature_pairs: List[tuple]) -> pd.DataFrame:
        """Create interaction features between specified pairs"""
        df = df.copy()
        
        for feat1, feat2 in feature_pairs:
            if feat1 in df.columns and feat2 in df.columns:
                # Multiplication
                df[f'{feat1}_x_{feat2}'] = df[feat1] * df[feat2]
                
                # Division (with safety check)
                df[f'{feat1}_div_{feat2}'] = df[feat1] / (df[feat2] + 1e-8)
                
                # Difference
                df[f'{feat1}_minus_{feat2}'] = df[feat1] - df[feat2]
                
                # Ratio
                df[f'{feat1}_ratio_{feat2}'] = df[feat1] / (df[feat1] + df[feat2] + 1e-8)
        
        return df
    
    def add_fourier_features(self, df: pd.DataFrame, column: str, n_components: int = 5) -> pd.DataFrame:
        """Add Fourier transform features for cyclical patterns"""
        df = df.copy()
        
        if column in df.columns:
            values = df[column].fillna(method='ffill').fillna(0)
            
            for i in range(1, n_components + 1):
                df[f'{column}_sin_{i}'] = np.sin(2 * np.pi * i * np.arange(len(values)) / len(values))
                df[f'{column}_cos_{i}'] = np.cos(2 * np.pi * i * np.arange(len(values)) / len(values))
        
        return df
    
    def add_regime_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add market regime features"""
        df = df.copy()
        
        # Volatility regime
        vol_threshold = df['volatility_20'].quantile(0.7)
        df['high_vol_regime'] = (df['volatility_20'] > vol_threshold).astype(int)
        
        # Trend regime
        df['uptrend_regime'] = (df['close'] > df['close'].rolling(50).mean()).astype(int)
        df['downtrend_regime'] = (df['close'] < df['close'].rolling(50).mean()).astype(int)
        
        # Volume regime
        vol_threshold = df['volume'].quantile(0.7)
        df['high_volume_regime'] = (df['volume'] > vol_threshold).astype(int)
        
        return df
    
    def select_features(self, df: pd.DataFrame, target_col: str, method: str = 'correlation') -> List[str]:
        """Select most relevant features based on specified method"""
        if target_col not in df.columns:
            return []
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if target_col in numeric_cols:
            numeric_cols.remove(target_col)
        
        if method == 'correlation':
            correlations = df[numeric_cols].corrwith(df[target_col]).abs()
            selected_features = correlations.nlargest(20).index.tolist()
        
        elif method == 'variance':
            variances = df[numeric_cols].var()
            selected_features = variances.nlargest(20).index.tolist()
        
        else:
            selected_features = numeric_cols[:20]  # Default selection
        
        return selected_features
    
    def normalize_features(self, df: pd.DataFrame, method: str = 'minmax') -> pd.DataFrame:
        """Normalize features using specified method"""
        df = df.copy()
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if method == 'minmax':
            df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].min()) / (
                df[numeric_cols].max() - df[numeric_cols].min()
            )
        
        elif method == 'zscore':
            df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].mean()) / df[numeric_cols].std()
        
        elif method == 'robust':
            df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].median()) / (
                df[numeric_cols].quantile(0.75) - df[numeric_cols].quantile(0.25)
            )
        
        return df.fillna(0)
    
    def create_target_features(self, df: pd.DataFrame, target_horizons: List[int]) -> pd.DataFrame:
        """Create target features for different prediction horizons"""
        df = df.copy()
        
        for horizon in target_horizons:
            # Future returns
            df[f'target_return_{horizon}'] = df['close'].pct_change(periods=horizon).shift(-horizon)
            
            # Future volatility
            df[f'target_volatility_{horizon}'] = df['log_return'].rolling(horizon).std().shift(-horizon)
            
            # Future direction
            df[f'target_direction_{horizon}'] = (df[f'target_return_{horizon}'] > 0).astype(int)
            
            # Future high/low
            df[f'target_high_{horizon}'] = df['high'].rolling(horizon).max().shift(-horizon)
            df[f'target_low_{horizon}'] = df['low'].rolling(horizon).min().shift(-horizon)
        
        return df
    
    def get_feature_importance(self, df: pd.DataFrame, target_col: str) -> Dict[str, float]:
        """Calculate feature importance using various methods"""
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.feature_selection import mutual_info_regression
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if target_col in numeric_cols:
            numeric_cols.remove(target_col)
        
        # Remove rows with NaN in target
        clean_df = df.dropna(subset=[target_col])
        
        if len(clean_df) < 10:
            return {}
        
        X = clean_df[numeric_cols].fillna(0)
        y = clean_df[target_col]
        
        # Random Forest importance
        rf = RandomForestRegressor(n_estimators=50, random_state=42)
        rf.fit(X, y)
        rf_importance = dict(zip(numeric_cols, rf.feature_importances_))
        
        # Mutual information
        mi_scores = mutual_info_regression(X, y, random_state=42)
        mi_importance = dict(zip(numeric_cols, mi_scores))
        
        # Combine scores
        combined_importance = {}
        for col in numeric_cols:
            combined_importance[col] = (rf_importance[col] + mi_importance[col]) / 2
        
        return combined_importance
