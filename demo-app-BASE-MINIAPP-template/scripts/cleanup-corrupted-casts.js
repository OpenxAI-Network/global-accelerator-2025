#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

async function cleanupCorruptedCasts() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking for corrupted Farcaster cast timestamps...');
    
    // Find corrupted timestamps (years > 2100 or < 2000)
    const corruptedResult = await client.query(`
      SELECT id, cast_hash, text, timestamp
      FROM farcaster_casts 
      WHERE EXTRACT(YEAR FROM timestamp) > 2100 
         OR EXTRACT(YEAR FROM timestamp) < 2000
      ORDER BY timestamp DESC
    `);
    
    if (corruptedResult.rows.length === 0) {
      console.log('✅ No corrupted Farcaster cast timestamps found');
      return;
    }
    
    console.log(`❌ Found ${corruptedResult.rows.length} corrupted Farcaster cast records:`);
    corruptedResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.text.substring(0, 50)}... - ${row.timestamp}`);
    });
    
    // Delete corrupted records
    const deleteResult = await client.query(`
      DELETE FROM farcaster_casts 
      WHERE EXTRACT(YEAR FROM timestamp) > 2100 
         OR EXTRACT(YEAR FROM timestamp) < 2000
    `);
    
    console.log(`🗑️  Deleted ${deleteResult.rowCount} corrupted Farcaster cast records`);
    
    // Also delete corresponding token mentions
    const deleteMentionsResult = await client.query(`
      DELETE FROM token_mentions 
      WHERE cast_hash IN (
        SELECT cast_hash FROM farcaster_casts 
        WHERE EXTRACT(YEAR FROM timestamp) > 2100 
           OR EXTRACT(YEAR FROM timestamp) < 2000
      )
    `);
    
    console.log(`🗑️  Deleted ${deleteMentionsResult.rowCount} corresponding token mention records`);
    
    // Verify cleanup
    const verifyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM farcaster_casts 
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
      FROM farcaster_casts
    `);
    
    const stats = validResult.rows[0];
    console.log(`\n📊 Remaining valid Farcaster cast data:`);
    console.log(`   Total records: ${stats.count}`);
    console.log(`   Date range: ${stats.earliest} to ${stats.latest}`);
    
  } catch (error) {
    console.error('❌ Error cleaning up corrupted Farcaster casts:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await cleanupCorruptedCasts();
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
