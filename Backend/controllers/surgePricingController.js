const {
  calculateSurgePricing,
  simulateSurgePricing,
} = require("../services/surgePricingService");

const surgePricingController = {
  getSurgePricing: async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      // Input validation
      if (!latitude || !longitude) {
        return res
          .status(400)
          .json({ error: "Latitude and longitude are required" });
      }

      // Parse latitude and longitude to floats
      const parsedLat = parseFloat(latitude);
      const parsedLon = parseFloat(longitude);

      // Validate parsed values
      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        return res.status(400).json({ error: "Invalid latitude or longitude" });
      }

      const response = await calculateSurgePricing(parsedLat, parsedLon);

      res.json(response);
    } catch (error) {
      console.error("Error in getSurgePricing controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getSimulatedPricing: async (req, res) => {
    try {
      const simulateData = req.body;

      // Calculate surge pricing
      // This will emit the result via WebSocket
      simulateSurgePricing(simulateData);

      res
        .status(202)
        .json({ message: "Simulated surge pricing calculation initiated" });
    } catch (error) {
      console.error("Error in getSimulatedPricing controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = surgePricingController;
