const { SurgePricing, sequelize } = require("../models");
const { Op } = require("sequelize");

const analyticsService = {
  getSurgePricingFrequency: async (startDate, endDate) => {
    try {
      const result = await SurgePricing.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      });

      return result;
    } catch (error) {
      console.error("Error in getSurgePricingFrequency:", error);
      throw error;
    }
  },

  getAverageSurgeMultiplier: async (startDate, endDate) => {
    try {
      const result = await SurgePricing.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [
            sequelize.fn("AVG", sequelize.col("surge_multiplier")),
            "averageMultiplier",
          ],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      });

      return result;
    } catch (error) {
      console.error("Error in getAverageSurgeMultiplier:", error);
      throw error;
    }
  },

  getAverageSurgeMultiplierByArea: async (startDate, endDate) => {
    try {
      const result = await SurgePricing.findAll({
        attributes: [
          "latitude",
          "longitude",
          [
            sequelize.fn("AVG", sequelize.col("surge_multiplier")),
            "averageMultiplier",
          ],
        ],
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: ["latitude", "longitude"],
        order: [
          [sequelize.fn("AVG", sequelize.col("surge_multiplier")), "DESC"],
        ],
      });

      return result;
    } catch (error) {
      console.error("Error in getAverageSurgeMultiplierByArea:", error);
      throw error;
    }
  },
};

module.exports = analyticsService;
