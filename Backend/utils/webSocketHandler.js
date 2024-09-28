const orderService = require("../services/orderService");
const driverService = require("../services/driverService");

const setupWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Send initial active orders to the client
    socket.on("requestInitialData", async () => {
      try {
        const activeOrders = await orderService.getAllActiveOrders();
        await driverService.getAllAvailableDrivers(); // This is to cache all available drivers at the initial request
        io.to(socket.id).emit("initialDataUpdate", {
          activeOrders,
        });
      } catch (error) {
        console.error("Error fetching initial data:", error);
        io.to(socket.id).emit("error", {
          message: "Failed to fetch initial data",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = setupWebSocket;
