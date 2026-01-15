import NodeCache from 'node-cache';
import { Redis } from '@upstash/redis';

// L1: Memory cache (fast, limited size)
const memCache = new NodeCache({
  stdTTL: 30,           // 30 seconds default TTL
  checkperiod: 60,      // Check for expired keys every 60s
  maxKeys: 1000,        // Max 1000 keys
  useClones: false      // Better performance
});

// L2: Redis cache (distributed, persistent)
let redis = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
  }
} catch (error) {
  console.warn('⚠️  Redis not configured, using memory cache only');
}

/**
 * Multi-level cache get
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds (default: 300)
 * @returns {Promise<any>} Cached or fetched data
 */
export async function getCached(key, fetchFn, ttl = 300) {
  // L1: Check memory cache
  const memCached = memCache.get(key);
  if (memCached !== undefined) {
    return memCached;
  }

  // L2: Check Redis cache
  if (redis) {
    try {
      const redisCached = await redis.get(key);
      if (redisCached !== null) {
        const data = typeof redisCached === 'string' ? JSON.parse(redisCached) : redisCached;
        // Warm memory cache
        memCache.set(key, data);
        return data;
      }
    } catch (error) {
      console.warn('Redis get error:', error.message);
    }
  }

  // L3: Fetch from source
  const data = await fetchFn();

  // Warm both caches
  memCache.set(key, data);

  if (redis) {
    try {
      await redis.set(key, JSON.stringify(data), { ex: ttl });
    } catch (error) {
      console.warn('Redis set error:', error.message);
    }
  }

  return data;
}

/**
 * Set cache value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 */
export async function setCache(key, value, ttl = 300) {
  // Set in memory cache
  memCache.set(key, value);

  // Set in Redis cache
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttl });
    } catch (error) {
      console.warn('Redis set error:', error.message);
    }
  }
}

/**
 * Delete cache key
 * @param {string} keys - Cache key(s) to delete
 */
export async function deleteCache(...keys) {
  // Delete from memory cache
  keys.forEach(key => memCache.del(key));

  // Delete from Redis cache
  if (redis) {
    try {
      await redis.del(...keys);
    } catch (error) {
      console.warn('Redis delete error:', error.message);
    }
  }
}

/**
 * Clear all cache
 */
export async function clearCache() {
  // Clear memory cache
  memCache.flushAll();

  // Clear Redis cache (use with caution!)
  if (redis) {
    try {
      await redis.flushdb();
    } catch (error) {
      console.warn('Redis flush error:', error.message);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memory: {
      keys: memCache.keys().length,
      hits: memCache.getStats().hits,
      misses: memCache.getStats().misses,
      hitRate: memCache.getStats().hits / (memCache.getStats().hits + memCache.getStats().misses) || 0
    },
    redis: redis ? 'connected' : 'not configured'
  };
}

export { memCache, redis };
