const redis = require("../config/redis");

const getCache = async (key) => {
  console.log("📦 cache.get →", key);
  const data = await redis.get(key);
  console.log("📦 cache.get result:", !!data);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 300) => {
  console.log("📦 cache.set →", key, "TTL:", ttl);
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

module.exports = { getCache, setCache };
