import Redis from 'ioredis';

/**
 * Unified Redis Cache Service
 * Implements Cache-Aside Pattern for sub-100ms latency
 * Wraps Mongoose queries with intelligent caching
 */
class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour default
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('⚠️  Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.client.ping();
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
      this.isConnected = false;
      return null;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Parsed value or null
   */
  async get(key) {
    if (!this.isConnected) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;

    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete key(s) from cache
   * @param {string|string[]} keys - Key or array of keys to delete
   */
  async del(keys) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(Array.isArray(keys) ? keys : [keys]);
      return true;
    } catch (error) {
      console.error(`Cache DEL error:`, error.message);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'user:*')
   */
  async delPattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache DEL pattern error:`, error.message);
      return false;
    }
  }

  /**
   * Cache-Aside Pattern: Get or Set
   * If data exists in cache, return it. Otherwise, fetch from DB and cache it.
   *
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Async function to fetch data if not in cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>} Data from cache or DB
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss: fetch from database
    const data = await fetchFn();

    // Store in cache for next time
    if (data !== null && data !== undefined) {
      await this.set(key, data, ttl);
    }

    return data;
  }

  /**
   * Increment a counter in Redis
   * @param {string} key - Counter key
   * @param {number} amount - Amount to increment (default: 1)
   * @returns {Promise<number>} New value
   */
  async incr(key, amount = 1) {
    if (!this.isConnected) return 0;

    try {
      return await this.client.incrby(key, amount);
    } catch (error) {
      console.error(`Cache INCR error for key ${key}:`, error.message);
      return 0;
    }
  }

  /**
   * Set expiration on a key
   * @param {string} key - Key to expire
   * @param {number} seconds - Seconds until expiration
   */
  async expire(key, seconds) {
    if (!this.isConnected) return false;

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`Cache EXPIRE error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Key to check
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Flush all cache data (use with caution!)
   */
  async flushAll() {
    if (!this.isConnected) return false;

    try {
      await this.client.flushall();
      console.log('⚠️  Cache flushed completely');
      return true;
    } catch (error) {
      console.error('Cache FLUSH error:', error.message);
      return false;
    }
  }

  /**
   * Get Redis client instance for advanced operations
   */
  getClient() {
    return this.client;
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }
}

// Export singleton instance
export default new CacheService();
