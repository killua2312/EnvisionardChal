const driverService = require("../services/driverService");

const driverController = {
  createDriver: async (req, res) => {
    try {
      const driverData = req.body;
      const newDriver = await driverService.createDriver(driverData);
      res.status(201).json(newDriver);
    } catch (error) {
      console.error("Error in createDriver controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllAvailableDrivers: async (req, res) => {
    try {
      const availableDrivers = await driverService.getAllAvailableDrivers();
      res.json(availableDrivers);
    } catch (error) {
      console.error("Error in getAllAvailableDrivers controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateDriverLocation: async (req, res) => {
    try {
      const { driverId } = req.params;
      const { latitude, longitude } = req.body;

      // This emits "driversUpdate" through WebSocket
      const updatedDriver = await driverService.updateDriverLocation(
        driverId,
        latitude,
        longitude
      );

      res.json(updatedDriver);
    } catch (error) {
      console.error("Error in updateDriverLocation controller:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  updateDriverStatus: async (req, res) => {
    try {
      const { driverId } = req.params;
      const { status } = req.body;

      // This emits "driversUpdate" through WebSocket.
      const updatedDriver = await driverService.updateDriverStatus(
        driverId,
        status
      );

      res.json(updatedDriver);
    } catch (error) {
      console.error("Error in updateDriverStatus controller:", error);
      if (error.message.includes("not found")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
};

module.exports = driverController;
