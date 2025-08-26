import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

// Simplified token definitions for our clean schema
const BASE_TOKENS: Record<string, { name: string; address: string; isStable: boolean; basePrice?: number; decimals: number }> = {
  ETH: { name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', isStable: false, decimals: 18 },
  WETH: { name: 'Wrapped Ethereum', address: '0x4200000000000000000000000000000000000006', isStable: false, decimals: 18 },
  WBTC: { name: 'Wrapped Bitcoin', address: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', isStable: false, decimals: 8 },
  DAI: { name: 'Dai', address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', isStable: true, basePrice: 1.00, decimals: 18 },
  USDC: { name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', isStable: true, basePrice: 1.00, decimals: 6 }
};

async function cachePrice(token: string, price: number, source: string) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO price_history (token_symbol, price_usd, timestamp, source) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) ON CONFLICT (token_symbol, timestamp) DO NOTHING',
      [token, price, source]
    );
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = (searchParams.get('token') || 'ETH').toUpperCase();

  if (!BASE_TOKENS[token]) {
    return NextResponse.json({ success: false, error: `Token ${token} not supported` }, { status: 404 });
  }

  const tokenInfo = BASE_TOKENS[token];

  // For stablecoins, return fixed price
  if (tokenInfo.isStable && tokenInfo.basePrice) {
    const result = {
      success: true,
      data: {
        token,
        address: tokenInfo.address,
        name: tokenInfo.name,
        price: tokenInfo.basePrice,
        decimals: tokenInfo.decimals,
        isStable: true,
        chain: 'Base',
        lastUpdated: new Date().toISOString(),
        source: 'stablecoin'
      }
    } as const;
    
    // Cache the stable price
    await cachePrice(token, tokenInfo.basePrice, 'stable');
    return NextResponse.json(result);
  }

  // For non-stablecoins, try to get from our price_history table first
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT price_usd, timestamp FROM price_history WHERE token_symbol = $1 ORDER BY timestamp DESC LIMIT 1',
      [token]
    );
    
    if (result.rows.length > 0) {
      const { price_usd, timestamp } = result.rows[0];
      return NextResponse.json({
        success: true,
        data: {
          token,
          address: tokenInfo.address,
          name: tokenInfo.name,
          price: parseFloat(price_usd),
          decimals: tokenInfo.decimals,
          isStable: false,
          chain: 'Base',
          lastUpdated: timestamp,
          source: 'database'
        }
      });
    }
  } finally {
    client.release();
  }

  // Fallback: return token info without price
  return NextResponse.json({
    success: true,
    data: {
      token,
      address: tokenInfo.address,
      name: tokenInfo.name,
      price: null,
      decimals: tokenInfo.decimals,
      isStable: false,
      chain: 'Base',
      lastUpdated: new Date().toISOString(),
      source: 'unknown'
    }
  });
}
