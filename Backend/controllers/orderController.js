const orderService = require("../services/orderService");

const orderController = {
  createOrder: async (req, res) => {
    try {
      const orderData = req.body;
      const newOrder = await orderService.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error in createOrder controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllActiveOrders: async (req, res) => {
    try {
      const activeOrders = await orderService.getAllActiveOrders();
      res.json(activeOrders);
    } catch (error) {
      console.error("Error in getActiveOrders controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const updateData = req.body;

      // This emits "ordersUpdate" through WebSocket
      const updatedOrder = await orderService.updateOrderStatus(
        orderId,
        updateData
      );
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error in updateOrder controller:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
};

module.exports = orderController;
