const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: [path.resolve(__dirname, '..', '.env.local'), path.resolve(__dirname, '..', '.env')] });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...');
    
    // Check if we can connect
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Check what tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check farcaster_casts count
    try {
      const castsResult = await client.query('SELECT COUNT(*) as count FROM farcaster_casts');
      console.log(`\n📊 Farcaster casts: ${castsResult.rows[0].count} rows`);
      
      if (castsResult.rows[0].count > 0) {
        const sampleCasts = await client.query('SELECT * FROM farcaster_casts LIMIT 3');
        console.log('\n📝 Sample casts:');
        sampleCasts.rows.forEach((cast, i) => {
          console.log(`  ${i + 1}. ${cast.text?.substring(0, 100)}... (${cast.timestamp})`);
        });
      }
    } catch (e) {
      console.log('❌ farcaster_casts table does not exist');
    }
    
    // Check token_mentions
    try {
      const mentionsResult = await client.query('SELECT COUNT(*) as count FROM token_mentions');
      console.log(`✅ token_mentions: ${mentionsResult.rows[0].count} mentions`);
      
      // Show some recent mentions
      const recentMentions = await client.query(`
        SELECT tm.token_symbol, tm.sentiment, fc.text 
        FROM token_mentions tm 
        JOIN farcaster_casts fc ON tm.cast_hash = fc.cast_hash 
        ORDER BY tm.created_at DESC 
        LIMIT 3
      `);
      
      if (recentMentions.rows.length > 0) {
        console.log('  Recent mentions:');
        recentMentions.rows.forEach((mention, i) => {
          console.log(`  ${i + 1}. ${mention.token_symbol} - ${mention.cast_text?.substring(0, 100)}...`);
        });
      }
    } catch (error) {
      console.log('❌ token_mentions table does not exist');
    }

    // Check tokens
    try {
      const tokensResult = await client.query('SELECT symbol, name, is_stable FROM tokens ORDER BY symbol');
      console.log(`✅ tokens: ${tokensResult.rows.length} tokens`);
      
      if (tokensResult.rows.length > 0) {
        console.log('  Available tokens:');
        tokensResult.rows.forEach((token, i) => {
          console.log(`  ${i + 1}. ${token.symbol} - ${token.name} ${token.is_stable ? '(stable)' : ''}`);
        });
      }
    } catch (error) {
      console.log('❌ tokens table does not exist');
    }
    
    // Check price_history count
    try {
      const priceResult = await client.query('SELECT COUNT(*) as count FROM price_history');
      console.log(`\n📈 Price history: ${priceResult.rows[0].count} rows`);
      
      if (priceResult.rows[0].count > 0) {
        const samplePrices = await client.query('SELECT * FROM price_history ORDER BY timestamp DESC LIMIT 3');
        console.log('\n💵 Sample prices:');
        samplePrices.rows.forEach((price, i) => {
          console.log(`  ${i + 1}. ${price.token_symbol} - $${price.price_usd} (${price.timestamp})`);
        });
      }
    } catch (e) {
      console.log('❌ price_history table does not exist');
    }
    
    client.release();
    console.log('\n✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
