#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    
    // Drop existing tables to start fresh
    console.log('🧹 Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS token_mentions CASCADE');
    await client.query('DROP TABLE IF EXISTS farcaster_casts CASCADE');
    await client.query('DROP TABLE IF EXISTS price_history CASCADE');
    await client.query('DROP TABLE IF EXISTS token_prices CASCADE');
    await client.query('DROP TABLE IF EXISTS discovered_tokens CASCADE');
    await client.query('DROP TABLE IF EXISTS price_history_5m CASCADE');
    await client.query('DROP TABLE IF EXISTS price_history_1h CASCADE');
    
    // Create tokens table - stores information about each token
    await client.query(`
      CREATE TABLE tokens (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
      
        base_address VARCHAR(42),
        is_stable BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ tokens table created');

    // Create price_history table - stores price data for all tokens at regular intervals
    await client.query(`
      CREATE TABLE price_history (
        id SERIAL PRIMARY KEY,
        token_symbol VARCHAR(20) NOT NULL,
        price_usd DECIMAL(20, 8) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        source VARCHAR(50) DEFAULT 'api',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (token_symbol) REFERENCES tokens(symbol) ON DELETE CASCADE,
        UNIQUE(token_symbol, timestamp)
      );
    `);
    console.log('✅ price_history table created');

    // Create farcaster_casts table - stores all Farcaster posts
    await client.query(`
      CREATE TABLE farcaster_casts (
        id SERIAL PRIMARY KEY,
        cast_hash VARCHAR(66) NOT NULL UNIQUE,
        author_fid VARCHAR(20) NOT NULL,
        author_username VARCHAR(100),
        author_display_name VARCHAR(100),
        text TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        channel VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ farcaster_casts table created');

    // Create token_mentions table - links tokens to Farcaster posts
    await client.query(`
      CREATE TABLE token_mentions (
        id SERIAL PRIMARY KEY,
        token_symbol VARCHAR(20) NOT NULL,
        cast_hash VARCHAR(66) NOT NULL,
        mention_type VARCHAR(20) DEFAULT 'text', -- 'text', 'hashtag', 'channel'
        context TEXT,
        sentiment VARCHAR(20) DEFAULT 'neutral', -- 'positive', 'negative', 'neutral'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (token_symbol) REFERENCES tokens(symbol) ON DELETE CASCADE,
        FOREIGN KEY (cast_hash) REFERENCES farcaster_casts(cast_hash) ON DELETE CASCADE,
        UNIQUE(token_symbol, cast_hash)
      );
    `);
    console.log('✅ token_mentions table created');

    // Create indexes for performance
    await client.query(`
      CREATE INDEX idx_price_history_token_timestamp ON price_history(token_symbol, timestamp);
      CREATE INDEX idx_price_history_timestamp ON price_history(timestamp);
      CREATE INDEX idx_farcaster_casts_timestamp ON farcaster_casts(timestamp);
      CREATE INDEX idx_farcaster_casts_author ON farcaster_casts(author_fid);
      CREATE INDEX idx_token_mentions_symbol ON token_mentions(token_symbol);
      CREATE INDEX idx_token_mentions_timestamp ON token_mentions(created_at);
      CREATE INDEX idx_tokens_symbol ON tokens(symbol);
    `);
    console.log('✅ Indexes created');

    // Insert initial Base chain tokens
    const baseTokens = [
        { symbol: 'ETH', name: 'Ethereum', base_address: '0x0000000000000000000000000000000000000000', is_stable: false },
  { symbol: 'WETH', name: 'Wrapped Ethereum', base_address: '0x4200000000000000000000000000000000000006', is_stable: false },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', base_address: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', is_stable: false },
  { symbol: 'DAI', name: 'Dai', base_address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', is_stable: true },
  { symbol: 'USDC', name: 'USD Coin', base_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', is_stable: true }
    ];

    for (const token of baseTokens) {
      await client.query(`
        INSERT INTO tokens (symbol, name, base_address, is_stable)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (symbol) DO UPDATE SET
          updated_at = CURRENT_TIMESTAMP,
          base_address = EXCLUDED.base_address,
          is_stable = EXCLUDED.is_stable
      `, [token.symbol, token.name, token.base_address, token.is_stable]);
    }
    console.log('✅ Initial Base chain tokens inserted');

    // Insert initial ETH price data (placeholder)
    await client.query(`
      INSERT INTO price_history (token_symbol, price_usd, timestamp, source) 
      VALUES ('ETH', 2000.00, CURRENT_TIMESTAMP, 'initial')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Initial ETH price inserted');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await initDatabase();
    console.log('🎉 Database initialized successfully!');
    console.log('');
    console.log('📊 Schema created:');
    console.log('  • tokens - Token information (ETH, WETH, WBTC, DAI, USDC)');
    console.log('  • price_history - Price data for all tokens');
    console.log('  • farcaster_casts - All Farcaster posts');
    console.log('  • token_mentions - Links tokens to posts with sentiment');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('  • npm run pull-eth-data (get recent mentions)');
    console.log('  • npm run populate-eth-prices (get price history)');
    process.exit(0);
  } catch (error) {
    console.error('💥 Failed to initialize database:', error);
    process.exit(1);
  }
}

main();
