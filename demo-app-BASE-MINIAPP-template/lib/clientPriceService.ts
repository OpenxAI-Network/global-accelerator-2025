export interface PriceData {
  price: number;
  lastUpdated: Date;
  isStale: boolean;
  source?: string;
}

export interface PriceHistoryPoint {
  price: number;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source?: string;
  warning?: string;
  error?: string;
}

class ClientPriceService {
  private static instance: ClientPriceService;
  private cache: Map<string, { data: PriceData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  private constructor() {}

  static getInstance(): ClientPriceService {
    if (!ClientPriceService.instance) {
      ClientPriceService.instance = new ClientPriceService();
    }
    return ClientPriceService.instance;
  }

  async getPrice(tokenSymbol: string): Promise<PriceData> {
    const cacheKey = `price_${tokenSymbol}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Check client-side cache first
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`/api/base-price?token=${tokenSymbol}`);
      const result: ApiResponse<PriceData> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch price');
      }

      // Parse the date string back to Date object
      const priceData: PriceData = {
        ...result.data,
        lastUpdated: new Date(result.data.lastUpdated)
      };

      // Cache the result
      this.cache.set(cacheKey, { data: priceData, timestamp: now });

      return priceData;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  async getPriceHistory(tokenSymbol: string, hours: number = 24): Promise<PriceHistoryPoint[]> {
    try {
      const response = await fetch(`/api/price-history?token=${tokenSymbol}&hours=${hours}`);
      const result: ApiResponse<PriceHistoryPoint[]> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch price history');
      }

      // Parse the date strings back to Date objects
      return result.data.map(point => ({
        ...point,
        timestamp: new Date(point.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }

  async forceRefresh(tokenSymbol: string): Promise<PriceData> {
    // Clear cache for this token
    this.cache.delete(`price_${tokenSymbol}`);
    
    // Fetch fresh data
    return this.getPrice(tokenSymbol);
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
  }
}

export default ClientPriceService;
