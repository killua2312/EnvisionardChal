const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const SurgePricing = sequelize.define("SurgePricing", {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    base_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isNonNegative(value) {
          if (parseFloat(value) < 0) {
            throw new Error("Total amount must be non-negative");
          }
        },
      },
    },
    surge_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isNonNegative(value) {
          if (parseFloat(value) < 0) {
            throw new Error("Total amount must be non-negative");
          }
        },
      },
    },
    total_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isNonNegative(value) {
          if (parseFloat(value) < 0) {
            throw new Error("Total amount must be non-negative");
          }
        },
      },
    },
    surge_multiplier: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        isNonNegative(value) {
          if (parseFloat(value) < 0) {
            throw new Error("Total amount must be non-negative");
          }
        },
      },
    },
    demand_level: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    active_orders: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available_drivers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weather_condition: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
  });

  return SurgePricing;
};
