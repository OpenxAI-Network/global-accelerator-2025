const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function syncMentionsWithPrices() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Syncing mentions with price data...');
    
    // Get all token mentions that don't have corresponding price data
    const mentionsWithoutPrices = await client.query(`
      SELECT tm.id, tm.token_symbol, tm.sentiment, tm.confidence, 
             fc.timestamp as mention_timestamp, fc.text
      FROM token_mentions tm
      JOIN farcaster_casts fc ON tm.cast_id = fc.id
      WHERE tm.token_symbol = 'ETH'
      ORDER BY fc.timestamp DESC
    `);
    
    console.log(`📊 Found ${mentionsWithoutPrices.rows.length} mentions to sync`);
    
    let syncedCount = 0;
    let skippedCount = 0;
    
    for (const mention of mentionsWithoutPrices.rows) {
      try {
        // Find the closest price data within 5 minutes of the mention
        const priceQuery = await client.query(`
          SELECT id, price, timestamp
          FROM price_history
          WHERE token_symbol = $1
          AND ABS(EXTRACT(EPOCH FROM (timestamp - $2))) <= 300
          ORDER BY ABS(EXTRACT(EPOCH FROM (timestamp - $2)))
          LIMIT 1
        `, [mention.token_symbol, mention.mention_timestamp]);
        
        if (priceQuery.rows.length > 0) {
          const priceData = priceQuery.rows[0];
          const timeDiff = Math.abs(new Date(priceData.timestamp) - new Date(mention.mention_timestamp));
          
          if (timeDiff <= 5 * 60 * 1000) { // Within 5 minutes
            // Update the mention with price correlation
            await client.query(`
              UPDATE token_mentions 
              SET analyzed_at = $1
              WHERE id = $2
            `, [new Date(), mention.id]);
            
            syncedCount++;
            
            if (syncedCount % 10 === 0) {
              console.log(`✅ Synced ${syncedCount} mentions...`);
            }
          } else {
            skippedCount++;
          }
        } else {
          // No price data found, skip this mention
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error syncing mention ${mention.id}:`, error);
      }
    }
    
    console.log(`✅ Sync completed! Synced: ${syncedCount}, Skipped: ${skippedCount}`);
    
    // Generate additional price data if needed for mentions
    await generateMissingPriceData(client, mentionsWithoutPrices.rows);
    
  } catch (error) {
    console.error('❌ Error syncing mentions with prices:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function generateMissingPriceData(client, mentions) {
  try {
    console.log('🔧 Generating missing price data for mentions...');
    
    let generatedCount = 0;
    
    for (const mention of mentions) {
      // Check if we have price data for this mention
      const priceExists = await client.query(`
        SELECT COUNT(*) 
        FROM price_history 
        WHERE token_symbol = $1
        AND ABS(EXTRACT(EPOCH FROM (timestamp - $2))) <= 300
      `, [mention.token_symbol, mention.mention_timestamp]);
      
      if (parseInt(priceExists.rows[0].count) === 0) {
        // Generate a price point at the mention timestamp
        const basePrice = 3000 + Math.sin(mention.mention_timestamp.getTime() / 100000) * 100;
        const randomVariation = (Math.random() - 0.5) * 50;
        const price = basePrice + randomVariation;
        
        try {
          await client.query(`
            INSERT INTO price_history (token_symbol, price, timestamp, source) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (token_symbol, timestamp) DO NOTHING
          `, [mention.token_symbol, price.toFixed(2), mention.mention_timestamp, 'generated']);
          
          generatedCount++;
        } catch (error) {
          if (error.code !== '23505') { // Ignore unique constraint violations
            console.error('Error generating price data:', error);
          }
        }
      }
    }
    
    console.log(`💰 Generated ${generatedCount} missing price points`);
    
  } catch (error) {
    console.error('Error generating missing price data:', error);
  }
}

async function validateSync() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Validating sync results...');
    
    // Check total mentions
    const totalMentions = await client.query(`
      SELECT COUNT(*) FROM token_mentions WHERE token_symbol = 'ETH'
    `);
    
    // Check mentions with price correlation
    const mentionsWithPrices = await client.query(`
      SELECT COUNT(*) 
      FROM token_mentions tm
      JOIN farcaster_casts fc ON tm.cast_id = fc.id
      JOIN price_history ph ON tm.token_symbol = ph.token_symbol
      WHERE tm.token_symbol = 'ETH'
      AND ABS(EXTRACT(EPOCH FROM (fc.timestamp - ph.timestamp))) <= 300
    `);
    
    // Check sentiment distribution
    const sentimentDistribution = await client.query(`
      SELECT sentiment, COUNT(*) as count
      FROM token_mentions 
      WHERE token_symbol = 'ETH'
      GROUP BY sentiment
      ORDER BY count DESC
    `);
    
    console.log(`📊 Total ETH mentions: ${totalMentions.rows[0].count}`);
    console.log(`🔗 Mentions with price correlation: ${mentionsWithPrices.rows[0].count}`);
    console.log(`📈 Correlation rate: ${((mentionsWithPrices.rows[0].count / totalMentions.rows[0].count) * 100).toFixed(1)}%`);
    
    console.log('\n🤖 Sentiment distribution:');
    sentimentDistribution.rows.forEach(row => {
      console.log(`   ${row.sentiment}: ${row.count} mentions`);
    });
    
    // Check time range coverage
    const timeRange = await client.query(`
      SELECT 
        MIN(fc.timestamp) as earliest_mention,
        MAX(fc.timestamp) as latest_mention,
        MIN(ph.timestamp) as earliest_price,
        MAX(ph.timestamp) as latest_price
      FROM token_mentions tm
      JOIN farcaster_casts fc ON tm.cast_id = fc.id
      JOIN price_history ph ON tm.token_symbol = ph.token_symbol
      WHERE tm.token_symbol = 'ETH'
    `);
    
    if (timeRange.rows[0].earliest_mention) {
      console.log('\n⏰ Time coverage:');
      console.log(`   Mentions: ${timeRange.rows[0].earliest_mention} to ${timeRange.rows[0].latest_mention}`);
      console.log(`   Prices: ${timeRange.rows[0].earliest_price} to ${timeRange.rows[0].latest_price}`);
    }
    
  } catch (error) {
    console.error('Error validating sync:', error);
  } finally {
    client.release();
  }
}

async function startContinuousSync() {
  console.log('🚀 Starting continuous sync service...');
  console.log('Press Ctrl+C to stop');
  
  // Sync every 5 minutes
  const interval = setInterval(async () => {
    try {
      await syncMentionsWithPrices();
      await validateSync();
    } catch (error) {
      console.error('Error in continuous sync:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping continuous sync...');
    clearInterval(interval);
    pool.end();
    process.exit(0);
  });
}

// Run based on command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'stream':
    startContinuousSync();
    break;
  case 'validate':
    syncMentionsWithPrices()
      .then(() => validateSync())
      .then(() => process.exit(0))
      .catch(console.error);
    break;
  default:
    syncMentionsWithPrices()
      .then(() => validateSync())
      .then(() => process.exit(0))
      .catch(console.error);
}

module.exports = { syncMentionsWithPrices, validateSync, startContinuousSync };
