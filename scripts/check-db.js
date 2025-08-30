const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vibe_trading',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Vibe Trading AI database status...\n');
    
    // Check database connection
    console.log('✅ Database connection successful');
    
    // Check table counts
    console.log('\n📊 Table Record Counts:');
    console.log('========================');
    
    const tables = [
      { name: 'tokens', description: 'Available trading tokens' },
      { name: 'price_history', description: 'Historical price data' },
      { name: 'farcaster_casts', description: 'Social media posts' },
      { name: 'token_mentions', description: 'AI sentiment analysis' }
    ];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table.name}`);
        const count = parseInt(result.rows[0].count);
        const status = count > 0 ? '✅' : '⚠️';
        console.log(`${status} ${table.name.padEnd(20)}: ${count.toString().padStart(6)} records - ${table.description}`);
      } catch (error) {
        console.log(`❌ ${table.name.padEnd(20)}: ERROR - ${error.message}`);
      }
    }
    
    // Check recent activity
    console.log('\n📈 Recent Activity (Last 24 Hours):');
    console.log('=====================================');
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Recent price updates
    const recentPrices = await client.query(`
      SELECT token_symbol, COUNT(*) as count, 
             MAX(timestamp) as latest,
             MIN(timestamp) as earliest
      FROM price_history 
      WHERE timestamp >= $1
      GROUP BY token_symbol
      ORDER BY count DESC
    `, [oneDayAgo.toISOString()]);
    
    if (recentPrices.rows.length > 0) {
      console.log('\n💰 Price Updates:');
      recentPrices.rows.forEach(row => {
        const timeSinceLatest = Math.round((now - new Date(row.latest)) / (1000 * 60));
        const status = timeSinceLatest <= 5 ? '🟢' : timeSinceLatest <= 15 ? '🟡' : '🔴';
        console.log(`   ${status} ${row.token_symbol}: ${row.count} updates, latest: ${timeSinceLatest} min ago`);
      });
    } else {
      console.log('\n⚠️  No recent price updates found');
    }
    
    // Recent social mentions
    const recentMentions = await client.query(`
      SELECT tm.token_symbol, tm.sentiment, COUNT(*) as count,
             MAX(fc.timestamp) as latest
      FROM token_mentions tm
      JOIN farcaster_casts fc ON tm.cast_id = fc.id
      WHERE fc.timestamp >= $1
      GROUP BY tm.token_symbol, tm.sentiment
      ORDER BY count DESC
    `, [oneDayAgo.toISOString()]);
    
    if (recentMentions.rows.length > 0) {
      console.log('\n🤖 Social Mentions:');
      recentMentions.rows.forEach(row => {
        const timeSinceLatest = Math.round((now - new Date(row.latest)) / (1000 * 60));
        const sentimentIcon = row.sentiment === 'positive' ? '🟢' : row.sentiment === 'negative' ? '🔴' : '⚪';
        console.log(`   ${sentimentIcon} ${row.token_symbol} (${row.sentiment}): ${row.count} mentions, latest: ${timeSinceLatest} min ago`);
      });
    } else {
      console.log('\n⚠️  No recent social mentions found');
    }
    
    // Check data quality
    console.log('\n🔍 Data Quality Check:');
    console.log('======================');
    
    // Check for orphaned records
    const orphanedMentions = await client.query(`
      SELECT COUNT(*) FROM token_mentions tm
      LEFT JOIN farcaster_casts fc ON tm.cast_id = fc.id
      WHERE fc.id IS NULL
    `);
    
    const orphanedCount = parseInt(orphanedMentions.rows[0].count);
    if (orphanedCount > 0) {
      console.log(`⚠️  Orphaned token mentions: ${orphanedCount} (missing cast references)`);
    } else {
      console.log('✅ No orphaned token mentions found');
    }
    
    // Check sentiment distribution
    const sentimentStats = await client.query(`
      SELECT sentiment, COUNT(*) as count,
             ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM token_mentions 
      GROUP BY sentiment
      ORDER BY count DESC
    `);
    
    if (sentimentStats.rows.length > 0) {
      console.log('\n📊 Sentiment Distribution:');
      sentimentStats.rows.forEach(row => {
        const icon = row.sentiment === 'positive' ? '🟢' : row.sentiment === 'negative' ? '🔴' : '⚪';
        console.log(`   ${icon} ${row.sentiment.padEnd(10)}: ${row.count.toString().padStart(4)} (${row.percentage}%)`);
      });
    }
    
    // Check time coverage
    console.log('\n⏰ Data Time Coverage:');
    console.log('=======================');
    
    const timeCoverage = await client.query(`
      SELECT 
        'price_history' as table_name,
        MIN(timestamp) as earliest,
        MAX(timestamp) as latest,
        COUNT(*) as total_records
      FROM price_history
      WHERE token_symbol = 'ETH'
      UNION ALL
      SELECT 
        'farcaster_casts' as table_name,
        MIN(timestamp) as earliest,
        MAX(timestamp) as latest,
        COUNT(*) as total_records
      FROM farcaster_casts
      WHERE text ILIKE '%ETH%' OR text ILIKE '%$ETH%'
    `);
    
    timeCoverage.rows.forEach(row => {
      if (row.earliest && row.latest) {
        const earliest = new Date(row.earliest);
        const latest = new Date(row.latest);
        const hoursCovered = Math.round((latest - earliest) / (1000 * 60 * 60));
        console.log(`   📊 ${row.table_name.padEnd(20)}: ${earliest.toLocaleString()} to ${latest.toLocaleString()} (${hoursCovered}h coverage, ${row.total_records} records)`);
      } else {
        console.log(`   ⚠️  ${row.table_name.padEnd(20)}: No data available`);
      }
    });
    
    // System health summary
    console.log('\n🏥 System Health Summary:');
    console.log('==========================');
    
    const totalRecords = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM tokens) as tokens,
        (SELECT COUNT(*) FROM price_history) as prices,
        (SELECT COUNT(*) FROM farcaster_casts) as casts,
        (SELECT COUNT(*) FROM token_mentions) as mentions
    `);
    
    const stats = totalRecords.rows[0];
    const totalDataPoints = parseInt(stats.prices) + parseInt(stats.casts) + parseInt(stats.mentions);
    
    let healthScore = 0;
    let healthStatus = '🔴';
    
    if (parseInt(stats.tokens) > 0) healthScore += 25;
    if (parseInt(stats.prices) > 100) healthScore += 25;
    if (parseInt(stats.casts) > 50) healthScore += 25;
    if (parseInt(stats.mentions) > 25) healthScore += 25;
    
    if (healthScore >= 90) healthStatus = '🟢';
    else if (healthScore >= 70) healthStatus = '🟡';
    else if (healthScore >= 50) healthStatus = '🟠';
    
    console.log(`   ${healthStatus} Overall Health: ${healthScore}%`);
    console.log(`   📊 Total Data Points: ${totalDataPoints.toLocaleString()}`);
    console.log(`   🪙 Available Tokens: ${stats.tokens}`);
    console.log(`   📈 Price Records: ${stats.prices}`);
    console.log(`   📱 Social Posts: ${stats.casts}`);
    console.log(`   🤖 AI Analyses: ${stats.mentions}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('===================');
    
    if (parseInt(stats.prices) < 100) {
      console.log('   📈 Run: npm run populate-eth-prices');
    }
    
    if (parseInt(stats.casts) < 50) {
      console.log('   📱 Run: npm run pull-eth-data');
    }
    
    if (parseInt(stats.mentions) < 25) {
      console.log('   🤖 Run: npm run sync-mentions-prices');
    }
    
    if (healthScore >= 90) {
      console.log('   🎉 System is healthy! All components are working properly.');
    } else if (healthScore >= 70) {
      console.log('   ⚠️  System needs attention. Some components may need data population.');
    } else {
      console.log('   🔴 System needs immediate attention. Run the setup scripts.');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if this script is called directly
if (require.main === module) {
  checkDatabase()
    .catch(console.error)
    .finally(() => process.exit(0));
}

module.exports = { checkDatabase };
