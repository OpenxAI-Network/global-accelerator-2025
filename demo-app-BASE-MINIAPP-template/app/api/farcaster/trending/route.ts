import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    console.log(`🔍 Fetching ETH-only trending data for MVP testing...`);

    // For MVP testing, ONLY return ETH data from our local database
    const client = await pool.connect();
    
    try {
      // Get ETH mentions count
      const ethMentionsResult = await client.query(`
        SELECT COUNT(*) as count FROM token_mentions WHERE token_symbol = 'ETH'
      `);
      
      const ethMentionsCount = ethMentionsResult.rows[0].count;
      
      // Get ETH casts count
      const ethCastsResult = await client.query(`
        SELECT COUNT(*) as count FROM farcaster_casts
      `);
      
      const ethCastsCount = ethCastsResult.rows[0].count;
      
      // Get sample ETH mention text
      const sampleMentionResult = await client.query(`
        SELECT tm.context, fc.text as cast_text FROM token_mentions tm
        JOIN farcaster_casts fc ON tm.cast_hash = fc.cast_hash
        WHERE tm.token_symbol = 'ETH' 
        ORDER BY tm.created_at DESC 
        LIMIT 1
      `);
      
      const sampleText = sampleMentionResult.rows[0]?.cast_text || 'ETH mentioned in Farcaster';
      
      // Return ETH-only data structure
      const mvpData = {
        analysis: {
          totalCasts: ethCastsCount,
          timeRange: `${days}d`,
          channelsAnalyzed: 1, // Only ETH channel
          totalTokenMentions: ethMentionsCount
        },
        trendingTokens: {
          baseChain: [
            {
              token: 'ETH',
              mentionCount: ethMentionsCount,
              casts: ethCastsCount,
              channels: ['ETH Channel'],
              firstSeen: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
              sampleText: [sampleText],
              onBaseChain: true,
              baseChainInfo: {
                address: '0x0000000000000000000000000000000000000000',
                name: 'Ethereum',
                decimals: 18,
                isStable: false
              }
            }
          ],
          otherChains: []
        },
        topTokens: [
          {
            token: 'ETH',
            mentions: ethMentionsCount,
            onBase: true
          }
        ]
      };
      
      console.log(`✅ Returning ETH-only MVP data: ${ethMentionsCount} mentions, ${ethCastsCount} casts`);
      
      return NextResponse.json({
        success: true,
        data: mvpData,
        source: 'mvp_eth_only'
      });
      
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('MVP trending API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      data: null,
      source: 'error'
    });
  }
}
