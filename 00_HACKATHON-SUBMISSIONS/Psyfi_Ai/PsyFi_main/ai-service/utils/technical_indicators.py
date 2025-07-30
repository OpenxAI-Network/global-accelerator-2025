import pandas as pd
import numpy as np
from typing import Dict, Any
import talib

class TechnicalIndicators:
    """Technical indicators calculator for financial data"""
    
    def __init__(self):
        self.indicators = {}
    
    def add_all_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add all technical indicators to dataframe"""
        df = df.copy()
        
        # Ensure required columns exist
        required_columns = ['open', 'high', 'low', 'close', 'volume']
        for col in required_columns:
            if col not in df.columns:
                if col == 'open':
                    df[col] = df['close'].shift(1).fillna(df['close'])
                elif col in ['high', 'low']:
                    df[col] = df['close']
                elif col == 'volume':
                    df[col] = 1000000  # Default volume
        
        # Moving Averages
        df = self.add_moving_averages(df)
        
        # Momentum Indicators
        df = self.add_momentum_indicators(df)
        
        # Volatility Indicators
        df = self.add_volatility_indicators(df)
        
        # Volume Indicators
        df = self.add_volume_indicators(df)
        
        # Trend Indicators
        df = self.add_trend_indicators(df)
        
        return df
    
    def add_moving_averages(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add moving average indicators"""
        # Simple Moving Averages
        df['sma_5'] = df['close'].rolling(window=5).mean()
        df['sma_10'] = df['close'].rolling(window=10).mean()
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        df['sma_200'] = df['close'].rolling(window=200).mean()
        
        # Exponential Moving Averages
        df['ema_12'] = df['close'].ewm(span=12).mean()
        df['ema_26'] = df['close'].ewm(span=26).mean()
        df['ema_50'] = df['close'].ewm(span=50).mean()
        
        # Weighted Moving Average
        df['wma_20'] = df['close'].rolling(window=20).apply(
            lambda x: np.sum(x * np.arange(1, len(x) + 1)) / np.sum(np.arange(1, len(x) + 1))
        )
        
        return df
    
    def add_momentum_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add momentum indicators"""
        # RSI (Relative Strength Index)
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD (Moving Average Convergence Divergence)
        df['macd'] = df['ema_12'] - df['ema_26']
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        # Stochastic Oscillator
        low_14 = df['low'].rolling(window=14).min()
        high_14 = df['high'].rolling(window=14).max()
        df['stoch_k'] = 100 * ((df['close'] - low_14) / (high_14 - low_14))
        df['stoch_d'] = df['stoch_k'].rolling(window=3).mean()
        
        # Williams %R
        df['williams_r'] = -100 * ((high_14 - df['close']) / (high_14 - low_14))
        
        # Commodity Channel Index (CCI)
        tp = (df['high'] + df['low'] + df['close']) / 3
        sma_tp = tp.rolling(window=20).mean()
        mad = tp.rolling(window=20).apply(lambda x: np.mean(np.abs(x - x.mean())))
        df['cci'] = (tp - sma_tp) / (0.015 * mad)
        
        # Momentum
        df['momentum'] = df['close'] / df['close'].shift(10) - 1
        
        return df
    
    def add_volatility_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add volatility indicators"""
        # Bollinger Bands
        sma_20 = df['close'].rolling(window=20).mean()
        std_20 = df['close'].rolling(window=20).std()
        df['bb_upper'] = sma_20 + (std_20 * 2)
        df['bb_lower'] = sma_20 - (std_20 * 2)
        df['bb_middle'] = sma_20
        df['bb_width'] = df['bb_upper'] - df['bb_lower']
        df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        
        # Average True Range (ATR)
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        true_range = np.maximum(high_low, np.maximum(high_close, low_close))
        df['atr'] = true_range.rolling(window=14).mean()
        
        # Keltner Channels
        df['kc_middle'] = df['ema_20'] if 'ema_20' in df.columns else df['close'].ewm(span=20).mean()
        df['kc_upper'] = df['kc_middle'] + (2 * df['atr'])
        df['kc_lower'] = df['kc_middle'] - (2 * df['atr'])
        
        return df
    
    def add_volume_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add volume indicators"""
        # On-Balance Volume (OBV)
        df['obv'] = (np.sign(df['close'].diff()) * df['volume']).fillna(0).cumsum()
        
        # Volume Moving Average
        df['volume_sma'] = df['volume'].rolling(window=20).mean()
        
        # Volume Rate of Change
        df['volume_roc'] = df['volume'].pct_change(periods=10)
        
        # Accumulation/Distribution Line
        clv = ((df['close'] - df['low']) - (df['high'] - df['close'])) / (df['high'] - df['low'])
        clv = clv.fillna(0)
        df['ad_line'] = (clv * df['volume']).cumsum()
        
        # Chaikin Money Flow
        df['cmf'] = (clv * df['volume']).rolling(window=20).sum() / df['volume'].rolling(window=20).sum()
        
        return df
    
    def add_trend_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add trend indicators"""
        # Average Directional Index (ADX)
        high_diff = df['high'].diff()
        low_diff = df['low'].diff()
        
        plus_dm = np.where((high_diff > low_diff) & (high_diff > 0), high_diff, 0)
        minus_dm = np.where((low_diff > high_diff) & (low_diff > 0), low_diff, 0)
        
        plus_dm_smooth = pd.Series(plus_dm).rolling(window=14).mean()
        minus_dm_smooth = pd.Series(minus_dm).rolling(window=14).mean()
        
        plus_di = 100 * (plus_dm_smooth / df['atr'])
        minus_di = 100 * (minus_dm_smooth / df['atr'])
        
        dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di)
        df['adx'] = dx.rolling(window=14).mean()
        df['plus_di'] = plus_di
        df['minus_di'] = minus_di
        
        # Parabolic SAR (simplified)
        df['sar'] = df['close'].shift(1)  # Simplified implementation
        
        # Aroon Indicator
        aroon_period = 14
        df['aroon_up'] = 100 * (aroon_period - df['high'].rolling(window=aroon_period).apply(
            lambda x: aroon_period - 1 - np.argmax(x)
        )) / aroon_period
        df['aroon_down'] = 100 * (aroon_period - df['low'].rolling(window=aroon_period).apply(
            lambda x: aroon_period - 1 - np.argmin(x)
        )) / aroon_period
        df['aroon_oscillator'] = df['aroon_up'] - df['aroon_down']
        
        return df
    
    def calculate_support_resistance(self, df: pd.DataFrame, window: int = 20) -> Dict[str, float]:
        """Calculate support and resistance levels"""
        recent_data = df.tail(window)
        
        # Simple support/resistance based on recent highs and lows
        resistance = recent_data['high'].max()
        support = recent_data['low'].min()
        
        # Pivot points
        high = recent_data['high'].iloc[-1]
        low = recent_data['low'].iloc[-1]
        close = recent_data['close'].iloc[-1]
        
        pivot = (high + low + close) / 3
        r1 = 2 * pivot - low
        s1 = 2 * pivot - high
        r2 = pivot + (high - low)
        s2 = pivot - (high - low)
        
        return {
            'support': support,
            'resistance': resistance,
            'pivot': pivot,
            'r1': r1, 'r2': r2,
            's1': s1, 's2': s2
        }
    
    def detect_patterns(self, df: pd.DataFrame) -> Dict[str, bool]:
        """Detect common chart patterns"""
        patterns = {}
        
        if len(df) < 50:
            return patterns
        
        recent = df.tail(20)
        
        # Golden Cross
        patterns['golden_cross'] = (
            df['sma_50'].iloc[-1] > df['sma_200'].iloc[-1] and
            df['sma_50'].iloc[-2] <= df['sma_200'].iloc[-2]
        )
        
        # Death Cross
        patterns['death_cross'] = (
            df['sma_50'].iloc[-1] < df['sma_200'].iloc[-1] and
            df['sma_50'].iloc[-2] >= df['sma_200'].iloc[-2]
        )
        
        # Bullish Divergence (RSI)
        if 'rsi' in df.columns:
            price_trend = recent['close'].iloc[-1] < recent['close'].iloc[0]
            rsi_trend = recent['rsi'].iloc[-1] > recent['rsi'].iloc[0]
            patterns['bullish_divergence'] = price_trend and rsi_trend
        
        # Oversold/Overbought
        if 'rsi' in df.columns:
            patterns['oversold'] = df['rsi'].iloc[-1] < 30
            patterns['overbought'] = df['rsi'].iloc[-1] > 70
        
        # Bollinger Band Squeeze
        if 'bb_width' in df.columns:
            bb_width_sma = df['bb_width'].rolling(window=20).mean()
            patterns['bb_squeeze'] = df['bb_width'].iloc[-1] < bb_width_sma.iloc[-1] * 0.8
        
        return patterns
    
    def get_signal_strength(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate signal strength for various indicators"""
        signals = {}
        
        if len(df) < 20:
            return signals
        
        # RSI Signal Strength
        if 'rsi' in df.columns:
            rsi = df['rsi'].iloc[-1]
            if rsi < 30:
                signals['rsi'] = -(30 - rsi) / 30  # Negative for oversold
            elif rsi > 70:
                signals['rsi'] = (rsi - 70) / 30   # Positive for overbought
            else:
                signals['rsi'] = 0
        
        # MACD Signal Strength
        if 'macd' in df.columns and 'macd_signal' in df.columns:
            macd_diff = df['macd'].iloc[-1] - df['macd_signal'].iloc[-1]
            signals['macd'] = np.tanh(macd_diff * 10)  # Normalize between -1 and 1
        
        # Moving Average Signal
        if 'sma_20' in df.columns and 'sma_50' in df.columns:
            ma_ratio = df['sma_20'].iloc[-1] / df['sma_50'].iloc[-1] - 1
            signals['ma_trend'] = np.tanh(ma_ratio * 100)
        
        # Bollinger Band Position
        if 'bb_position' in df.columns:
            bb_pos = df['bb_position'].iloc[-1]
            if bb_pos > 1:
                signals['bb'] = 1  # Above upper band
            elif bb_pos < 0:
                signals['bb'] = -1  # Below lower band
            else:
                signals['bb'] = (bb_pos - 0.5) * 2  # Normalize around middle
        
        return signals
