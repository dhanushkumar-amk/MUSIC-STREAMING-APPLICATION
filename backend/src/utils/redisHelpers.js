// Helper function to safely use Redis
export async function safeRedisGet(key) {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch (err) {
    console.warn(`Redis get failed for ${key}:`, err.message);
    return null;
  }
}

export async function safeRedisSet(key, value, options) {
  if (!redis) return;
  try {
    await redis.set(key, value, options);
  } catch (err) {
    console.warn(`Redis set failed for ${key}:`, err.message);
  }
}

export async function safeRedisDel(...keys) {
  if (!redis) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.warn(`Redis del failed:`, err.message);
  }
}
