const Redis = require("ioredis");

const redis = new Redis();

// Utility functions
const setEx = async (key, seconds, value) => {
  await redis.setex(key, seconds, JSON.stringify(value));
};

const get = async (key) => {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

const del = async (key) => {
  await redis.del(key);
};

module.exports = { redis, setEx, get, del };
