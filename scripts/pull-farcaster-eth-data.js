const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function pullFarcasterEthData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Pulling Farcaster ETH data...');
    
    // Generate mock Farcaster data for ETH mentions
    const mockCasts = generateMockCasts();
    
    console.log(`📊 Generated ${mockCasts.length} mock Farcaster casts`);
    
    // Insert casts into database
    for (const cast of mockCasts) {
      try {
        const castResult = await client.query(`
          INSERT INTO farcaster_casts (cast_hash, author_fid, author_username, author_display_name, text, timestamp) 
          VALUES ($1, $2, $3, $4, $5, $6) 
          ON CONFLICT (cast_hash) DO NOTHING
          RETURNING id
        `, [cast.cast_hash, cast.author_fid, cast.author_username, cast.author_display_name, cast.text, cast.timestamp]);
        
        // If cast was inserted, add token mention
        if (castResult.rows.length > 0) {
          const castId = castResult.rows[0].id;
          
          // Analyze sentiment using mock AI
          const sentiment = analyzeSentiment(cast.text);
          
          await client.query(`
            INSERT INTO token_mentions (cast_id, token_symbol, sentiment, confidence, ai_model) 
            VALUES ($1, $2, $3, $4, $5)
          `, [castId, 'ETH', sentiment.sentiment, sentiment.confidence, 'mock-ollama']);
        }
      } catch (error) {
        if (error.code !== '23505') { // Ignore unique constraint violations
          console.error('Error inserting cast:', error);
        }
      }
    }
    
    console.log('✅ Farcaster ETH data pulled successfully!');
    
    // Verify the data
    const castCount = await client.query(`
      SELECT COUNT(*) FROM farcaster_casts 
      WHERE text ILIKE '%ETH%' OR text ILIKE '%$ETH%'
    `);
    
    const mentionCount = await client.query(`
      SELECT COUNT(*) FROM token_mentions 
      WHERE token_symbol = 'ETH'
    `);
    
    console.log(`📈 Total ETH-related casts: ${castCount.rows[0].count}`);
    console.log(`🤖 Total ETH sentiment analyses: ${mentionCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error pulling Farcaster ETH data:', error);
    throw error;
  } finally {
    client.release();
  }
}

function generateMockCasts() {
  const mockCasts = [];
  const now = new Date();
  
  // Sample ETH-related posts with realistic content
  const ethPosts = [
    "ETH is looking bullish today! 🚀 The momentum is strong and I'm confident we'll see $4k soon.",
    "Just bought more ETH at this dip. Great entry point for long-term holders 💎",
    "ETH sentiment is very positive right now. Social media is buzzing with excitement!",
    "Watching ETH closely. The technical indicators suggest a breakout is imminent 📊",
    "ETH has been consolidating nicely. Perfect time to accumulate more before the next move up",
    "The ETH ecosystem is growing stronger every day. DeFi, NFTs, and Layer 2s are thriving!",
    "ETH fundamentals remain solid. Institutional adoption continues to increase",
    "Chart analysis shows ETH forming a bullish pennant. Breakout could happen soon!",
    "ETH staking rewards are looking great. Passive income from crypto is amazing",
    "The ETH merge was a game-changer. Now we have deflationary tokenomics!",
    "ETH gas fees are much better with Layer 2s. The network is scaling beautifully",
    "ETH is the backbone of DeFi. No other blockchain comes close to its ecosystem",
    "Just staked my ETH. The yield is incredible and helps secure the network",
    "ETH price action is textbook bullish. Higher highs and higher lows forming",
    "The ETH community is the best in crypto. Developers and users are top-notch",
    "ETH will be the global settlement layer. This is just the beginning!",
    "Watching ETH break through resistance levels. The momentum is building!",
    "ETH has the strongest fundamentals in crypto. Long-term hold for sure",
    "The ETH roadmap is impressive. Continuous improvements and upgrades",
    "ETH is the future of finance. Decentralized, secure, and scalable"
  ];
  
  // Generate casts over the past 24 hours
  for (let i = 0; i < ethPosts.length; i++) {
    const hoursAgo = Math.random() * 24;
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    mockCasts.push({
      cast_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      author_fid: Math.floor(Math.random() * 10000) + 1,
      author_username: `user${Math.floor(Math.random() * 1000)}`,
      author_display_name: `Crypto Trader ${Math.floor(Math.random() * 100)}`,
      text: ethPosts[i],
      timestamp: timestamp.toISOString()
    });
  }
  
  // Add some additional random casts
  for (let i = 0; i < 30; i++) {
    const hoursAgo = Math.random() * 24;
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    const randomTexts = [
      "ETH looking good today! 📈",
      "Bullish on ETH long-term 🚀",
      "ETH is the future of money",
      "Stacking more ETH while I can",
      "ETH ecosystem is unstoppable",
      "ETH price action is beautiful",
      "ETH fundamentals are rock solid",
      "ETH will flip Bitcoin one day",
      "ETH staking is the way to go",
      "ETH Layer 2s are game-changing"
    ];
    
    mockCasts.push({
      cast_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      author_fid: Math.floor(Math.random() * 10000) + 1,
      author_username: `trader${Math.floor(Math.random() * 1000)}`,
      author_display_name: `DeFi User ${Math.floor(Math.random() * 100)}`,
      text: randomTexts[Math.floor(Math.random() * randomTexts.length)],
      timestamp: timestamp.toISOString()
    });
  }
  
  return mockCasts;
}

function analyzeSentiment(text) {
  const positiveWords = ['bullish', 'moon', 'rocket', '🚀', '📈', 'great', 'amazing', 'strong', 'confident', 'excited', 'thriving', 'incredible', 'beautiful', 'solid', 'unstoppable'];
  const negativeWords = ['bearish', 'dump', 'crash', '📉', 'worried', 'scared', 'weak', 'bad', 'terrible', 'crashing', 'falling', 'sinking'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  // Determine sentiment
  let sentiment = 'neutral';
  let confidence = 0.5;
  
  if (positiveScore > negativeScore) {
    sentiment = 'positive';
    confidence = Math.min(0.5 + (positiveScore - negativeScore) * 0.1, 0.95);
  } else if (negativeScore > positiveScore) {
    sentiment = 'negative';
    confidence = Math.min(0.5 + (negativeScore - positiveScore) * 0.1, 0.95);
  }
  
  return { sentiment, confidence };
}

async function startDataCollection() {
  console.log('🚀 Starting continuous Farcaster data collection...');
  console.log('Press Ctrl+C to stop');
  
  // Collect data every 15 minutes
  const interval = setInterval(async () => {
    try {
      await pullFarcasterEthData();
    } catch (error) {
      console.error('Error in data collection:', error);
    }
  }, 15 * 60 * 1000); // Every 15 minutes
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping data collection...');
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
    startDataCollection();
    break;
  default:
    pullFarcasterEthData()
      .then(() => process.exit(0))
      .catch(console.error);
}

module.exports = { pullFarcasterEthData, startDataCollection };
