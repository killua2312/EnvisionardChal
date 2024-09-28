const { redis, setEx, get, del } = require("../config/redis");

const CACHE_TTL = 3600; // 1 hour in seconds

const surgePricingUtils = {
  cacheKey: (latitude, longitude) => `surge_pricing:${latitude}:${longitude}`,
  cache: async (latitude, longitude, surgePricing) => {
    await setEx(
      surgePricingUtils.cacheKey(latitude, longitude),
      300,
      surgePricing
    );
  },
  get: async (latitude, longitude) => {
    return await get(surgePricingUtils.cacheKey(latitude, longitude));
  },
  invalidate: async (latitude, longitude) => {
    await del(surgePricingUtils.cacheKey(latitude, longitude));
  },
};

const weatherUtils = {
  cacheKey: (latitude, longitude) => `weather:${latitude}:${longitude}`,
  cache: async (latitude, longitude, weatherData) => {
    await setEx(
      weatherUtils.cacheKey(latitude, longitude),
      CACHE_TTL,
      weatherData
    );
  },
  get: async (latitude, longitude) => {
    return await get(weatherUtils.cacheKey(latitude, longitude));
  },
  invalidate: async (latitude, longitude) => {
    await del(weatherUtils.cacheKey(latitude, longitude));
  },
  getAllKeys: async () => {
    return await redis.keys("weather:*");
  },
};

module.exports = { surgePricingUtils, weatherUtils };
