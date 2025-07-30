-- PsyFi Database Schema
-- PostgreSQL initialization script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50),
    email VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Sessions table
CREATE TABLE IF NOT EXISTS api_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    prediction_id VARCHAR(255) UNIQUE NOT NULL,
    asset VARCHAR(20) NOT NULL,
    prediction_type VARCHAR(20) NOT NULL,
    current_price DECIMAL(20, 8),
    predicted_price DECIMAL(20, 8),
    predicted_change DECIMAL(10, 4),
    confidence DECIMAL(5, 2),
    timeframe VARCHAR(10) NOT NULL,
    reasoning TEXT,
    model_version VARCHAR(20),
    arweave_hash VARCHAR(255),
    actual_outcome DECIMAL(10, 4),
    accuracy_score DECIMAL(5, 2),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fraud Detection Logs table
CREATE TABLE IF NOT EXISTS fraud_logs (
    id SERIAL PRIMARY KEY,
    scan_id VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    safety_score INTEGER NOT NULL,
    risk_factors JSONB DEFAULT '[]',
    behavioral_analysis JSONB DEFAULT '{}',
    transaction_summary JSONB DEFAULT '{}',
    arweave_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Market Data table
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 2),
    market_cap DECIMAL(20, 2),
    change_24h DECIMAL(10, 4),
    sentiment_score DECIMAL(5, 2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timestamp)
);

-- DeFi Pools table
CREATE TABLE IF NOT EXISTS defi_pools (
    id SERIAL PRIMARY KEY,
    pool_id VARCHAR(255) UNIQUE NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    asset VARCHAR(20) NOT NULL,
    apy DECIMAL(8, 4) NOT NULL,
    tvl DECIMAL(20, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    ai_score DECIMAL(5, 2),
    features JSONB DEFAULT '[]',
    min_deposit DECIMAL(20, 8),
    lock_period INTEGER, -- in days
    fees DECIMAL(5, 4),
    contract_address VARCHAR(42),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Positions table
CREATE TABLE IF NOT EXISTS user_positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pool_id VARCHAR(255) REFERENCES defi_pools(pool_id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL,
    entry_price DECIMAL(20, 8) NOT NULL,
    current_value DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pool_id)
);

-- Memory Vault table
CREATE TABLE IF NOT EXISTS memory_vault (
    id SERIAL PRIMARY KEY,
    memory_id VARCHAR(255) UNIQUE NOT NULL,
    memory_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    performance DECIMAL(10, 4),
    confidence DECIMAL(5, 2),
    outcome VARCHAR(50),
    arweave_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trading Bots table
CREATE TABLE IF NOT EXISTS trading_bots (
    id SERIAL PRIMARY KEY,
    bot_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    strategy VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    total_invested DECIMAL(20, 8) DEFAULT 0,
    current_value DECIMAL(20, 8) DEFAULT 0,
    profit_loss DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bot Trades table
CREATE TABLE IF NOT EXISTS bot_trades (
    id SERIAL PRIMARY KEY,
    trade_id VARCHAR(255) UNIQUE NOT NULL,
    bot_id VARCHAR(255) REFERENCES trading_bots(bot_id) ON DELETE CASCADE,
    asset VARCHAR(20) NOT NULL,
    trade_type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    amount DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    profit_loss DECIMAL(20, 8),
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_api_sessions_session_id ON api_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_api_sessions_expires_at ON api_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_asset ON ai_predictions(asset);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_expires_at ON ai_predictions(expires_at);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_wallet_address ON fraud_logs(wallet_address);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_risk_level ON fraud_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_defi_pools_protocol ON defi_pools(protocol);
CREATE INDEX IF NOT EXISTS idx_defi_pools_asset ON defi_pools(asset);
CREATE INDEX IF NOT EXISTS idx_user_positions_user_id ON user_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_vault_memory_type ON memory_vault(memory_type);
CREATE INDEX IF NOT EXISTS idx_trading_bots_user_id ON trading_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_trades_bot_id ON bot_trades(bot_id);

-- Insert sample data
INSERT INTO users (wallet_address, username, email) VALUES
('0x742d35Cc6634C0532925a3b8D4C9db96590fcaAb', 'alice_defi', 'alice@example.com'),
('0x8ba1f109551bD432803012645Hac136c22C57B', 'bob_trader', 'bob@example.com'),
('0x1234567890123456789012345678901234567890', 'charlie_investor', 'charlie@example.com')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert sample DeFi pools
INSERT INTO defi_pools (pool_id, protocol, asset, apy, tvl, risk_level, ai_score, features, min_deposit, lock_period, fees, contract_address) VALUES
('aave-usdc-v3', 'Aave', 'USDC', 4.25, 1500000000, 'low', 92.5, '["lending", "stable", "audited"]', 1, 0, 0.0025, '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'),
('compound-eth-v2', 'Compound', 'ETH', 3.75, 800000000, 'low', 89.2, '["lending", "established", "governance"]', 0.01, 0, 0.005, '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'),
('uniswap-eth-usdc-v3', 'Uniswap', 'ETH/USDC', 12.5, 250000000, 'medium', 85.7, '["dex", "liquidity", "impermanent_loss"]', 100, 0, 0.003, '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8'),
('yearn-dai-vault', 'Yearn', 'DAI', 8.9, 120000000, 'medium', 88.1, '["yield_farming", "auto_compound", "strategies"]', 10, 0, 0.02, '0x19c45abf29aE3daf0D0C65e1691C73C9917E4Af4'),
('curve-3pool', 'Curve', '3CRV', 6.2, 2000000000, 'low', 91.3, '["stable_swap", "low_slippage", "rewards"]', 1, 0, 0.0004, '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7')
ON CONFLICT (pool_id) DO NOTHING;

-- Insert sample market data
INSERT INTO market_data (symbol, price, volume, market_cap, change_24h, sentiment_score) VALUES
('BTC', 43250.75, 28500000000, 847000000000, 2.45, 72.5),
('ETH', 2650.30, 15200000000, 318000000000, 1.85, 68.9),
('USDC', 1.0001, 8900000000, 25000000000, 0.01, 50.0),
('AAVE', 125.67, 450000000, 1800000000, -1.25, 65.2),
('UNI', 8.45, 320000000, 5100000000, 3.75, 71.8)
ON CONFLICT (symbol, timestamp) DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defi_pools_updated_at BEFORE UPDATE ON defi_pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_positions_updated_at BEFORE UPDATE ON user_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_bots_updated_at BEFORE UPDATE ON trading_bots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO psyfi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO psyfi_user;
