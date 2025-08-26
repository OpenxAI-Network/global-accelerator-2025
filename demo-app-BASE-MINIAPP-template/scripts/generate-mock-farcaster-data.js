#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

async function generateMockFarcasterData() {
  const client = await pool.connect();
  try {
    console.log('🎭 Generating mock Farcaster data...');
    
    // Mock Farcaster casts with realistic content and timestamps spanning 24 hours
    const mockCasts = [
      {
        hash: '0x1234567890abcdef1234567890abcdef12345678',
        author: { fid: '12345', username: 'crypto_whale', displayName: 'Crypto Whale' },
        text: 'Just bought another 100 $ETH! This is the accumulation phase 🚀',
        timestamp: new Date('2025-08-19T00:00:00.000Z'), // 12:00 AM UTC on Aug 19
        sentiment: 'positive'
      },
      {
        hash: '0x2345678901bcdef12345678901bcdef123456789',
        author: { fid: '23456', username: 'defi_deg', displayName: 'DeFi Deg' },
        text: '$ETH looking bearish today. Might be time to short 📉',
        timestamp: new Date('2025-08-19T03:00:00.000Z'), // 3:00 AM UTC on Aug 19
        sentiment: 'negative'
      },
      {
        hash: '0x3456789012cdef123456789012cdef1234567890',
        author: { fid: '34567', username: 'eth_maxi', displayName: 'ETH Maxi' },
        text: 'Holding $ETH for the long term. Diamond hands 💎',
        timestamp: new Date('2025-08-19T06:00:00.000Z'), // 6:00 AM UTC on Aug 19
        sentiment: 'neutral'
      },
      {
        hash: '0x4567890123def1234567890123def12345678901',
        author: { fid: '45678', username: 'trading_pro', displayName: 'Trading Pro' },
        text: '$ETH breaking out of the consolidation pattern! Bullish AF 🐂',
        timestamp: new Date('2025-08-19T09:00:00.000Z'), // 9:00 AM UTC on Aug 19
        sentiment: 'positive'
      },
      {
        hash: '0x5678901234ef12345678901234ef123456789012',
        author: { fid: '56789', username: 'crypto_news', displayName: 'Crypto News' },
        text: 'BlackRock adds more $ETH to their portfolio. Institutional adoption continues 📈',
        timestamp: new Date('2025-08-19T12:00:00.000Z'), // 12:00 PM UTC on Aug 19
        sentiment: 'positive'
      },
      {
        hash: '0x6789012345f123456789012345f1234567890123',
        author: { fid: '67890', username: 'bear_market', displayName: 'Bear Market' },
        text: '$ETH will dump to $2000. This bubble is bursting 💥',
        timestamp: new Date('2025-08-19T15:00:00.000Z'), // 3:00 PM UTC on Aug 19
        sentiment: 'negative'
      },
      {
        hash: '0x7890123456123456789012345612345678901234',
        author: { fid: '78901', username: 'tech_analyst', displayName: 'Tech Analyst' },
        text: 'Ethereum fundamentals remain strong despite market volatility 🔬',
        timestamp: new Date('2025-08-19T18:00:00.000Z'), // 6:00 PM UTC on Aug 19
        sentiment: 'neutral'
      },
      {
        hash: '0x8901234567234567890123456723456789012345',
        author: { fid: '89012', username: 'yield_farmer', displayName: 'Yield Farmer' },
        text: 'Staking $ETH for 5% APY. Passive income is the way 🧑‍🌾',
        timestamp: new Date('2025-08-19T21:00:00.000Z'), // 9:00 PM UTC on Aug 19
        sentiment: 'positive'
      },
      {
        hash: '0x9012345678345678901234567834567890123456',
        author: { fid: '90123', username: 'fud_spreader', displayName: 'FUD Spreader' },
        text: '$ETH is centralized garbage. Bitcoin is the only true crypto ⚡',
        timestamp: new Date('2025-08-19T22:30:00.000Z'), // 10:30 PM UTC on Aug 19
        sentiment: 'negative'
      },
      {
        hash: '0xa0123456789456789012345678945678901234567',
        author: { fid: 'a0123', username: 'defi_builder', displayName: 'DeFi Builder' },
        text: 'Building the future of finance on $ETH. Smart contracts are revolutionary 🏗️',
        timestamp: new Date('2025-08-19T23:45:00.000Z'), // 11:45 PM UTC on Aug 19
        sentiment: 'positive'
      }
    ];
    
    console.log(`📝 Generated ${mockCasts.length} mock casts`);
    
    let storedCasts = 0;
    let storedMentions = 0;
    
    for (const cast of mockCasts) {
      try {
        // Insert Farcaster cast
        await client.query(`
          INSERT INTO farcaster_casts (cast_hash, author_fid, author_username, author_display_name, text, timestamp, channel)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (cast_hash) DO NOTHING
        `, [
          cast.hash,
          cast.author.fid,
          cast.author.username,
          cast.author.displayName,
          cast.text,
          cast.timestamp,
          'MockData'
        ]);
        
        if (client.query.rowCount > 0) {
          storedCasts++;
        }
        
        // Insert token mention
        await client.query(`
          INSERT INTO token_mentions (token_symbol, cast_hash, mention_type, context, sentiment)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (token_symbol, cast_hash) DO NOTHING
        `, [
          'ETH',
          cast.hash,
          'text',
          cast.text.substring(0, 100),
          cast.sentiment
        ]);
        
        if (client.query.rowCount > 0) {
          storedMentions++;
        }
        
      } catch (error) {
        console.error(`❌ Error storing cast ${cast.hash}:`, error);
      }
    }
    
    console.log(`✅ Stored ${storedCasts} casts and ${storedMentions} mentions`);
    
    // Verify the data
    const verifyResult = await client.query(`
      SELECT 
        COUNT(*) as total_casts,
        COUNT(DISTINCT tm.cast_hash) as total_mentions
      FROM farcaster_casts fc
      LEFT JOIN token_mentions tm ON fc.cast_hash = tm.cast_hash
      WHERE fc.channel = 'MockData'
    `);
    
    const stats = verifyResult.rows[0];
    console.log(`\n📊 Verification:`);
    console.log(`   Total casts: ${stats.total_casts}`);
    console.log(`   Total mentions: ${stats.total_mentions}`);
    
  } catch (error) {
    console.error('❌ Error generating mock data:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await generateMockFarcasterData();
    console.log('\n✨ Mock data generation completed successfully!');
  } catch (error) {
    console.error('\n💥 Mock data generation failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
