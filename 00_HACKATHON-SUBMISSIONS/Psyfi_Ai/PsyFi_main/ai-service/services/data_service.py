import asyncio
import aiohttp
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

from utils.config import Config
from utils.logger import LoggerMixin

logger = logging.getLogger(__name__)

class DataService(LoggerMixin):
    """Data collection and management service"""
    
    def __init__(self, config: Config):
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache = {}
        self.data_sources = {
            'coingecko': 'https://api.coingecko.com/api/v3',
            'binance': 'https://api.binance.com/api/v3',
            'coinbase': 'https://api.exchange.coinbase.com'
        }
        
        # Asset mappings
        self.asset_mappings = {
            'BTC': {'coingecko': 'bitcoin', 'binance': 'BTCUSDT', 'symbol': 'BTC'},
            'ETH': {'coingecko': 'ethereum', 'binance': 'ETHUSDT', 'symbol': 'ETH'},
            'USDC': {'coingecko': 'usd-coin', 'binance': 'USDCUSDT', 'symbol': 'USDC'},
            'USDT': {'coingecko': 'tether', 'binance': 'USDTUSDT', 'symbol': 'USDT'},
            'AAVE': {'coingecko': 'aave', 'binance': 'AAVEUSDT', 'symbol': 'AAVE'},
            'UNI': {'coingecko': 'uniswap', 'binance': 'UNIUSDT', 'symbol': 'UNI'},
            'COMP': {'coingecko': 'compound-governance-token', 'binance': 'COMPUSDT', 'symbol': 'COMP'},
            'LINK': {'coingecko': 'chainlink', 'binance': 'LINKUSDT', 'symbol': 'LINK'},
            'MKR': {'coingecko': 'maker', 'binance': 'MKRUSDT', 'symbol': 'MKR'}
        }
    
    async def initialize(self):
        """Initialize the data service"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'PsyFi-AI-Service/1.0'}
        )
        self.logger.info("Data service initialized")
    
    async def close(self):
        """Close the data service"""
        if self.session:
            await self.session.close()
        self.logger.info("Data service closed")
    
    async def get_market_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get current market data for a symbol"""
        try:
            # Check cache first
            cache_key = f"market_data_{symbol}"
            if cache_key in self.cache:
                cached_data = self.cache[cache_key]
                if datetime.utcnow().timestamp() - cached_data['timestamp'] < 300:  # 5 minutes
                    return cached_data['data']
            
            # Get data from multiple sources
            coingecko_data = await self._get_coingecko_data(symbol)
            binance_data = await self._get_binance_data(symbol)
            
            # Combine and normalize data
            market_data = self._combine_market_data(symbol, coingecko_data, binance_data)
            
            # Cache the result
            self.cache[cache_key] = {
                'data': market_data,
                'timestamp': datetime.utcnow().timestamp()
            }
            
            return market_data
            
        except Exception as e:
            self.logger.error(f"Error getting market data for {symbol}: {e}")
            return self._get_fallback_market_data(symbol)
    
    async def _get_coingecko_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get data from CoinGecko API"""
        try:
            if symbol not in self.asset_mappings:
                return None
            
            coin_id = self.asset_mappings[symbol]['coingecko']
            url = f"{self.data_sources['coingecko']}/coins/{coin_id}"
            
            params = {
                'localization': 'false',
                'tickers': 'false',
                'market_data': 'true',
                'community_data': 'false',
                'developer_data': 'false',
                'sparkline': 'false'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_coingecko_response(data)
                else:
                    self.logger.warning(f"CoinGecko API error for {symbol}: {response.status}")
                    return None
                    
        except Exception as e:
            self.logger.error(f"CoinGecko API error for {symbol}: {e}")
            return None
    
    async def _get_binance_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get data from Binance API"""
        try:
            if symbol not in self.asset_mappings:
                return None
            
            binance_symbol = self.asset_mappings[symbol]['binance']
            
            # Get 24hr ticker statistics
            ticker_url = f"{self.data_sources['binance']}/ticker/24hr"
            params = {'symbol': binance_symbol}
            
            async with self.session.get(ticker_url, params=params) as response:
                if response.status == 200:
                    ticker_data = await response.json()
                    
                    # Get recent klines for additional data
                    klines_url = f"{self.data_sources['binance']}/klines"
                    klines_params = {
                        'symbol': binance_symbol,
                        'interval': '1h',
                        'limit': 24
                    }
                    
                    async with self.session.get(klines_url, params=klines_params) as klines_response:
                        if klines_response.status == 200:
                            klines_data = await klines_response.json()
                            return self._parse_binance_response(ticker_data, klines_data)
                        else:
                            return self._parse_binance_response(ticker_data, [])
                else:
                    self.logger.warning(f"Binance API error for {symbol}: {response.status}")
                    return None
                    
        except Exception as e:
            self.logger.error(f"Binance API error for {symbol}: {e}")
            return None
    
    def _parse_coingecko_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse CoinGecko API response"""
        market_data = data.get('market_data', {})
        
        return {
            'price': market_data.get('current_price', {}).get('usd', 0),
            'market_cap': market_data.get('market_cap', {}).get('usd', 0),
            'volume_24h': market_data.get('total_volume', {}).get('usd', 0),
            'change_24h': market_data.get('price_change_percentage_24h', 0),
            'change_7d': market_data.get('price_change_percentage_7d', 0),
            'change_30d': market_data.get('price_change_percentage_30d', 0),
            'high_24h': market_data.get('high_24h', {}).get('usd', 0),
            'low_24h': market_data.get('low_24h', {}).get('usd', 0),
            'circulating_supply': market_data.get('circulating_supply', 0),
            'total_supply': market_data.get('total_supply', 0),
            'max_supply': market_data.get('max_supply', 0),
            'ath': market_data.get('ath', {}).get('usd', 0),
            'atl': market_data.get('atl', {}).get('usd', 0),
            'source': 'coingecko'
        }
    
    def _parse_binance_response(self, ticker_data: Dict[str, Any], klines_data: List[List]) -> Dict[str, Any]:
        """Parse Binance API response"""
        # Calculate volatility from klines data
        volatility = 0
        if klines_data:
            closes = [float(kline[4]) for kline in klines_data]
            if len(closes) > 1:
                returns = np.diff(np.log(closes))
                volatility = np.std(returns) * np.sqrt(24)  # Annualized hourly volatility
        
        return {
            'price': float(ticker_data.get('lastPrice', 0)),
            'volume_24h': float(ticker_data.get('quoteVolume', 0)),
            'change_24h': float(ticker_data.get('priceChangePercent', 0)),
            'high_24h': float(ticker_data.get('highPrice', 0)),
            'low_24h': float(ticker_data.get('lowPrice', 0)),
            'open_24h': float(ticker_data.get('openPrice', 0)),
            'bid_price': float(ticker_data.get('bidPrice', 0)),
            'ask_price': float(ticker_data.get('askPrice', 0)),
            'spread': float(ticker_data.get('askPrice', 0)) - float(ticker_data.get('bidPrice', 0)),
            'volatility': volatility,
            'trade_count': int(ticker_data.get('count', 0)),
            'price_history': self._parse_klines_to_history(klines_data),
            'source': 'binance'
        }
    
    def _parse_klines_to_history(self, klines_data: List[List]) -> List[Dict[str, Any]]:
        """Convert klines data to price history format"""
        history = []
        for kline in klines_data:
            history.append({
                'timestamp': int(kline[0]) // 1000,  # Convert to seconds
                'open': float(kline[1]),
                'high': float(kline[2]),
                'low': float(kline[3]),
                'close': float(kline[4]),
                'volume': float(kline[5])
            })
        return history
    
    def _combine_market_data(self, symbol: str, coingecko_data: Optional[Dict], binance_data: Optional[Dict]) -> Dict[str, Any]:
        """Combine data from multiple sources"""
        combined_data = {
            'symbol': symbol,
            'timestamp': datetime.utcnow().isoformat(),
            'sources': []
        }
        
        # Use Binance for real-time price and volume (more accurate)
        if binance_data:
            combined_data.update({
                'price': binance_data['price'],
                'volume_24h': binance_data['volume_24h'],
                'high_24h': binance_data['high_24h'],
                'low_24h': binance_data['low_24h'],
                'change_24h': binance_data['change_24h'],
                'volatility': binance_data['volatility'],
                'spread': binance_data['spread'],
                'price_history': binance_data['price_history']
            })
            combined_data['sources'].append('binance')
        
        # Use CoinGecko for market cap and additional metrics
        if coingecko_data:
            combined_data.update({
                'market_cap': coingecko_data['market_cap'],
                'circulating_supply': coingecko_data['circulating_supply'],
                'total_supply': coingecko_data['total_supply'],
                'max_supply': coingecko_data['max_supply'],
                'change_7d': coingecko_data['change_7d'],
                'change_30d': coingecko_data['change_30d'],
                'ath': coingecko_data['ath'],
                'atl': coingecko_data['atl']
            })
            combined_data['sources'].append('coingecko')
            
            # Use CoinGecko price if Binance not available
            if not binance_data:
                combined_data.update({
                    'price': coingecko_data['price'],
                    'volume_24h': coingecko_data['volume_24h'],
                    'high_24h': coingecko_data['high_24h'],
                    'low_24h': coingecko_data['low_24h'],
                    'change_24h': coingecko_data['change_24h']
                })
        
        # Calculate additional metrics
        if 'price' in combined_data and 'volume_24h' in combined_data:
            combined_data['avg_volume'] = combined_data['volume_24h']  # Simplified
            combined_data['liquidity_score'] = min(100, combined_data['volume_24h'] / 1000000)  # Simplified liquidity score
        
        return combined_data
    
    def _get_fallback_market_data(self, symbol: str) -> Dict[str, Any]:
        """Generate fallback market data when APIs are unavailable"""
        # Generate deterministic but realistic data based on symbol
        symbol_hash = hash(symbol) % 2**32
        np.random.seed(symbol_hash)
        
        base_prices = {
            'BTC': 43000, 'ETH': 2600, 'USDC': 1.0, 'USDT': 1.0,
            'AAVE': 120, 'UNI': 8.5, 'COMP': 65, 'LINK': 15, 'MKR': 1800
        }
        
        base_price = base_prices.get(symbol, 100)
        price_variation = np.random.uniform(-0.05, 0.05)  # ±5% variation
        current_price = base_price * (1 + price_variation)
        
        return {
            'symbol': symbol,
            'price': current_price,
            'volume_24h': np.random.uniform(1e8, 1e10),
            'market_cap': current_price * np.random.uniform(1e6, 1e9),
            'change_24h': np.random.uniform(-10, 10),
            'change_7d': np.random.uniform(-20, 20),
            'high_24h': current_price * np.random.uniform(1.01, 1.1),
            'low_24h': current_price * np.random.uniform(0.9, 0.99),
            'volatility': np.random.uniform(0.02, 0.08),
            'timestamp': datetime.utcnow().isoformat(),
            'sources': ['fallback'],
            'price_history': self._generate_fallback_history(current_price)
        }
    
    def _generate_fallback_history(self, current_price: float, hours: int = 24) -> List[Dict[str, Any]]:
        """Generate fallback price history"""
        history = []
        base_timestamp = int(datetime.utcnow().timestamp())
        
        for i in range(hours):
            timestamp = base_timestamp - (hours - i) * 3600
            price_change = np.random.uniform(-0.02, 0.02)  # ±2% hourly change
            price = current_price * (1 + price_change * (hours - i) / hours)
            
            history.append({
                'timestamp': timestamp,
                'open': price * np.random.uniform(0.995, 1.005),
                'high': price * np.random.uniform(1.001, 1.02),
                'low': price * np.random.uniform(0.98, 0.999),
                'close': price,
                'volume': np.random.uniform(1e6, 1e8)
            })
        
        return history
    
    async def get_trending_assets(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending assets"""
        try:
            url = f"{self.data_sources['coingecko']}/search/trending"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    trending = []
                    
                    for coin in data.get('coins', [])[:limit]:
                        coin_data = coin.get('item', {})
                        trending.append({
                            'symbol': coin_data.get('symbol', '').upper(),
                            'name': coin_data.get('name', ''),
                            'market_cap_rank': coin_data.get('market_cap_rank', 0),
                            'price_btc': coin_data.get('price_btc', 0),
                            'score': coin_data.get('score', 0)
                        })
                    
                    return trending
                else:
                    return self._get_fallback_trending()
                    
        except Exception as e:
            self.logger.error(f"Error getting trending assets: {e}")
            return self._get_fallback_trending()
    
    def _get_fallback_trending(self) -> List[Dict[str, Any]]:
        """Fallback trending assets"""
        return [
            {'symbol': 'BTC', 'name': 'Bitcoin', 'market_cap_rank': 1, 'score': 100},
            {'symbol': 'ETH', 'name': 'Ethereum', 'market_cap_rank': 2, 'score': 95},
            {'symbol': 'USDC', 'name': 'USD Coin', 'market_cap_rank': 3, 'score': 90},
            {'symbol': 'AAVE', 'name': 'Aave', 'market_cap_rank': 50, 'score': 85},
            {'symbol': 'UNI', 'name': 'Uniswap', 'market_cap_rank': 20, 'score': 80}
        ]
    
    async def collect_market_data(self):
        """Collect market data for all tracked assets"""
        try:
            self.logger.info("Starting market data collection...")
            
            tasks = []
            for symbol in self.asset_mappings.keys():
                tasks.append(self.get_market_data(symbol))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            successful_collections = 0
            for i, result in enumerate(results):
                symbol = list(self.asset_mappings.keys())[i]
                if isinstance(result, Exception):
                    self.logger.error(f"Failed to collect data for {symbol}: {result}")
                else:
                    successful_collections += 1
            
            self.logger.info(f"Market data collection completed: {successful_collections}/{len(self.asset_mappings)} successful")
            
        except Exception as e:
            self.logger.error(f"Market data collection error: {e}")
    
    async def collect_social_sentiment(self):
        """Collect social sentiment data"""
        try:
            self.logger.info("Collecting social sentiment data...")
            
            # This would integrate with social media APIs, news APIs, etc.
            # For now, we'll simulate the process
            await asyncio.sleep(1)
            
            self.logger.info("Social sentiment collection completed")
            
        except Exception as e:
            self.logger.error(f"Social sentiment collection error: {e}")
    
    async def collect_defi_data(self):
        """Collect DeFi protocol data"""
        try:
            self.logger.info("Collecting DeFi data...")
            
            # This would integrate with DeFi protocol APIs, TVL data, etc.
            # For now, we'll simulate the process
            await asyncio.sleep(1)
            
            self.logger.info("DeFi data collection completed")
            
        except Exception as e:
            self.logger.error(f"DeFi data collection error: {e}")
    
    async def get_historical_data(self, symbol: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get historical price data"""
        try:
            if symbol not in self.asset_mappings:
                return []
            
            coin_id = self.asset_mappings[symbol]['coingecko']
            url = f"{self.data_sources['coingecko']}/coins/{coin_id}/market_chart"
            
            params = {
                'vs_currency': 'usd',
                'days': str(days),
                'interval': 'daily' if days > 90 else 'hourly'
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_historical_data(data)
                else:
                    return self._generate_fallback_historical_data(symbol, days)
                    
        except Exception as e:
            self.logger.error(f"Error getting historical data for {symbol}: {e}")
            return self._generate_fallback_historical_data(symbol, days)
    
    def _parse_historical_data(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse historical data from CoinGecko"""
        prices = data.get('prices', [])
        volumes = data.get('total_volumes', [])
        
        historical_data = []
        for i, price_point in enumerate(prices):
            timestamp = price_point[0] // 1000  # Convert to seconds
            price = price_point[1]
            volume = volumes[i][1] if i < len(volumes) else 0
            
            historical_data.append({
                'timestamp': timestamp,
                'price': price,
                'volume': volume,
                'date': datetime.fromtimestamp(timestamp).isoformat()
            })
        
        return historical_data
    
    def _generate_fallback_historical_data(self, symbol: str, days: int) -> List[Dict[str, Any]]:
        """Generate fallback historical data"""
        symbol_hash = hash(symbol) % 2**32
        np.random.seed(symbol_hash)
        
        base_prices = {
            'BTC': 43000, 'ETH': 2600, 'USDC': 1.0, 'USDT': 1.0,
            'AAVE': 120, 'UNI': 8.5, 'COMP': 65, 'LINK': 15, 'MKR': 1800
        }
        
        base_price = base_prices.get(symbol, 100)
        historical_data = []
        
        for i in range(days):
            timestamp = int((datetime.utcnow() - timedelta(days=days-i)).timestamp())
            
            # Generate realistic price movement
            daily_change = np.random.normal(0, 0.03)  # 3% daily volatility
            price = base_price * (1 + daily_change * (i / days))
            volume = np.random.uniform(1e7, 1e9)
            
            historical_data.append({
                'timestamp': timestamp,
                'price': price,
                'volume': volume,
                'date': datetime.fromtimestamp(timestamp).isoformat()
            })
        
        return historical_data
