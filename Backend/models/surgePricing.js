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
    },
    surge_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    surge_multiplier: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
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
  });

  return SurgePricing;
};
