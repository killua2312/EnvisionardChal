const analyticsService = require("../services/analyticsService");
const logger = require("../config/logger");

const analyticsController = {
  getAverageSurgeMultiplierByArea: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      logger.info(`Received dates in controller: ${startDate} and ${endDate}`);

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "Start date and end date are required" });
      }

      const averageMultiplierByArea =
        await analyticsService.getAverageSurgeMultiplierByArea(
          new Date(startDate),
          new Date(endDate)
        );
      res.json(averageMultiplierByArea);
    } catch (error) {
      logger.error(
        `Error in getAverageSurgeMultiplierByArea controller: ${error.message}`,
        { error }
      );
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAverageSurgeMultiplier: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      logger.info(
        `Received dates in getAverageSurgeMultiplier: ${startDate} and ${endDate}`
      );

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "Start date and end date are required" });
      }

      const averageMultiplier =
        await analyticsService.getAverageSurgeMultiplier(startDate, endDate);
      res.json(averageMultiplier);
    } catch (error) {
      logger.error(
        `Error in getAverageSurgeMultiplier controller: ${error.message}`,
        { error }
      );
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getSurgePricingFrequency: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      logger.info(
        `Received dates in getSurgePricingFrequency: ${startDate} and ${endDate}`
      );

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "Start date and end date are required" });
      }

      const frequency = await analyticsService.getSurgePricingFrequency(
        startDate,
        endDate
      );
      res.json(frequency);
    } catch (error) {
      logger.error(
        `Error in getSurgePricingFrequency controller: ${error.message}`,
        { error }
      );
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = analyticsController;
