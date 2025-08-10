import { Pool, type PoolClient } from "pg"
import { logger } from "../utils/logger"

export class DatabaseService {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on("error", (err) => {
      logger.error("Unexpected error on idle client", err)
    })
  }

  async initialize(): Promise<void> {
    try {
      const client = await this.pool.connect()
      await client.query("SELECT NOW()")
      client.release()
      logger.info("Database connection established")
    } catch (error) {
      logger.error("Database connection failed:", error)
      throw error
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now()
    try {
      const res = await this.pool.query(text, params)
      const duration = Date.now() - start
      logger.debug("Executed query", { text, duration, rows: res.rowCount })
      return res
    } catch (error) {
      logger.error("Query error:", { text, error })
      throw error
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect()
  }

  async close(): Promise<void> {
    await this.pool.end()
    logger.info("Database connection closed")
  }

  // User operations
  async createUser(walletAddress: string, username?: string, email?: string): Promise<any> {
    const query = `
      INSERT INTO users (wallet_address, username, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (wallet_address) DO UPDATE SET
        username = COALESCE($2, users.username),
        email = COALESCE($3, users.email),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    const result = await this.query(query, [walletAddress, username, email])
    return result.rows[0]
  }

  async getUserByWallet(walletAddress: string): Promise<any> {
    const query = "SELECT * FROM users WHERE wallet_address = $1"
    const result = await this.query(query, [walletAddress])
    return result.rows[0]
  }

  async updateUserPreferences(walletAddress: string, preferences: any): Promise<any> {
    const query = `
      UPDATE users SET preferences = $2, updated_at = CURRENT_TIMESTAMP
      WHERE wallet_address = $1
      RETURNING *
    `
    const result = await this.query(query, [walletAddress, JSON.stringify(preferences)])
    return result.rows[0]
  }

  // AI Predictions
  async savePrediction(prediction: any): Promise<any> {
    const query = `
      INSERT INTO ai_predictions (
        prediction_id, asset, prediction_type, current_price, predicted_price,
        predicted_change, confidence, timeframe, reasoning, model_version, arweave_hash, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `
    const result = await this.query(query, [
      prediction.prediction_id,
      prediction.asset,
      prediction.prediction_type,
      prediction.current_price,
      prediction.predicted_price,
      prediction.predicted_change,
      prediction.confidence,
      prediction.timeframe,
      prediction.reasoning,
      prediction.model_version,
      prediction.arweave_hash,
      prediction.expires_at,
    ])
    return result.rows[0]
  }

  async getPredictions(asset?: string, limit = 50): Promise<any[]> {
    let query = `
      SELECT * FROM ai_predictions
      WHERE expires_at > CURRENT_TIMESTAMP
    `
    const params: any[] = []

    if (asset) {
      query += " AND asset = $1"
      params.push(asset)
    }

    query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1)
    params.push(limit)

    const result = await this.query(query, params)
    return result.rows
  }

  // Fraud Detection
  async saveFraudScan(scan: any): Promise<any> {
    const query = `
      INSERT INTO fraud_logs (
        scan_id, wallet_address, risk_level, safety_score,
        risk_factors, behavioral_analysis, transaction_summary, arweave_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const result = await this.query(query, [
      scan.scan_id,
      scan.wallet_address,
      scan.risk_level,
      scan.safety_score,
      JSON.stringify(scan.risk_factors),
      JSON.stringify(scan.behavioral_analysis),
      JSON.stringify(scan.transaction_summary),
      scan.arweave_hash,
    ])
    return result.rows[0]
  }

  async getFraudScans(walletAddress?: string, limit = 50): Promise<any[]> {
    let query = "SELECT * FROM fraud_logs"
    const params: any[] = []

    if (walletAddress) {
      query += " WHERE wallet_address = $1"
      params.push(walletAddress)
    }

    query += " ORDER BY created_at DESC LIMIT $" + (params.length + 1)
    params.push(limit)

    const result = await this.query(query, params)
    return result.rows
  }

  // Market Data
  async saveMarketData(data: any): Promise<any> {
    const query = `
      INSERT INTO market_data (symbol, price, volume, market_cap, change_24h, sentiment_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (symbol, timestamp) DO UPDATE SET
        price = $2, volume = $3, market_cap = $4, change_24h = $5, sentiment_score = $6
      RETURNING *
    `
    const result = await this.query(query, [
      data.symbol,
      data.price,
      data.volume,
      data.market_cap,
      data.change_24h,
      data.sentiment_score,
    ])
    return result.rows[0]
  }

  async getMarketData(symbol?: string, hours = 24): Promise<any[]> {
    let query = `
      SELECT * FROM market_data
      WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
    `
    const params: any[] = []

    if (symbol) {
      query += " AND symbol = $1"
      params.push(symbol)
    }

    query += " ORDER BY timestamp DESC"

    const result = await this.query(query, params)
    return result.rows
  }

  // DeFi Pools
  async saveDeFiPool(pool: any): Promise<any> {
    const query = `
      INSERT INTO defi_pools (
        pool_id, protocol, asset, apy, tvl, risk_level, ai_score,
        features, min_deposit, lock_period, fees, contract_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (pool_id) DO UPDATE SET
        apy = $4, tvl = $5, ai_score = $7, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    const result = await this.query(query, [
      pool.pool_id,
      pool.protocol,
      pool.asset,
      pool.apy,
      pool.tvl,
      pool.risk_level,
      pool.ai_score,
      JSON.stringify(pool.features),
      pool.min_deposit,
      pool.lock_period,
      pool.fees,
      pool.contract_address,
    ])
    return result.rows[0]
  }

  async getDeFiPools(): Promise<any[]> {
    const query = "SELECT * FROM defi_pools ORDER BY ai_score DESC, apy DESC"
    const result = await this.query(query)
    return result.rows
  }

  // User Positions
  async saveUserPosition(position: any): Promise<any> {
    const query = `
      INSERT INTO user_positions (user_id, pool_id, amount, entry_price, current_value)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, pool_id) DO UPDATE SET
        amount = user_positions.amount + $3,
        current_value = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    const result = await this.query(query, [
      position.user_id,
      position.pool_id,
      position.amount,
      position.entry_price,
      position.current_value,
    ])
    return result.rows[0]
  }

  async getUserPositions(userId: number): Promise<any[]> {
    const query = `
      SELECT up.*, dp.protocol, dp.asset, dp.apy
      FROM user_positions up
      JOIN defi_pools dp ON up.pool_id = dp.pool_id
      WHERE up.user_id = $1
      ORDER BY up.current_value DESC
    `
    const result = await this.query(query, [userId])
    return result.rows
  }

  // Memory Vault
  async saveMemory(memory: any): Promise<any> {
    const query = `
      INSERT INTO memory_vault (
        memory_id, memory_type, title, description, performance,
        confidence, outcome, arweave_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const result = await this.query(query, [
      memory.memory_id,
      memory.memory_type,
      memory.title,
      memory.description,
      memory.performance,
      memory.confidence,
      memory.outcome,
      memory.arweave_hash,
    ])
    return result.rows[0]
  }

  async getMemories(limit = 50): Promise<any[]> {
    const query = "SELECT * FROM memory_vault ORDER BY created_at DESC LIMIT $1"
    const result = await this.query(query, [limit])
    return result.rows
  }

  // Trading Bots
  async saveTradingBot(bot: any): Promise<any> {
    const query = `
      INSERT INTO trading_bots (
        bot_id, user_id, name, strategy, risk_level, config,
        total_invested, current_value
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const result = await this.query(query, [
      bot.bot_id,
      bot.user_id,
      bot.name,
      bot.strategy,
      bot.risk_level,
      JSON.stringify(bot.config),
      bot.total_invested,
      bot.current_value,
    ])
    return result.rows[0]
  }

  async getTradingBots(userId: number): Promise<any[]> {
    const query = "SELECT * FROM trading_bots WHERE user_id = $1 ORDER BY created_at DESC"
    const result = await this.query(query, [userId])
    return result.rows
  }

  async updateTradingBot(botId: string, updates: any): Promise<any> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")
    const query = `
      UPDATE trading_bots SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE bot_id = $1
      RETURNING *
    `
    const result = await this.query(query, [botId, ...Object.values(updates)])
    return result.rows[0]
  }

  // Bot Trades
  async saveBotTrade(trade: any): Promise<any> {
    const query = `
      INSERT INTO bot_trades (
        trade_id, bot_id, asset, trade_type, amount, price, profit_loss, tx_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const result = await this.query(query, [
      trade.trade_id,
      trade.bot_id,
      trade.asset,
      trade.trade_type,
      trade.amount,
      trade.price,
      trade.profit_loss,
      trade.tx_hash,
    ])
    return result.rows[0]
  }

  async getBotTrades(botId: string, limit = 100): Promise<any[]> {
    const query = `
      SELECT * FROM bot_trades
      WHERE bot_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `
    const result = await this.query(query, [botId, limit])
    return result.rows
  }

  // API Sessions
  async createSession(sessionId: string, userId: number, walletAddress: string, expiresAt: Date): Promise<any> {
    const query = `
      INSERT INTO api_sessions (session_id, user_id, wallet_address, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const result = await this.query(query, [sessionId, userId, walletAddress, expiresAt])
    return result.rows[0]
  }

  async getSession(sessionId: string): Promise<any> {
    const query = `
      SELECT s.*, u.wallet_address, u.username
      FROM api_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_id = $1 AND s.expires_at > CURRENT_TIMESTAMP
    `
    const result = await this.query(query, [sessionId])
    return result.rows[0]
  }

  async deleteSession(sessionId: string): Promise<void> {
    const query = "DELETE FROM api_sessions WHERE session_id = $1"
    await this.query(query, [sessionId])
  }

  async cleanupExpiredSessions(): Promise<void> {
    const query = "DELETE FROM api_sessions WHERE expires_at < CURRENT_TIMESTAMP"
    await this.query(query)
  }
}
