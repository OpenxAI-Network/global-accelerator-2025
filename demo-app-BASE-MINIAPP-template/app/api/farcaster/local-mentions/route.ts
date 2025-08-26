import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

// Simple sentiment analysis (same as the main endpoint)
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['bullish', 'moon', 'pump', 'buy', 'long', 'hodl', 'diamond', 'rocket', '🚀', '📈', '💎', 'strong', 'growing', 'amazing', 'love', 'bull', 'dream', 'partnership', 'prolific', 'builder', 'win', 'target', 'bull market', '200k', '10k', '2k', 'close', 'near', 'expecting', 'pump', 'stop', 'next stop'];
  const negativeWords = ['bearish', 'dump', 'sell', 'short', 'crash', 'bear', '📉', '🐻', '💩', 'weak', 'falling', 'terrible', 'hate', 'dump', 'heavy', 'lost', 'crash', 'fall'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || 'ETH';
    const days = parseInt(searchParams.get('days') || '1');
    const hours = parseInt(searchParams.get('hours') || '0');

    // Use hours if provided, otherwise fall back to days
    const timeInterval = hours > 0 ? `${hours} hours` : `${days} days`;

    const client = await pool.connect();
    
    try {
      // Get ETH mentions from our local database
      const result = await client.query(`
        SELECT 
          tm.token_symbol,
          fc.timestamp as timestamp,
          fc.text as cast_text,
          fc.cast_hash as hash,
          fc.author_username,
          fc.author_display_name
        FROM token_mentions tm
        JOIN farcaster_casts fc ON tm.cast_hash = fc.cast_hash
        WHERE tm.token_symbol = $1
        AND fc.timestamp >= NOW() - INTERVAL '${timeInterval}'
        ORDER BY fc.timestamp DESC
      `, [token]);

      if (result.rows.length > 0) {
        const mentions = result.rows.map(row => ({
          hash: row.hash,
          text: row.cast_text || 'No text available',
          author: {
            username: row.author_username || 'unknown',
            displayName: row.author_display_name || 'Unknown User',
            pfp: { url: 'https://via.placeholder.com/40' }
          },
          timestamp: new Date(row.timestamp).toISOString(),
          reactions: {
            likes: 0,
            recasts: 0,
            replies: 0
          },
          sentiment: analyzeSentiment(row.cast_text || '')
        }));

        return NextResponse.json({
          success: true,
          data: mentions,
          token,
          count: mentions.length,
          source: 'local_database'
        });
      } else {
        return NextResponse.json({
          success: true,
          data: [],
          token,
          count: 0,
          source: 'local_database',
          message: `No ${token} mentions found in local database`
        });
      }
      
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Local mentions API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: [],
      count: 0,
      source: 'error'
    });
  }
}
