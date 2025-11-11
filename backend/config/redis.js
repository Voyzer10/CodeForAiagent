// config/redisClient.js
const Redis = require("ioredis");

// ⚠️ Use the actual Redis TCP port (usually 6379), NOT the /browser HTTP port
const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,

  // / ⚠️ REQUIRED for BullMQ
  maxRetriesPerRequest: null,
  enableReadyCheck: false,


  retryStrategy(times) {
    return Math.min(times * 100, 2000);
  },
});

redisClient.on("connect", () => console.log("✅ Connected to Redis successfully"));
redisClient.on("error", (err) => console.error("❌ Redis connection error:", err));

module.exports = redisClient;
