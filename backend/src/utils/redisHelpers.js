import redis from "../config/redis.js";

/* Save value with TTL */
export const redisSet = async (key, value, ttl = 300) => {
  try {
    const data = typeof value === "string" ? value : JSON.stringify(value);
    await redis.set(key, data, { ex: ttl });
    return true;
  } catch (err) {
    console.error("Redis SET Error:", err.message);
    return false;
  }
};

/* Read value from Redis */
export const redisGet = async key => {
  try {
    const value = await redis.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value; // string fallback
    }
  } catch (err) {
    console.error("Redis GET Error:", err.message);
    return null;
  }
};

/* Delete key */
export const redisDel = async key => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis DEL Error:", err.message);
  }
};
