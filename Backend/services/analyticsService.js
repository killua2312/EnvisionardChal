const { SurgePricing, sequelize } = require("../models");
const { Op } = require("sequelize");
const logger = require("../config/logger");

const analyticsService = {
  getSurgePricingFrequency: async (startDate, endDate) => {
    logger.info(
      `getSurgePricingFrequency called with: StartDate: ${startDate} and EndData: ${endDate}`
    );
    try {
      const result = await SurgePricing.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          createdAt: {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      });

      logger.info(`getSurgePricingFrequency result: ${result}`);
      return result;
    } catch (error) {
      logger.error(`Error in getSurgePricingFrequency: ${error.message}`, {
        error,
      });
      throw error;
    }
  },

  getAverageSurgeMultiplier: async (startDate, endDate) => {
    logger.info(
      `getAverageSurgeMultiplier called with: StartDate: ${startDate} and EndDate: ${endDate}`
    );
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
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      });

      logger.info(`getAverageSurgeMultiplier result: ${result}`);
      return result;
    } catch (error) {
      logger.error(`Error in getAverageSurgeMultiplier: ${error.message}`, {
        error,
      });
      throw error;
    }
  },

  getAverageSurgeMultiplierByArea: async (startDate, endDate) => {
    logger.info(
      `getAverageSurgeMultiplierByArea called with: ${startDate} and ${endDate}`
    );
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
            [Op.between]: [new Date(startDate), new Date(endDate)],
          },
        },
        group: ["latitude", "longitude"],
        order: [
          [sequelize.fn("AVG", sequelize.col("surge_multiplier")), "DESC"],
        ],
      });

      logger.info(`getAverageSurgeMultiplierByArea result: ${result}`);
      return result;
    } catch (error) {
      logger.error(
        `Error in getAverageSurgeMultiplierByArea: ${error.message}`,
        { error }
      );
      throw error;
    }
  },
};

module.exports = analyticsService;
