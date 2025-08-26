#!/usr/bin/env node
// Minimal: use Farcaster public search-casts to find "$ETH" in last N hours and store with minute-level ETH/USD price
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });
const { Pool } = require('pg');
const { ethers } = require('ethers');

const SEARCH_URL = 'https://api.farcaster.xyz/v2/search-casts';

function toMs(ts){
  if (typeof ts === 'number') {
    // If timestamp is already in milliseconds (13 digits), return as is
    if (ts > 1e12) return ts;
    // If timestamp is in seconds (10 digits), convert to milliseconds
    return ts * 1000;
  }
  if (/^\d+$/.test(String(ts))) { 
    const n = Number(ts); 
    // If timestamp is already in milliseconds (13 digits), return as is
    if (n > 1e12) return n;
    // If timestamp is in seconds (10 digits), convert to milliseconds
    return n * 1000; 
  }
  const ms = Date.parse(ts); 
  return isNaN(ms) ? 0 : ms;
}

async function fetchSearchPaged(q, pages=3, pageSize=100){
  let all=[]; let cursor=null;
  for(let i=0;i<pages;i++){
    const u = new URL(SEARCH_URL);
    u.searchParams.set('q', q);
    u.searchParams.set('limit', String(pageSize));
    if (cursor) u.searchParams.set('cursor', cursor);
    const res = await fetch(u.toString(), { headers: { 'user-agent': 'miniapp/1.0' }});
    if(!res.ok) break;
    const j = await res.json();
    const casts = j.result?.casts || [];
    all.push(...casts);
    cursor = j.next?.cursor || j.result?.next?.cursor || null;
    if (!cursor || casts.length === 0) break;
  }
  return all;
}

async function getPriceAtOrBefore(provider, proxy, targetSec){
  const abi = [
    'function decimals() view returns(uint8)',
    'function latestRoundData() view returns(uint80,int256,uint256,uint256,uint80)',
    'function getRoundData(uint80) view returns(uint80,int256,uint256,uint256,uint80)'
  ];
  const feed = new ethers.Contract(proxy, abi, provider);
  const d = Number(await feed.decimals());
  let rd = await feed.latestRoundData();
  let roundId = rd[0];
  let updated = Number(rd[3]);
  let safety = 0;
  while (updated > targetSec && roundId > 0n && safety < 8000){
    roundId = roundId - 1n;
    rd = await feed.getRoundData(roundId);
    updated = Number(rd[3]);
    safety++;
  }
  return Number(rd[1]) / 10**d;
}

async function main(){
  const providerUrl = process.env.BASE_RPC_URL;
  const proxy = process.env.CHAINLINK_BASE_ETH_USD;
  if (!providerUrl || !proxy){ console.error('Missing BASE_RPC_URL or CHAINLINK_BASE_ETH_USD'); process.exit(1); }
  const hours = parseInt(process.env.SNAP_HOURS || '24');
  const cutoffMs = Date.now() - hours*60*60*1000;

  const maxPages = parseInt(process.env.SNAP_MAX_PAGES || '4');
  const pageSize = parseInt(process.env.SNAP_PAGE_SIZE || '100');
  const results = await fetchSearchPaged('$ETH', maxPages, pageSize);
  const ethCasts = results.filter(c=> c?.text && /\$ETH\b/i.test(c.text) && toMs(c.timestamp)>=cutoffMs);
  console.log(`$ETH matches (Farcaster free search, last ${hours}h): ${ethCasts.length}`);
  
  // Debug: Show sample timestamps
  if (ethCasts.length > 0) {
    console.log('🔍 Sample timestamps from API:');
    ethCasts.slice(0, 3).forEach((cast, index) => {
      console.log(`  ${index + 1}. Original: ${cast.timestamp}, Converted: ${toMs(cast.timestamp)}, Date: ${new Date(toMs(cast.timestamp))}`);
    });
  }
  
  if (ethCasts.length===0){ process.exit(0); }

  const provider = new ethers.JsonRpcProvider(providerUrl);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading' });
  const db = await pool.connect();
  let storedP=0, storedC=0;
  try{
    for (const cast of ethCasts){
      const tsMs = toMs(cast.timestamp);
      const bucketMs = Math.round(tsMs/60000)*60000; // nearest minute
      const bucketSec = Math.floor(bucketMs/1000);
      const price = await getPriceAtOrBefore(provider, proxy, bucketSec);
      const bucket = new Date(bucketMs);
      await db.query(`INSERT INTO price_history (token_symbol, price_usd, timestamp, source) VALUES ($1,$2,$3,'farcaster_snap') ON CONFLICT (token_symbol, timestamp) DO NOTHING`, ['ETH', price, bucket]);
      storedP++;
      await db.query(
        `INSERT INTO farcaster_casts (cast_hash, author_fid, author_username, author_display_name, text, timestamp, channel)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (cast_hash) DO NOTHING`,
        [
          cast.hash,
          String(cast.author?.fid||'0'),
          cast.author?.username||'unknown',
          cast.author?.displayName||'Unknown User',
          cast.text,
          new Date(tsMs),
          'FarcasterSearch'
        ]
      );
      await db.query(`INSERT INTO token_mentions (token_symbol, cast_hash, mention_type, context, sentiment) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (token_symbol, cast_hash) DO NOTHING`, ['ETH', cast.hash, 'text', (cast.text||'').substring(0,100), 'neutral']);
      storedC++;
    }
  } finally {
    await db.release(); await pool.end();
  }
  console.log(`Stored prices=${storedP}, casts=${storedC}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });


