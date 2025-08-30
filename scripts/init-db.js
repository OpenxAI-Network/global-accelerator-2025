const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Initializing Vibe Trading AI database...');
    
    // Create tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        chain VARCHAR(50) DEFAULT 'base',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tokens table created');

    // Create price_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_history (
        id SERIAL PRIMARY KEY,
        token_symbol VARCHAR(10) REFERENCES tokens(symbol),
        price DECIMAL(20, 8) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        source VARCHAR(50) DEFAULT 'chainlink',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(token_symbol, timestamp)
      )
    `);
    console.log('✅ Price history table created');

    // Create farcaster_casts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS farcaster_casts (
        id SERIAL PRIMARY KEY,
        cast_hash VARCHAR(100) UNIQUE NOT NULL,
        author_fid BIGINT NOT NULL,
        author_username VARCHAR(100),
        author_display_name VARCHAR(100),
        text TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Farcaster casts table created');

    // Create token_mentions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_mentions (
        id SERIAL PRIMARY KEY,
        cast_id INTEGER REFERENCES farcaster_casts(id),
        token_symbol VARCHAR(10) REFERENCES tokens(symbol),
        sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
        confidence DECIMAL(5, 4),
        ai_model VARCHAR(50) DEFAULT 'ollama',
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Token mentions table created');

    // Insert default tokens
    const defaultTokens = [
      { symbol: 'ETH', name: 'Ethereum' },
      { symbol: 'WETH', name: 'Wrapped ETH' },
      { symbol: 'USDC', name: 'USD Coin' },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
      { symbol: 'DAI', name: 'Dai Stablecoin' }
    ];

    for (const token of defaultTokens) {
      await client.query(`
        INSERT INTO tokens (symbol, name) 
        VALUES ($1, $2) 
        ON CONFLICT (symbol) DO NOTHING
      `, [token.symbol, token.name]);
    }
    console.log('✅ Default tokens inserted');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_price_history_token_timestamp 
      ON price_history(token_symbol, timestamp DESC)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_farcaster_casts_timestamp 
      ON farcaster_casts(timestamp DESC)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_token_mentions_token_sentiment 
      ON token_mentions(token_symbol, sentiment)
    `);
    
    console.log('✅ Performance indexes created');

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database status...');
    
    // Check table counts
    const tables = ['tokens', 'price_history', 'farcaster_casts', 'token_mentions'];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`📊 ${table}: ${result.rows[0].count} records`);
    }
    
    // Check recent data
    const recentPrices = await client.query(`
      SELECT token_symbol, COUNT(*) as count, 
             MAX(timestamp) as latest 
      FROM price_history 
      GROUP BY token_symbol
    `);
    
    console.log('\n📈 Recent price data:');
    recentPrices.rows.forEach(row => {
      console.log(`   ${row.token_symbol}: ${row.count} prices, latest: ${row.latest}`);
    });
    
    const recentMentions = await client.query(`
      SELECT token_symbol, sentiment, COUNT(*) as count
      FROM token_mentions 
      WHERE analyzed_at > NOW() - INTERVAL '24 hours'
      GROUP BY token_symbol, sentiment
    `);
    
    console.log('\n🤖 Recent sentiment analysis:');
    recentMentions.rows.forEach(row => {
      console.log(`   ${row.token_symbol} (${row.sentiment}): ${row.count} mentions`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization if this script is called directly
if (require.main === module) {
  initDatabase()
    .then(() => checkDatabase())
    .catch(console.error)
    .finally(() => process.exit(0));
}

module.exports = { initDatabase, checkDatabase };
