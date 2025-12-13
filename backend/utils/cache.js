const redis = require("../config/redis");

const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setCache = async (key, value, ttl = 300) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {}
};

module.exports = { getCache, setCache };
