const { redis } = require("../config/redis");
const { Driver } = require("../models");

const CACHE_TTL = 3600; // 1 hour in seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retryOperation = async (operation, maxRetries = MAX_RETRIES) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

const driverUtils = {
  driverKey: (driverId) => `driver:${driverId}`,

  updateDriver: async (driverId, status, latitude, longitude) => {
    try {
      await retryOperation(async () => {
        const multi = redis.multi();

        // Update driver hash
        multi.hmset(driverUtils.driverKey(driverId), {
          status,
          latitude,
          longitude,
        });

        // Update geo index
        multi.geoadd("driver_locations", longitude, latitude, driverId);

        // Update available drivers set
        if (status === "available") {
          multi.sadd("available_drivers", driverId);
        } else {
          multi.srem("available_drivers", driverId);
        }

        // Set expiration
        multi.expire(driverUtils.driverKey(driverId), CACHE_TTL);

        await multi.exec();
      });
    } catch (error) {
      console.error(`Error updating driver ${driverId}:`, error);
      throw new Error(`Failed to update driver ${driverId} in Redis`);
    }
  },

  getDriver: async (driverId) => {
    try {
      return await retryOperation(async () => {
        const driverData = await redis.hgetall(driverUtils.driverKey(driverId));

        if (Object.keys(driverData).length === 0) {
          // If not in cache, fetch from database
          const driver = await Driver.findByPk(driverId);
          if (driver) {
            const { status, current_latitude, current_longitude } = driver;
            await driverUtils.updateDriver(
              driverId,
              status,
              current_latitude,
              current_longitude
            );
            return {
              id: driverId,
              status,
              latitude: current_latitude,
              longitude: current_longitude,
            };
          }
          return null;
        }

        return {
          id: driverId,
          status: driverData.status,
          latitude: parseFloat(driverData.latitude),
          longitude: parseFloat(driverData.longitude),
        };
      });
    } catch (error) {
      console.error(`Error getting driver ${driverId}:`, error);
      throw new Error(`Failed to get driver ${driverId} from Redis`);
    }
  },

  updateDriverStatus: async (driverId, status) => {
    try {
      await retryOperation(async () => {
        const multi = redis.multi();

        multi.hset(driverUtils.driverKey(driverId), "status", status);

        if (status === "available") {
          multi.sadd("available_drivers", driverId);
        } else {
          multi.srem("available_drivers", driverId);
        }

        multi.expire(driverUtils.driverKey(driverId), CACHE_TTL);

        await multi.exec();
      });
    } catch (error) {
      console.error(`Error updating status for driver ${driverId}:`, error);
      throw new Error(
        `Failed to update status for driver ${driverId} in Redis`
      );
    }
  },

  updateDriverLocation: async (driverId, latitude, longitude) => {
    try {
      await retryOperation(async () => {
        const multi = redis.multi();

        multi.hmset(driverUtils.driverKey(driverId), { latitude, longitude });
        multi.geoadd("driver_locations", longitude, latitude, driverId);
        multi.expire(driverUtils.driverKey(driverId), CACHE_TTL);

        await multi.exec();
      });
    } catch (error) {
      console.error(`Error updating location for driver ${driverId}:`, error);
      throw new Error(
        `Failed to update location for driver ${driverId} in Redis`
      );
    }
  },

  getAllAvailableDriverIds: async () => {
    try {
      return await redis.smembers("available_drivers");
    } catch (error) {
      console.error("Error getting available driver IDs:", error);
      throw new Error("Failed to get available driver IDs from Redis");
    }
  },

  getNearbyDrivers: async (latitude, longitude, radius) => {
    try {
      const nearbyDriverIds = await redis.georadius(
        "driver_locations",
        longitude,
        latitude,
        radius,
        "km",
        "WITHDIST"
      );
      const availableDriverIds = await redis.smembers("available_drivers");

      const nearbyAvailableDrivers = nearbyDriverIds.filter(([driverId]) =>
        availableDriverIds.includes(driverId)
      );

      return {
        totalActive: availableDriverIds.length,
        inProximity: nearbyAvailableDrivers.length,
        proximityDrivers: await Promise.all(
          nearbyAvailableDrivers.map(async ([driverId, distance]) => {
            const driver = await driverUtils.getDriver(driverId);
            return {
              ...driver,
              distance: parseFloat(distance),
            };
          })
        ),
      };
    } catch (error) {
      console.error("Error getting nearby drivers:", error);
      throw new Error("Failed to get nearby drivers from Redis");
    }
  },
};

module.exports = { driverUtils };
