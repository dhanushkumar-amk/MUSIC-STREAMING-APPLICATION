import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

redis.ping()
  .then(() => console.log("✅ Redis Connected : Successfully"))
  .catch(err => console.error("❌ Redis Error:", err.message));

export default redis;
