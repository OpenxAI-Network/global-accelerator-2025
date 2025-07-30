import asyncio
import aiohttp
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import hashlib
import numpy as np

class BlockchainAnalyzer:
    """Blockchain data analyzer for fraud detection and wallet analysis"""
    
    def __init__(self):
        self.session = None
        self.cache = {}
        self.known_contracts = {
            # DeFi protocols
            '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9': 'Aave Lending Pool',
            '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5': 'Compound cETH',
            '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8': 'Uniswap V3 Pool',
            '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7': 'Curve 3Pool',
            
            # Known mixers (for fraud detection)
            '0x722122dF12D4e14e13Ac3b6895a86e84145b6967': 'Tornado Cash',
            '0xD4B88Df4D29F5CedD6857912842cff3b20C8cfa3': 'Tornado Cash',
            
            # Exchanges
            '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE': 'Binance',
            '0xD551234Ae421e3BCBA99A0Da6d736074f22192FF': 'Binance',
            '0x28C6c06298d514Db089934071355E5743bf21d60': 'Binance',
        }
        
        self.risk_patterns = {
            'mixer_interaction': 90,
            'new_wallet_high_volume': 70,
            'rapid_transfers': 60,
            'round_amounts': 40,
            'unusual_gas_prices': 30
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def analyze_wallet_comprehensive(self, wallet_address: str) -> Dict[str, Any]:
        """Comprehensive wallet analysis"""
        try:
            # Get basic wallet info
            wallet_info = await self.get_wallet_info(wallet_address)
            
            # Get transaction history
            transactions = await self.get_transaction_history(wallet_address)
            
            # Analyze transaction patterns
            patterns = await self.analyze_transaction_patterns(transactions)
            
            # Check for known risky addresses
            risk_analysis = await self.analyze_risk_factors(wallet_address, transactions)
            
            # Analyze contract interactions
            contract_analysis = await self.analyze_contract_interactions(transactions)
            
            # Calculate behavioral metrics
            behavioral_metrics = await self.calculate_behavioral_metrics(transactions)
            
            return {
                'wallet_info': wallet_info,
                'transaction_count': len(transactions),
                'patterns': patterns,
                'risk_analysis': risk_analysis,
                'contract_analysis': contract_analysis,
                'behavioral_metrics': behavioral_metrics,
                'analysis_timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'wallet_address': wallet_address,
                'analysis_timestamp': datetime.utcnow().isoformat()
            }
    
    async def get_wallet_info(self, wallet_address: str) -> Dict[str, Any]:
        """Get basic wallet information"""
        # Simulate wallet info (in production, this would call actual blockchain APIs)
        address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
        np.random.seed(address_hash % 2**32)
        
        creation_days_ago = np.random.randint(1, 1000)
        balance_eth = np.random.uniform(0.01, 100)
        
        return {
            'address': wallet_address,
            'balance_eth': balance_eth,
            'balance_usd': balance_eth * 2500,  # Approximate ETH price
            'creation_date': (datetime.utcnow() - timedelta(days=creation_days_ago)).isoformat(),
            'age_days': creation_days_ago,
            'is_contract': np.random.random() < 0.1,  # 10% chance of being a contract
            'nonce': np.random.randint(1, 10000)
        }
    
    async def get_transaction_history(self, wallet_address: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get transaction history for wallet"""
        # Simulate transaction history
        address_hash = int(hashlib.md5(wallet_address.encode()).hexdigest()[:8], 16)
        np.random.seed(address_hash % 2**32)
        
        num_transactions = min(np.random.randint(10, 500), limit)
        transactions = []
        
        base_timestamp = int(datetime.utcnow().timestamp())
        
        for i in range(num_transactions):
            # Generate realistic transaction data
            timestamp = base_timestamp - np.random.randint(0, 86400 * 365)  # Within last year
            
            # Transaction value (ETH)
            if np.random.random() < 0.1:  # 10% large transactions
                value = np.random.uniform(10, 1000)
            else:
                value = np.random.uniform(0.001, 10)
            
            # Gas price
            gas_price = np.random.uniform(20, 200)  # Gwei
            gas_used = np.random.randint(21000, 500000)
            
            # Generate addresses
            to_address = self.generate_random_address()
            from_address = wallet_address if np.random.random() < 0.5 else self.generate_random_address()
            
            transaction = {
                'hash': f"0x{hashlib.md5(f'{wallet_address}{i}{timestamp}'.encode()).hexdigest()}",
                'from': from_address,
                'to': to_address,
                'value': value,
                'timestamp': timestamp,
                'gas_price': gas_price,
                'gas_used': gas_used,
                'gas_fee': (gas_price * gas_used) / 1e9,  # ETH
                'block_number': 18000000 + i,
                'status': 'success' if np.random.random() < 0.95 else 'failed',
                'input_data': '0x' if np.random.random() < 0.7 else f"0x{hashlib.md5(f'data{i}'.encode()).hexdigest()}",
                'method': self.get_random_method()
            }
            
            transactions.append(transaction)
        
        return sorted(transactions, key=lambda x: x['timestamp'], reverse=True)
    
    def generate_random_address(self) -> str:
        """Generate a random Ethereum address"""
        return f"0x{''.join(np.random.choice('0123456789abcdef', 40))}"
    
    def get_random_method(self) -> str:
        """Get random transaction method"""
        methods = [
            'transfer', 'approve', 'swap', 'deposit', 'withdraw',
            'mint', 'burn', 'stake', 'unstake', 'claim',
            'addLiquidity', 'removeLiquidity', 'borrow', 'repay'
        ]
        return np.random.choice(methods)
    
    async def analyze_transaction_patterns(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze transaction patterns for anomalies"""
        if not transactions:
            return {'patterns': [], 'anomalies': []}
        
        patterns = []
        anomalies = []
        
        # Time pattern analysis
        timestamps = [tx['timestamp'] for tx in transactions]
        time_intervals = np.diff(sorted(timestamps))
        
        if len(time_intervals) > 0:
            avg_interval = np.mean(time_intervals)
            min_interval = np.min(time_intervals)
            
            if min_interval < 60:  # Less than 1 minute
                anomalies.append("Extremely rapid transactions detected")
            
            if avg_interval < 3600:  # Less than 1 hour average
                patterns.append("High frequency trading pattern")
        
        # Value pattern analysis
        values = [tx['value'] for tx in transactions]
        if values:
            # Check for round numbers
            round_values = sum(1 for v in values if v == round(v))
            if round_values > len(values) * 0.5:
                anomalies.append("High frequency of round number transactions")
            
            # Check for consistent amounts
            unique_values = len(set(values))
            if unique_values < len(values) * 0.1:
                anomalies.append("Repetitive transaction amounts")
            
            # Large transaction analysis
            large_txs = [v for v in values if v > 100]  # > 100 ETH
            if large_txs:
                patterns.append(f"Large transactions detected: {len(large_txs)} transactions > 100 ETH")
        
        # Gas price analysis
        gas_prices = [tx['gas_price'] for tx in transactions]
        if gas_prices:
            avg_gas = np.mean(gas_prices)
            std_gas = np.std(gas_prices)
            
            if std_gas > avg_gas * 0.5:
                anomalies.append("Highly variable gas prices")
            
            high_gas_txs = [g for g in gas_prices if g > 500]  # > 500 Gwei
            if high_gas_txs:
                patterns.append(f"High gas price transactions: {len(high_gas_txs)}")
        
        # Address diversity analysis
        to_addresses = [tx['to'] for tx in transactions]
        unique_addresses = len(set(to_addresses))
        
        if unique_addresses < len(transactions) * 0.1:
            anomalies.append("Limited address interaction diversity")
        else:
            patterns.append("Diverse address interactions")
        
        return {
            'patterns': patterns,
            'anomalies': anomalies,
            'statistics': {
                'avg_interval_hours': avg_interval / 3600 if 'avg_interval' in locals() else 0,
                'min_interval_seconds': min_interval if 'min_interval' in locals() else 0,
                'avg_value_eth': np.mean(values) if values else 0,
                'max_value_eth': max(values) if values else 0,
                'unique_addresses': unique_addresses,
                'address_diversity_ratio': unique_addresses / len(transactions) if transactions else 0
            }
        }
    
    async def analyze_risk_factors(self, wallet_address: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze risk factors for the wallet"""
        risk_factors = []
        risk_score = 0
        
        # Check interactions with known risky addresses
        risky_interactions = 0
        for tx in transactions:
            if tx['to'] in self.known_contracts:
                contract_name = self.known_contracts[tx['to']]
                if 'Tornado' in contract_name:
                    risky_interactions += 1
                    risk_factors.append({
                        'type': 'mixer_interaction',
                        'description': f'Interaction with {contract_name}',
                        'severity': 'high',
                        'transaction_hash': tx['hash']
                    })
        
        if risky_interactions > 0:
            risk_score += self.risk_patterns['mixer_interaction']
        
        # Check for new wallet with high volume
        wallet_info = await self.get_wallet_info(wallet_address)
        if wallet_info['age_days'] < 30:
            total_volume = sum(tx['value'] for tx in transactions)
            if total_volume > 1000:  # > 1000 ETH
                risk_factors.append({
                    'type': 'new_wallet_high_volume',
                    'description': f'New wallet ({wallet_info["age_days"]} days) with high volume ({total_volume:.2f} ETH)',
                    'severity': 'medium'
                })
                risk_score += self.risk_patterns['new_wallet_high_volume']
        
        # Check for rapid transfers
        rapid_transfers = 0
        timestamps = sorted([tx['timestamp'] for tx in transactions])
        for i in range(1, len(timestamps)):
            if timestamps[i] - timestamps[i-1] < 300:  # Less than 5 minutes
                rapid_transfers += 1
        
        if rapid_transfers > 10:
            risk_factors.append({
                'type': 'rapid_transfers',
                'description': f'{rapid_transfers} transactions within 5-minute intervals',
                'severity': 'medium'
            })
            risk_score += self.risk_patterns['rapid_transfers']
        
        # Check for round amounts
        round_amounts = sum(1 for tx in transactions if tx['value'] == round(tx['value']))
        if round_amounts > len(transactions) * 0.6:
            risk_factors.append({
                'type': 'round_amounts',
                'description': f'{round_amounts}/{len(transactions)} transactions with round amounts',
                'severity': 'low'
            })
            risk_score += self.risk_patterns['round_amounts']
        
        # Normalize risk score
        max_possible_score = sum(self.risk_patterns.values())
        normalized_risk_score = min(100, (risk_score / max_possible_score) * 100)
        
        return {
            'risk_factors': risk_factors,
            'risk_score': normalized_risk_score,
            'risk_level': self.get_risk_level(normalized_risk_score),
            'total_risk_factors': len(risk_factors)
        }
    
    def get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level"""
        if risk_score >= 80:
            return 'critical'
        elif risk_score >= 60:
            return 'high'
        elif risk_score >= 40:
            return 'medium'
        else:
            return 'low'
    
    async def analyze_contract_interactions(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze smart contract interactions"""
        contract_interactions = {}
        defi_protocols = []
        unknown_contracts = []
        
        for tx in transactions:
            if tx['input_data'] != '0x':  # Contract interaction
                contract_addr = tx['to']
                
                if contract_addr in self.known_contracts:
                    contract_name = self.known_contracts[contract_addr]
                    if contract_addr not in contract_interactions:
                        contract_interactions[contract_addr] = {
                            'name': contract_name,
                            'interaction_count': 0,
                            'total_value': 0
                        }
                    
                    contract_interactions[contract_addr]['interaction_count'] += 1
                    contract_interactions[contract_addr]['total_value'] += tx['value']
                    
                    # Categorize DeFi protocols
                    if any(protocol in contract_name.lower() for protocol in ['aave', 'compound', 'uniswap', 'curve']):
                        if contract_name not in defi_protocols:
                            defi_protocols.append(contract_name)
                else:
                    if contract_addr not in unknown_contracts:
                        unknown_contracts.append(contract_addr)
        
        return {
            'known_contracts': contract_interactions,
            'defi_protocols': defi_protocols,
            'unknown_contracts': unknown_contracts[:10],  # Limit to first 10
            'total_contract_interactions': len([tx for tx in transactions if tx['input_data'] != '0x']),
            'defi_interaction_ratio': len(defi_protocols) / len(transactions) if transactions else 0
        }
    
    async def calculate_behavioral_metrics(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate behavioral metrics"""
        if not transactions:
            return {}
        
        # Time-based behavior
        timestamps = [tx['timestamp'] for tx in transactions]
        hours = [(ts % 86400) // 3600 for ts in timestamps]
        
        # Activity distribution by hour
        hour_distribution = {str(h): hours.count(h) for h in range(24)}
        
        # Most active hours
        most_active_hour = max(hour_distribution, key=hour_distribution.get)
        
        # Weekend vs weekday activity
        weekdays = []
        for ts in timestamps:
            dt = datetime.fromtimestamp(ts)
            weekdays.append(dt.weekday())
        
        weekend_activity = sum(1 for wd in weekdays if wd >= 5)
        weekday_activity = len(weekdays) - weekend_activity
        
        # Transaction value patterns
        values = [tx['value'] for tx in transactions]
        
        # Gas usage patterns
        gas_used = [tx['gas_used'] for tx in transactions]
        gas_prices = [tx['gas_price'] for tx in transactions]
        
        return {
            'activity_patterns': {
                'most_active_hour': int(most_active_hour),
                'hour_distribution': hour_distribution,
                'weekend_ratio': weekend_activity / len(transactions) if transactions else 0,
                'weekday_ratio': weekday_activity / len(transactions) if transactions else 0
            },
            'transaction_patterns': {
                'avg_value': np.mean(values),
                'median_value': np.median(values),
                'value_std': np.std(values),
                'max_value': max(values),
                'min_value': min(values)
            },
            'gas_patterns': {
                'avg_gas_used': np.mean(gas_used),
                'avg_gas_price': np.mean(gas_prices),
                'gas_efficiency': np.mean(gas_used) / np.mean(values) if np.mean(values) > 0 else 0
            },
            'consistency_metrics': {
                'value_consistency': 1 - (np.std(values) / np.mean(values)) if np.mean(values) > 0 else 0,
                'timing_consistency': 1 - (np.std(np.diff(sorted(timestamps))) / np.mean(np.diff(sorted(timestamps)))) if len(timestamps) > 1 else 0
            }
        }
    
    async def get_address_labels(self, addresses: List[str]) -> Dict[str, str]:
        """Get labels for addresses (exchange, DeFi protocol, etc.)"""
        labels = {}
        
        for addr in addresses:
            if addr in self.known_contracts:
                labels[addr] = self.known_contracts[addr]
            else:
                # Simulate address labeling
                addr_hash = int(hashlib.md5(addr.encode()).hexdigest()[:8], 16)
                if addr_hash % 100 < 5:  # 5% chance of being an exchange
                    labels[addr] = 'Exchange Wallet'
                elif addr_hash % 100 < 15:  # 10% chance of being DeFi
                    labels[addr] = 'DeFi Protocol'
                elif addr_hash % 100 < 20:  # 5% chance of being MEV bot
                    labels[addr] = 'MEV Bot'
                else:
                    labels[addr] = 'Unknown'
        
        return labels
    
    async def detect_wash_trading(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect potential wash trading patterns"""
        wash_trading_indicators = []
        
        # Group transactions by address pairs
        address_pairs = {}
        for tx in transactions:
            pair = tuple(sorted([tx['from'], tx['to']]))
            if pair not in address_pairs:
                address_pairs[pair] = []
            address_pairs[pair].append(tx)
        
        # Look for back-and-forth transactions
        for pair, txs in address_pairs.items():
            if len(txs) >= 4:  # At least 4 transactions between same addresses
                # Check for alternating directions
                directions = []
                for tx in sorted(txs, key=lambda x: x['timestamp']):
                    if tx['from'] == pair[0]:
                        directions.append('A->B')
                    else:
                        directions.append('B->A')
                
                # Count alternations
                alternations = sum(1 for i in range(1, len(directions)) if directions[i] != directions[i-1])
                
                if alternations >= len(directions) * 0.7:  # 70% alternation rate
                    wash_trading_indicators.append({
                        'type': 'alternating_transactions',
                        'addresses': pair,
                        'transaction_count': len(txs),
                        'alternation_rate': alternations / len(directions),
                        'severity': 'high' if alternations >= len(directions) * 0.9 else 'medium'
                    })
        
        return {
            'indicators': wash_trading_indicators,
            'wash_trading_score': len(wash_trading_indicators) * 25,  # 0-100 scale
            'is_suspicious': len(wash_trading_indicators) > 0
        }
    
    async def analyze_fund_flow(self, wallet_address: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze fund flow patterns"""
        inflows = []
        outflows = []
        
        for tx in transactions:
            if tx['to'].lower() == wallet_address.lower():
                inflows.append(tx)
            elif tx['from'].lower() == wallet_address.lower():
                outflows.append(tx)
        
        # Calculate flow metrics
        total_inflow = sum(tx['value'] for tx in inflows)
        total_outflow = sum(tx['value'] for tx in outflows)
        net_flow = total_inflow - total_outflow
        
        # Analyze flow timing
        inflow_timestamps = [tx['timestamp'] for tx in inflows]
        outflow_timestamps = [tx['timestamp'] for tx in outflows]
        
        # Quick turnaround analysis
        quick_turnarounds = 0
        for out_tx in outflows:
            for in_tx in inflows:
                if abs(out_tx['timestamp'] - in_tx['timestamp']) < 3600:  # Within 1 hour
                    if abs(out_tx['value'] - in_tx['value']) < in_tx['value'] * 0.1:  # Similar amounts
                        quick_turnarounds += 1
                        break
        
        return {
            'inflow_summary': {
                'total_amount': total_inflow,
                'transaction_count': len(inflows),
                'avg_amount': total_inflow / len(inflows) if inflows else 0,
                'largest_inflow': max([tx['value'] for tx in inflows]) if inflows else 0
            },
            'outflow_summary': {
                'total_amount': total_outflow,
                'transaction_count': len(outflows),
                'avg_amount': total_outflow / len(outflows) if outflows else 0,
                'largest_outflow': max([tx['value'] for tx in outflows]) if outflows else 0
            },
            'net_flow': net_flow,
            'flow_ratio': total_outflow / total_inflow if total_inflow > 0 else 0,
            'quick_turnarounds': quick_turnarounds,
            'turnaround_ratio': quick_turnarounds / len(outflows) if outflows else 0
        }
