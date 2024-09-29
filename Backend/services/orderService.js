const { Order } = require("../models");
const { orderUtils } = require("../utils/orderUtils");
const socket = require("../socket");

const normalizeOrderFormat = (order) => {
  return {
    id: order.id,
    status: order.status,
    latitude: parseFloat(order.latitude),
    longitude: parseFloat(order.longitude),
  };
};

const createOrder = async (orderData) => {
  try {
    // Create the order in the database
    const newOrder = await Order.create(orderData);

    // Update the order information in Redis
    await orderUtils.updateOrder(
      newOrder.id,
      newOrder.status,
      newOrder.customer_latitude,
      newOrder.customer_longitude
    );

    // Emit socket event for the new active order
    const io = socket.getIo();
    io.emit("ordersUpdate", () => {
      return getAllActiveOrders();
    });

    return newOrder;
  } catch (error) {
    console.error("Error in createOrder:", error);
    throw new Error(`Error in createOrder: ${error.message}`);
  }
};

const getAllActiveOrders = async () => {
  try {
    // Get all active order IDs from Redis
    let activeOrderIds = await orderUtils.getAllActiveOrderIds();

    // If Redis is empty, query the database
    if (activeOrderIds.length === 0) {
      const activeOrders = await Order.findAll({
        where: { status: "active" },
      });

      // Update Redis with the orders from the database
      for (const order of activeOrders) {
        await orderUtils.updateOrder(
          order.id,
          order.status,
          order.customer_latitude,
          order.customer_longitude
        );
      }

      activeOrderIds = activeOrders.map((order) => order.id);
    }

    // Fetch full order details for each active order
    const activeOrders = await Promise.all(
      activeOrderIds.map(async (orderId) => {
        const order = await orderUtils.getOrder(orderId);
        if (!order) {
          // If order not found in Redis, fetch from database
          const dbOrder = await Order.findByPk(orderId);
          if (dbOrder && dbOrder.status === "active") {
            await orderUtils.updateOrder(
              dbOrder.id,
              dbOrder.status,
              dbOrder.customer_latitude,
              dbOrder.customer_longitude
            );
            return {
              id: dbOrder.id,
              status: dbOrder.status,
              latitude: dbOrder.customer_latitude,
              longitude: dbOrder.customer_longitude,
            };
          }
          return null; // Order not found in database or not active
        }
        return normalizeOrderFormat(order);
      })
    );

    // Filter out any null values
    return activeOrders.filter(Boolean);
  } catch (error) {
    console.error("Error in getAllActiveOrders:", error);
    throw new Error(`Error in getAllActiveOrders: ${error.message}`);
  }
};

const updateOrderStatus = async (orderId, updateData) => {
  try {
    // Update the order's status in the database
    const [updatedRows] = await Order.update(updateData, {
      where: { id: orderId },
    });

    if (updatedRows === 0) {
      throw new Error(`Order with id ${orderId} not found`);
    }

    // Update the order's status in Redis
    await orderUtils.updateOrderStatus(orderId, updateData.status);

    // Fetch the updated order data
    const updatedOrder = await Order.findByPk(orderId);

    // Emit socket event for real-time updates
    const io = socket.getIo();
    io.emit("ordersUpdate", () => {
      return getAllActiveOrders();
    });

    return updatedOrder;
  } catch (error) {
    console.error(`Error in updateOrderStatus for order ${orderId}:`, error);
    throw new Error(
      `Error in updateOrderStatus for order ${orderId}: ${error.message}`
    );
  }
};

module.exports = {
  createOrder,
  getAllActiveOrders,
  updateOrderStatus,
  normalizeOrderFormat,
};
