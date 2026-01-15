import { Redis } from "@upstash/redis";

let redis = null;

// Only initialize Redis if credentials are provided
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test connection
    redis.ping()
      .then(() => console.log("✅ Redis Connected: Successfully"))
      .catch(err => {
        console.warn("⚠️  Redis connection failed:", err.message);
        console.warn("⚠️  App will run without caching");
        redis = null;
      });
  } catch (error) {
    console.warn("⚠️  Redis initialization failed:", error.message);
    console.warn("⚠️  App will run without caching");
    redis = null;
  }
} else {
  console.warn("⚠️  Redis credentials not found in .env");
  console.warn("⚠️  App will run without caching (slower performance)");
}

export default redis;
