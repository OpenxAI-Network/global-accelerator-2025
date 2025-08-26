import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
});

const CHAINLINK_SLUGS: Record<string, string> = {
	ETH: 'feeds/base/base/eth-usd',
	WETH: 'feeds/base/base/eth-usd',
	WBTC: 'feeds/base/base/btc-usd',
	DAI: '',
	USDC: '',
};

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const token = (searchParams.get('token') || 'ETH').toUpperCase();
	const hours = Math.max(1, parseInt(searchParams.get('hours') || '24'));
	const now = new Date();
	const from = new Date(now.getTime() - hours * 60 * 60 * 1000);

	const client = await pool.connect();
	try {
		// Pull existing minute data from our clean schema
		const rows = await client.query(
			`SELECT price_usd as price, timestamp FROM price_history WHERE token_symbol = $1 AND timestamp >= $2 ORDER BY timestamp ASC`,
			[token, from]
		);
		let points = rows.rows.map(r => ({ price: parseFloat(r.price), timestamp: new Date(r.timestamp) }));

		// Identify missing minute stamps at :00 seconds
		const missing: Date[] = [];
		let cursor = new Date(from);
		cursor.setSeconds(0, 0);
		const existing = new Set(points.map(p => p.timestamp.toISOString()));
		while (cursor <= now) {
			const key = cursor.toISOString();
			if (!existing.has(key)) missing.push(new Date(cursor));
			cursor = new Date(cursor.getTime() + 60 * 1000);
		}

		console.log(`📊 Returning ${points.length} price points for ${token} from local database`);

		points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
		return NextResponse.json({ success: true, data: points });
	} catch (e: any) {
		return NextResponse.json({ success: false, error: e?.message || 'failed' }, { status: 500 });
	} finally {
		client.release();
	}
}
