#!/usr/bin/env node

const { Pool } = require('pg');
const { ethers } = require('ethers');

// Use Chainlink price feed for real-time ETH prices
async function getETHPriceFromChainlink(provider, proxyAddress) {
  const abi = [
    'function decimals() view returns(uint8)',
    'function latestRoundData() view returns(uint80,int256,uint256,uint256,uint80)'
  ];
  
  const feed = new ethers.Contract(proxyAddress, abi, provider);
  const decimals = await feed.decimals();
  const roundData = await feed.latestRoundData();
  const price = Number(roundData[1]) / Math.pow(10, decimals);
  
  return price;
}

async function main() {
  // Check required environment variables
  const providerUrl = process.env.BASE_RPC_URL;
  const proxyAddress = process.env.CHAINLINK_BASE_ETH_USD;
  
  if (!providerUrl || !proxyAddress) {
    console.error('Missing BASE_RPC_URL or CHAINLINK_BASE_ETH_USD environment variables');
    console.error('Please set these in your .env.local file');
    process.exit(1);
  }

  // Connect to Base chain
  const provider = new ethers.JsonRpcProvider(providerUrl);
  
  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading'
  });

  try {
    console.log('🔄 Starting ETH price population from Chainlink...');
    
    // Get current ETH price from Chainlink
    const currentPrice = await getETHPriceFromChainlink(provider, proxyAddress);
    console.log(`💰 Current ETH price: $${currentPrice.toFixed(2)}`);
    
    // Generate minute-by-minute prices for the past hour
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    console.log('📊 Generating minute-by-minute price data...');
    
    const client = await pool.connect();
    let insertedCount = 0;
    
    try {
      // Generate a price point for every minute in the past hour
      let currentTime = new Date(oneHourAgo);
      
      while (currentTime <= now) {
        // Add some small random variation to simulate real price movement
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const minutePrice = currentPrice * (1 + variation);
        
        // Round to 2 decimal places
        const roundedPrice = Math.round(minutePrice * 100) / 100;
        
        // Insert into database
        await client.query(
          `INSERT INTO price_history (token_symbol, price_usd, timestamp, source) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (token_symbol, timestamp) DO NOTHING`,
          ['ETH', roundedPrice, currentTime, 'chainlink_simulated']
        );
        
        insertedCount++;
        
        // Move to next minute
        currentTime = new Date(currentTime.getTime() + 60 * 1000);
      }
      
      console.log(`✅ Successfully inserted ${insertedCount} price points for ETH`);
      console.log(`📅 Time range: ${oneHourAgo.toLocaleString()} to ${now.toLocaleString()}`);
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error populating ETH prices:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
