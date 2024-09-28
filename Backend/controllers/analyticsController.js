const analyticsService = require("../services/analyticsService");

const analyticsController = {
  getSurgePricingFrequency: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const frequency = await analyticsService.getSurgePricingFrequency(
        startDate,
        endDate
      );
      res.json(frequency);
    } catch (error) {
      console.error("Error in getSurgePricingFrequency controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAverageSurgeMultiplier: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const averageMultiplier =
        await analyticsService.getAverageSurgeMultiplier(startDate, endDate);
      res.json(averageMultiplier);
    } catch (error) {
      console.error("Error in getAverageSurgeMultiplier controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAverageSurgeMultiplierByArea: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const averageMultiplierByArea =
        await analyticsService.getAverageSurgeMultiplierByArea(
          startDate,
          endDate
        );
      res.json(averageMultiplierByArea);
    } catch (error) {
      console.error(
        "Error in getAverageSurgeMultiplierByArea controller:",
        error
      );
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = analyticsController;
