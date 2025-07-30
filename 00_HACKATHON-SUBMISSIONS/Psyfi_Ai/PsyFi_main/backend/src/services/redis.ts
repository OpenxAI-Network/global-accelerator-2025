import { createClient, type RedisClientType } from "redis"
import { logger } from "../utils/logger"

export class RedisService {
  private client: RedisClientType

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      retry_delay_on_failover: 100,
      retry_delay_on_cluster_down: 300,
      max_attempts: 3,
    })

    this.client.on("error", (err) => {
      logger.error("Redis Client Error:", err)
    })

    this.client.on("connect", () => {
      logger.info("Redis Client Connected")
    })

    this.client.on("ready", () => {
      logger.info("Redis Client Ready")
    })

    this.client.on("end", () => {
      logger.info("Redis Client Disconnected")
    })
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect()
      await this.client.ping()
      logger.info("Redis connection established")
    } catch (error) {
      logger.error("Redis connection failed:", error)
      throw error
    }
  }

  async close(): Promise<void> {
    await this.client.quit()
    logger.info("Redis connection closed")
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key)
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value)
      } else {
        await this.client.set(key, value)
      }
      return true
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error)
      return false
    }
  }

  // JSON operations
  async setJSON(key: string, value: any, ttl?: number): Promise<boolean> {
    return this.set(key, JSON.stringify(value), ttl)
  }

  async getJSON(key: string): Promise<any | null> {
    const value = await this.get(key)
    if (!value) return null

    try {
      return JSON.parse(value)
    } catch (error) {
      logger.error(`JSON parse error for key ${key}:`, error)
      return null
    }
  }

  // Hash operations
  async hSet(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hSet(key, field, value)
      return true
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}, field ${field}:`, error)
      return false
    }
  }

  async hGet(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(key, field)
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}, field ${field}:`, error)
      return null
    }
  }

  async hGetAll(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hGetAll(key)
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error)
      return null
    }
  }

  // List operations
  async lPush(key: string, value: string): Promise<boolean> {
    try {
      await this.client.lPush(key, value)
      return true
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error)
      return false
    }
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop)
    } catch (error) {
      logger.error(`Redis LRANGE error for key ${key}:`, error)
      return []
    }
  }

  async lTrim(key: string, start: number, stop: number): Promise<boolean> {
    try {
      await this.client.lTrim(key, start, stop)
      return true
    } catch (error) {
      logger.error(`Redis LTRIM error for key ${key}:`, error)
      return false
    }
  }

  // Set operations
  async sAdd(key: string, member: string): Promise<boolean> {
    try {
      await this.client.sAdd(key, member)
      return true
    } catch (error) {
      logger.error(`Redis SADD error for key ${key}:`, error)
      return false
    }
  }

  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key)
    } catch (error) {
      logger.error(`Redis SMEMBERS error for key ${key}:`, error)
      return []
    }
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    try {
      return await this.client.sIsMember(key, member)
    } catch (error) {
      logger.error(`Redis SISMEMBER error for key ${key}:`, error)
      return false
    }
  }

  // Sorted set operations
  async zAdd(key: string, score: number, member: string): Promise<boolean> {
    try {
      await this.client.zAdd(key, { score, value: member })
      return true
    } catch (error) {
      logger.error(`Redis ZADD error for key ${key}:`, error)
      return false
    }
  }

  async zRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zRange(key, start, stop)
    } catch (error) {
      logger.error(`Redis ZRANGE error for key ${key}:`, error)
      return []
    }
  }

  async zRevRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zRevRange(key, start, stop)
    } catch (error) {
      logger.error(`Redis ZREVRANGE error for key ${key}:`, error)
      return []
    }
  }

  // Cache helpers
  async cacheMarketData(symbol: string, data: any, ttl = 300): Promise<boolean> {
    return this.setJSON(`market:${symbol}`, data, ttl)
  }

  async getCachedMarketData(symbol: string): Promise<any | null> {
    return this.getJSON(`market:${symbol}`)
  }

  async cachePrediction(predictionId: string, data: any, ttl = 3600): Promise<boolean> {
    return this.setJSON(`prediction:${predictionId}`, data, ttl)
  }

  async getCachedPrediction(predictionId: string): Promise<any | null> {
    return this.getJSON(`prediction:${predictionId}`)
  }

  async cacheUserSession(sessionId: string, userData: any, ttl = 86400): Promise<boolean> {
    return this.setJSON(`session:${sessionId}`, userData, ttl)
  }

  async getCachedUserSession(sessionId: string): Promise<any | null> {
    return this.getJSON(`session:${sessionId}`)
  }

  async invalidateUserSession(sessionId: string): Promise<boolean> {
    return this.del(`session:${sessionId}`)
  }

  // Rate limiting
  async incrementRateLimit(key: string, window = 3600): Promise<number> {
    try {
      const current = await this.client.incr(key)
      if (current === 1) {
        await this.client.expire(key, window)
      }
      return current
    } catch (error) {
      logger.error(`Rate limit increment error for key ${key}:`, error)
      return 0
    }
  }

  async getRateLimit(key: string): Promise<number> {
    try {
      const value = await this.get(key)
      return value ? Number.parseInt(value, 10) : 0
    } catch (error) {
      logger.error(`Rate limit get error for key ${key}:`, error)
      return 0
    }
  }

  // Pub/Sub
  async publish(channel: string, message: string): Promise<boolean> {
    try {
      await this.client.publish(channel, message)
      return true
    } catch (error) {
      logger.error(`Redis PUBLISH error for channel ${channel}:`, error)
      return false
    }
  }

  async publishJSON(channel: string, data: any): Promise<boolean> {
    return this.publish(channel, JSON.stringify(data))
  }

  // Cleanup operations
  async cleanup(): Promise<void> {
    try {
      // Clean up expired keys
      const expiredKeys = await this.client.keys("*:expired:*")
      if (expiredKeys.length > 0) {
        await this.client.del(expiredKeys)
        logger.info(`Cleaned up ${expiredKeys.length} expired keys`)
      }
    } catch (error) {
      logger.error("Redis cleanup error:", error)
    }
  }
}
