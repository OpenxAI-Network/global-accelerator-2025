interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 100 // Maximum number of cached entries

  set(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes TTL
    // Clean up expired entries
    this.cleanup()
    
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Create a singleton instance
export const aiCache = new SimpleCache()

// Generate cache key from request data
export function generateCacheKey(data: any): string {
  const relevantData = {
    model: data.model || 'llama3.2:3b',
    prompt: data.prompt,
    options: data.options
  }
  return JSON.stringify(relevantData)
}
