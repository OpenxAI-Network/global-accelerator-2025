const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function populateEthPrices() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Populating ETH price data...');
    
    // Generate mock price data for the past hour (every minute)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const prices = [];
    let currentTime = new Date(oneHourAgo);
    
    while (currentTime <= now) {
      // Generate realistic price movement
      const basePrice = 3000 + Math.sin(currentTime.getTime() / 100000) * 100;
      const randomVariation = (Math.random() - 0.5) * 50;
      const price = basePrice + randomVariation;
      
      prices.push({
        token_symbol: 'ETH',
        price: price.toFixed(2),
        timestamp: currentTime.toISOString(),
        source: 'mock'
      });
      
      // Move to next minute
      currentTime = new Date(currentTime.getTime() + 60 * 1000);
    }
    
    console.log(`📊 Generated ${prices.length} price points`);
    
    // Insert prices into database
    for (const price of prices) {
      try {
        await client.query(`
          INSERT INTO price_history (token_symbol, price, timestamp, source) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT (token_symbol, timestamp) DO NOTHING
        `, [price.token_symbol, price.price, price.timestamp, price.source]);
      } catch (error) {
        if (error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error inserting price:', error);
        }
      }
    }
    
    console.log('✅ ETH price data populated successfully!');
    
    // Verify the data
    const count = await client.query(`
      SELECT COUNT(*) FROM price_history 
      WHERE token_symbol = 'ETH' 
      AND timestamp >= $1
    `, [oneHourAgo.toISOString()]);
    
    console.log(`📈 Total ETH prices in database: ${count.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error populating ETH prices:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function populateHistoricalPrices() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Populating historical ETH price data...');
    
    // Generate mock price data for the past 7 days (every hour)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const prices = [];
    let currentTime = new Date(sevenDaysAgo);
    
    while (currentTime <= now) {
      // Generate realistic price movement with trend
      const daysSinceStart = (currentTime.getTime() - sevenDaysAgo.getTime()) / (24 * 60 * 60 * 1000);
      const trend = Math.sin(daysSinceStart / 7 * Math.PI) * 200; // Weekly cycle
      const basePrice = 3000 + trend;
      const randomVariation = (Math.random() - 0.5) * 100;
      const price = basePrice + randomVariation;
      
      prices.push({
        token_symbol: 'ETH',
        price: price.toFixed(2),
        timestamp: currentTime.toISOString(),
        source: 'mock'
      });
      
      // Move to next hour
      currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    }
    
    console.log(`📊 Generated ${prices.length} historical price points`);
    
    // Insert prices into database
    for (const price of prices) {
      try {
        await client.query(`
          INSERT INTO price_history (token_symbol, price, timestamp, source) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT (token_symbol, timestamp) DO NOTHING
        `, [price.token_symbol, price.price, price.timestamp, price.source]);
      } catch (error) {
        if (error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error inserting historical price:', error);
        }
      }
    }
    
    console.log('✅ Historical ETH price data populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating historical ETH prices:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function startPriceStream() {
  console.log('🚀 Starting continuous ETH price stream...');
  console.log('Press Ctrl+C to stop');
  
  // Stream prices every minute
  const interval = setInterval(async () => {
    try {
      await populateEthPrices();
    } catch (error) {
      console.error('Error in price stream:', error);
    }
  }, 60 * 1000); // Every minute
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping price stream...');
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
    startPriceStream();
    break;
  case 'historical':
    populateHistoricalPrices()
      .then(() => process.exit(0))
      .catch(console.error);
    break;
  default:
    populateEthPrices()
      .then(() => process.exit(0))
      .catch(console.error);
}

module.exports = { populateEthPrices, populateHistoricalPrices, startPriceStream };
