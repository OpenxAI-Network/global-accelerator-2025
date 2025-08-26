#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

async function cleanupCorruptedPrices() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking for corrupted price data...');
    
    // Find corrupted timestamps (years > 2100 or < 2000)
    const corruptedResult = await client.query(`
      SELECT id, token_symbol, price_usd, timestamp, source
      FROM price_history 
      WHERE EXTRACT(YEAR FROM timestamp) > 2100 
         OR EXTRACT(YEAR FROM timestamp) < 2000
      ORDER BY timestamp DESC
    `);
    
    if (corruptedResult.rows.length === 0) {
      console.log('✅ No corrupted price data found');
      return;
    }
    
    console.log(`❌ Found ${corruptedResult.rows.length} corrupted price records:`);
    corruptedResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.token_symbol} - $${row.price_usd} - ${row.timestamp} (${row.source})`);
    });
    
    // Delete corrupted records
    const deleteResult = await client.query(`
      DELETE FROM price_history 
      WHERE EXTRACT(YEAR FROM timestamp) > 2100 
         OR EXTRACT(YEAR FROM timestamp) < 2000
    `);
    
    console.log(`🗑️  Deleted ${deleteResult.rowCount} corrupted price records`);
    
    // Verify cleanup
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM price_history 
      WHERE EXTRACT(YEAR FROM timestamp) > 2100 
         OR EXTRACT(YEAR FROM timestamp) < 2000
    `);
    
    if (verifyResult.rows[0].count === '0') {
      console.log('✅ Cleanup verified - no corrupted timestamps remain');
    } else {
      console.log(`⚠️  Warning: ${verifyResult.rows[0].count} corrupted records still exist`);
    }
    
    // Show remaining valid data
    const validResult = await client.query(`
      SELECT COUNT(*) as count, 
             MIN(timestamp) as earliest,
             MAX(timestamp) as latest
      FROM price_history
    `);
    
    const stats = validResult.rows[0];
    console.log(`\n📊 Remaining valid price data:`);
    console.log(`   Total records: ${stats.count}`);
    console.log(`   Date range: ${stats.earliest} to ${stats.latest}`);
    
  } catch (error) {
    console.error('❌ Error cleaning up corrupted prices:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await cleanupCorruptedPrices();
    console.log('\n✨ Cleanup completed successfully!');
  } catch (error) {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
