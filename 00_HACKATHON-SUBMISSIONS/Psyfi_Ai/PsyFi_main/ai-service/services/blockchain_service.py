import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import hashlib
import numpy as np

from utils.config import Config
from utils.logger import LoggerMixin
from utils.blockchain_analyzer import BlockchainAnalyzer

logger = logging.getLogger(__name__)

class BlockchainService(LoggerMixin):
    """Blockchain interaction service"""
    
    def __init__(self, config: Config):
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        self.blockchain_analyzer = BlockchainAnalyzer()
        
        # RPC endpoints
        self.rpc_endpoints = {
            'ethereum': config.ETHEREUM_RPC_URL,
            'polygon': config.POLYGON_RPC_URL,
            'bsc': config.BSC_RPC_URL
        }
        
        # API keys for blockchain explorers
        self.api_keys = {
            'etherscan': config.ETHERSCAN_API_KEY,
            'polygonscan': config.POLYGONSCAN_API_KEY,
            'bscscan': config.BSCSCAN_API_KEY
        }
        
        # Cache for blockchain data
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    async def initialize(self):
        """Initialize blockchain service"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'PsyFi-AI-Service/1.0'}
        )
        self.logger.info("Blockchain service initialized")
    
    async def close(self):
        """Close blockchain service"""
        if self.session:
            await self.session.close()
        self.logger.info("Blockchain service closed")
    
    async def get_wallet_data(self, wallet_address: str, chain: str = 'ethereum') -> Optional[Dict[str, Any]]:
        """Get comprehensive wallet data"""
        try:
            # Check cache first
            cache_key = f"wallet_data_{wallet_address}_{chain}"
            if cache_key in self.cache:
                cached_data = self.cache[cache_key]
                if datetime.utcnow().timestamp() - cached_data['timestamp'] < self.cache_ttl:
                    return cached_data['data']
            
            # Get wallet balance
            balance = await self.get_wallet_balance(wallet_address, chain)
            
            # Get transaction history
            transactions = await self.get_transaction_history(wallet_address, chain)
            
            # Get token balances
            token_balances = await self.get_token_balances(wallet_address, chain)
            
            # Get contract interactions
            contract_interactions = await self.get_contract_interactions(wallet_address, chain)
            
            # Calculate wallet age
            wallet_age = await self.calculate_wallet_age(wallet_address, chain, transactions)
            
            # Compile wallet data
            wallet_data = {
                'address': wallet_address,
                'chain': chain,
                'balance': balance,
                'transactions': transactions,
                'token_balances': token_balances,
                'contract_interactions': contract_interactions,
                'age_days': wallet_age,
                'last_activity': self._get_last_activity(transactions),
                'transaction_count': len(transactions),
                'unique_addresses_interacted': len(set(tx.get('to', '') for tx in transactions)),
                'total_gas_used': sum(tx.get('gas_used', 0) for tx in transactions),
                'analysis_timestamp': datetime.utcnow().isoformat()
            }
            
            # Cache the result
            self.cache[cache_key] = {
                'data': wallet_data,
                'timestamp': datetime.utcnow().timestamp()
            }
            
            return wallet_data
            
        except Exception as e:
            self.logger.error(f"Error getting wallet data for {wallet_address}: {e}")
            return self._generate_fallback_wallet_data(wallet_address, chain)
    
    async def get_wallet_balance(self, wallet_address: str, chain: str = 'ethereum') -> float:
        """Get wallet native token balance"""
        try:
            # In a real implementation, this would call the actual RPC endpoint
            # For now, we'll simulate the balance
            address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
            np.random.seed(address_hash % 2**32)
            
            # Generate realistic balance based on chain
            if chain == 'ethereum':
                balance = np.random.uniform(0.01, 100)  # ETH
            elif chain == 'polygon':
                balance = np.random.uniform(1, 10000)  # MATIC
            elif chain == 'bsc':
                balance = np.random.uniform(0.1, 1000)  # BNB
            else:
                balance = np.random.uniform(0.01, 100)
            
            return balance
            
        except Exception as e:
            self.logger.error(f"Error getting balance for {wallet_address}: {e}")
            return 0.0
    
    async def get_transaction_history(self, wallet_address: str, chain: str = 'ethereum', limit: int = 1000) -> List[Dict[str, Any]]:
        """Get transaction history for wallet"""
        try:
            # In a real implementation, this would call blockchain explorer APIs
            # For now, we'll generate realistic transaction data
            return await self._generate_transaction_history(wallet_address, chain, limit)
            
        except Exception as e:
            self.logger.error(f"Error getting transaction history for {wallet_address}: {e}")
            return []
    
    async def _generate_transaction_history(self, wallet_address: str, chain: str, limit: int) -> List[Dict[str, Any]]:
        """Generate realistic transaction history"""
        address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
        np.random.seed(address_hash % 2**32)
        
        num_transactions = min(np.random.randint(50, 500), limit)
        transactions = []
        
        base_timestamp = int(datetime.utcnow().timestamp())
        
        # Common contract addresses for different chains
        common_contracts = {
            'ethereum': [
                '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',  # Aave
                '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',  # Compound
                '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8',  # Uniswap V3
                '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',  # Curve
            ],
            'polygon': [
                '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',  # Aave Polygon
                '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F',  # Uniswap Polygon
            ],
            'bsc': [
                '0x10ED43C718714eb63d5aA57B78B54704E256024E',  # PancakeSwap
                '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',  # PancakeSwap V2
            ]
        }
        
        contracts = common_contracts.get(chain, common_contracts['ethereum'])
        
        for i in range(num_transactions):
            # Generate transaction timestamp (within last year)
            timestamp = base_timestamp - np.random.randint(0, 86400 * 365)
            
            # Determine transaction type and value
            tx_type = np.random.choice(['transfer', 'contract_interaction', 'defi'], p=[0.4, 0.3, 0.3])
            
            if tx_type == 'transfer':
                value = np.random.uniform(0.001, 10)
                to_address = self._generate_random_address()
                input_data = '0x'
                method = 'transfer'
            elif tx_type == 'contract_interaction':
                value = np.random.uniform(0, 5)
                to_address = np.random.choice(contracts)
                input_data = f"0x{hashlib.md5(f'method{i}'.encode()).hexdigest()[:8]}"
                method = np.random.choice(['approve', 'transfer', 'mint', 'burn'])
            else:  # defi
                value = np.random.uniform(0.1, 100)
                to_address = np.random.choice(contracts)
                input_data = f"0x{hashlib.md5(f'defi{i}'.encode()).hexdigest()[:8]}"
                method = np.random.choice(['swap', 'addLiquidity', 'removeLiquidity', 'stake', 'unstake'])
            
            # Gas calculations
            base_gas = 21000 if tx_type == 'transfer' else np.random.randint(50000, 500000)
            gas_price = np.random.uniform(20, 200)  # Gwei
            
            transaction = {
                'hash': f"0x{hashlib.md5(f'{wallet_address}{i}{timestamp}'.encode()).hexdigest()}",
                'from': wallet_address if np.random.random() < 0.6 else self._generate_random_address(),
                'to': to_address,
                'value': value,
                'timestamp': timestamp,
                'block_number': 18000000 + i,
                'gas_used': base_gas,
                'gas_price': gas_price,
                'gas_fee': (base_gas * gas_price) / 1e9,  # Convert to ETH equivalent
                'status': 'success' if np.random.random() < 0.95 else 'failed',
                'input_data': input_data,
                'method': method,
                'transaction_type': tx_type,
                'chain': chain
            }
            
            transactions.append(transaction)
        
        # Sort by timestamp (most recent first)
        return sorted(transactions, key=lambda x: x['timestamp'], reverse=True)
    
    def _generate_random_address(self) -> str:
        """Generate a random blockchain address"""
        return f"0x{''.join(np.random.choice('0123456789abcdef', 40))}"
    
    async def get_token_balances(self, wallet_address: str, chain: str = 'ethereum') -> List[Dict[str, Any]]:
        """Get token balances for wallet"""
        try:
            # Simulate token balances
            address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
            np.random.seed(address_hash % 2**32)
            
            # Common tokens for different chains
            common_tokens = {
                'ethereum': [
                    {'symbol': 'USDC', 'name': 'USD Coin', 'decimals': 6},
                    {'symbol': 'USDT', 'name': 'Tether USD', 'decimals': 6},
                    {'symbol': 'AAVE', 'name': 'Aave Token', 'decimals': 18},
                    {'symbol': 'UNI', 'name': 'Uniswap', 'decimals': 18},
                    {'symbol': 'COMP', 'name': 'Compound', 'decimals': 18},
                    {'symbol': 'LINK', 'name': 'Chainlink', 'decimals': 18},
                ],
                'polygon': [
                    {'symbol': 'USDC', 'name': 'USD Coin (PoS)', 'decimals': 6},
                    {'symbol': 'WETH', 'name': 'Wrapped Ether', 'decimals': 18},
                    {'symbol': 'AAVE', 'name': 'Aave (PoS)', 'decimals': 18},
                ],
                'bsc': [
                    {'symbol': 'BUSD', 'name': 'Binance USD', 'decimals': 18},
                    {'symbol': 'CAKE', 'name': 'PancakeSwap Token', 'decimals': 18},
                    {'symbol': 'USDT', 'name': 'Tether USD', 'decimals': 18},
                ]
            }
            
            tokens = common_tokens.get(chain, common_tokens['ethereum'])
            token_balances = []
            
            # Generate balances for some tokens
            num_tokens = np.random.randint(0, min(len(tokens), 5))
            selected_tokens = np.random.choice(tokens, num_tokens, replace=False) if num_tokens > 0 else []
            
            for token in selected_tokens:
                balance = np.random.uniform(0.1, 10000)
                token_balances.append({
                    'symbol': token['symbol'],
                    'name': token['name'],
                    'balance': balance,
                    'decimals': token['decimals'],
                    'contract_address': self._generate_random_address()
                })
            
            return token_balances
            
        except Exception as e:
            self.logger.error(f"Error getting token balances for {wallet_address}: {e}")
            return []
    
    async def get_contract_interactions(self, wallet_address: str, chain: str = 'ethereum') -> Dict[str, Any]:
        """Get contract interaction summary"""
        try:
            # This would analyze transaction history for contract interactions
            # For now, we'll simulate the data
            address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
            np.random.seed(address_hash % 2**32)
            
            interactions = {
                'total_interactions': np.random.randint(10, 200),
                'unique_contracts': np.random.randint(5, 50),
                'defi_interactions': np.random.randint(5, 100),
                'nft_interactions': np.random.randint(0, 20),
                'exchange_interactions': np.random.randint(0, 30),
                'most_used_protocols': [
                    {'name': 'Uniswap', 'interactions': np.random.randint(10, 50)},
                    {'name': 'Aave', 'interactions': np.random.randint(5, 30)},
                    {'name': 'Compound', 'interactions': np.random.randint(3, 20)},
                ]
            }
            
            return interactions
            
        except Exception as e:
            self.logger.error(f"Error getting contract interactions for {wallet_address}: {e}")
            return {}
    
    async def calculate_wallet_age(self, wallet_address: str, chain: str, transactions: List[Dict[str, Any]]) -> int:
        """Calculate wallet age in days"""
        try:
            if not transactions:
                return 0
            
            # Find the earliest transaction
            earliest_timestamp = min(tx['timestamp'] for tx in transactions)
            current_timestamp = datetime.utcnow().timestamp()
            
            age_seconds = current_timestamp - earliest_timestamp
            age_days = int(age_seconds / 86400)
            
            return max(1, age_days)  # At least 1 day
            
        except Exception as e:
            self.logger.error(f"Error calculating wallet age: {e}")
            return 1
    
    def _get_last_activity(self, transactions: List[Dict[str, Any]]) -> str:
        """Get timestamp of last activity"""
        if not transactions:
            return datetime.utcnow().isoformat()
        
        latest_timestamp = max(tx['timestamp'] for tx in transactions)
        return datetime.fromtimestamp(latest_timestamp).isoformat()
    
    def _generate_fallback_wallet_data(self, wallet_address: str, chain: str) -> Dict[str, Any]:
        """Generate fallback wallet data when APIs are unavailable"""
        address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
        np.random.seed(address_hash % 2**32)
        
        return {
            'address': wallet_address,
            'chain': chain,
            'balance': np.random.uniform(0.01, 100),
            'transactions': [],
            'token_balances': [],
            'contract_interactions': {
                'total_interactions': np.random.randint(10, 200),
                'unique_contracts': np.random.randint(5, 50),
                'defi_interactions': np.random.randint(5, 100)
            },
            'age_days': np.random.randint(1, 1000),
            'last_activity': datetime.utcnow().isoformat(),
            'transaction_count': 0,
            'unique_addresses_interacted': 0,
            'total_gas_used': 0,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'fallback': True
        }
    
    async def get_block_info(self, block_number: int, chain: str = 'ethereum') -> Optional[Dict[str, Any]]:
        """Get block information"""
        try:
            # Simulate block info
            return {
                'number': block_number,
                'hash': f"0x{hashlib.md5(f'block{block_number}'.encode()).hexdigest()}",
                'timestamp': int(datetime.utcnow().timestamp()),
                'transaction_count': np.random.randint(100, 300),
                'gas_used': np.random.randint(10000000, 30000000),
                'gas_limit': 30000000,
                'chain': chain
            }
            
        except Exception as e:
            self.logger.error(f"Error getting block info for {block_number}: {e}")
            return None
    
    async def get_transaction_receipt(self, tx_hash: str, chain: str = 'ethereum') -> Optional[Dict[str, Any]]:
        """Get transaction receipt"""
        try:
            # Simulate transaction receipt
            return {
                'transaction_hash': tx_hash,
                'status': 'success',
                'block_number': np.random.randint(18000000, 19000000),
                'gas_used': np.random.randint(21000, 500000),
                'effective_gas_price': np.random.randint(20, 200),
                'logs': [],
                'chain': chain
            }
            
        except Exception as e:
            self.logger.error(f"Error getting transaction receipt for {tx_hash}: {e}")
            return None
    
    async def estimate_gas(self, transaction: Dict[str, Any], chain: str = 'ethereum') -> int:
        """Estimate gas for transaction"""
        try:
            # Simple gas estimation based on transaction type
            if transaction.get('data', '0x') == '0x':
                return 21000  # Simple transfer
            else:
                return np.random.randint(50000, 500000)  # Contract interaction
                
        except Exception as e:
            self.logger.error(f"Error estimating gas: {e}")
            return 21000
    
    async def get_network_stats(self, chain: str = 'ethereum') -> Dict[str, Any]:
        """Get network statistics"""
        try:
            return {
                'chain': chain,
                'latest_block': np.random.randint(18000000, 19000000),
                'avg_gas_price': np.random.uniform(20, 200),
                'network_hashrate': np.random.uniform(200, 400),  # TH/s for Ethereum
                'pending_transactions': np.random.randint(50000, 200000),
                'total_addresses': np.random.randint(100000000, 200000000),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting network stats for {chain}: {e}")
            return {}
    
    async def monitor_address(self, wallet_address: str, chain: str = 'ethereum') -> Dict[str, Any]:
        """Set up address monitoring"""
        try:
            # In a real implementation, this would set up webhooks or polling
            monitoring_id = hashlib.md5(f"{wallet_address}{chain}{datetime.utcnow()}".encode()).hexdigest()[:16]
            
            return {
                'monitoring_id': monitoring_id,
                'wallet_address': wallet_address,
                'chain': chain,
                'status': 'active',
                'created_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error setting up monitoring for {wallet_address}: {e}")
            return {}
    
    async def get_defi_positions(self, wallet_address: str, chain: str = 'ethereum') -> List[Dict[str, Any]]:
        """Get DeFi positions for wallet"""
        try:
            # Simulate DeFi positions
            address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
            np.random.seed(address_hash % 2**32)
            
            protocols = ['Aave', 'Compound', 'Uniswap V3', 'Curve', 'Yearn', 'MakerDAO']
            positions = []
            
            num_positions = np.random.randint(0, 4)
            for i in range(num_positions):
                protocol = np.random.choice(protocols)
                position_type = np.random.choice(['lending', 'borrowing', 'liquidity', 'staking'])
                
                positions.append({
                    'protocol': protocol,
                    'type': position_type,
                    'asset': np.random.choice(['ETH', 'USDC', 'USDT', 'DAI', 'WBTC']),
                    'amount': np.random.uniform(0.1, 1000),
                    'value_usd': np.random.uniform(100, 50000),
                    'apy': np.random.uniform(1, 15),
                    'health_factor': np.random.uniform(1.1, 3.0) if position_type == 'borrowing' else None
                })
            
            return positions
            
        except Exception as e:
            self.logger.error(f"Error getting DeFi positions for {wallet_address}: {e}")
            return []
