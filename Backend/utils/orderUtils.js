const { redis } = require("../config/redis");
const { Order } = require("../models");

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

const orderUtils = {
  orderKey: (orderId) => `order:${orderId}`,

  updateOrder: async (orderId, status, latitude, longitude) => {
    try {
      await retryOperation(async () => {
        const multi = redis.multi();

        // Update order hash
        multi.hmset(orderUtils.orderKey(orderId), {
          status,
          latitude,
          longitude,
        });

        // Update geo index (only if it's a new order or location has changed)
        multi.geoadd("order_locations", longitude, latitude, orderId);

        // Update active orders set
        if (status === "active") {
          multi.sadd("active_orders", orderId);
        } else {
          multi.srem("active_orders", orderId);
        }

        // Set expiration
        multi.expire(orderUtils.orderKey(orderId), CACHE_TTL);

        await multi.exec();
      });
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw new Error(`Failed to update order ${orderId} in Redis`);
    }
  },

  getOrder: async (orderId) => {
    try {
      return await retryOperation(async () => {
        const orderData = await redis.hgetall(orderUtils.orderKey(orderId));

        if (Object.keys(orderData).length === 0) {
          // If not in cache, fetch from database
          const order = await Order.findByPk(orderId);
          if (order) {
            const { status, customer_latitude, customer_longitude } = order;
            await orderUtils.updateOrder(
              orderId,
              status,
              customer_latitude,
              customer_longitude
            );
            return {
              id: orderId,
              status,
              latitude: customer_latitude,
              longitude: customer_longitude,
            };
          }
          return null;
        }

        return {
          id: orderId,
          status: orderData.status,
          latitude: parseFloat(orderData.latitude),
          longitude: parseFloat(orderData.longitude),
        };
      });
    } catch (error) {
      console.error(`Error getting order ${orderId}:`, error);
      throw new Error(`Failed to get order ${orderId} from Redis`);
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await retryOperation(async () => {
        const multi = redis.multi();

        multi.hset(orderUtils.orderKey(orderId), "status", status);

        if (status === "active") {
          multi.sadd("active_orders", orderId);
        } else {
          multi.srem("active_orders", orderId);
        }

        multi.expire(orderUtils.orderKey(orderId), CACHE_TTL);

        await multi.exec();
      });
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
      throw new Error(`Failed to update status for order ${orderId} in Redis`);
    }
  },

  getAllActiveOrderIds: async () => {
    try {
      return await redis.smembers("active_orders");
    } catch (error) {
      console.error("Error getting active order IDs:", error);
      throw new Error("Failed to get active order IDs from Redis");
    }
  },

  getNearbyOrders: async (latitude, longitude, radius) => {
    try {
      const nearbyOrderIds = await redis.georadius(
        "order_locations",
        longitude,
        latitude,
        radius,
        "km",
        "WITHDIST"
      );
      const activeOrderIds = await redis.smembers("active_orders");

      const nearbyActiveOrders = nearbyOrderIds.filter(([orderId]) =>
        activeOrderIds.includes(orderId)
      );

      return {
        totalActive: activeOrderIds.length,
        inProximity: nearbyActiveOrders.length,
        proximityOrders: await Promise.all(
          nearbyActiveOrders.map(async ([orderId, distance]) => {
            const order = await orderUtils.getOrder(orderId);
            return {
              ...order,
              distance: parseFloat(distance),
            };
          })
        ),
      };
    } catch (error) {
      console.error("Error getting nearby orders:", error);
      throw new Error("Failed to get nearby orders from Redis");
    }
  },
};

module.exports = { orderUtils };
