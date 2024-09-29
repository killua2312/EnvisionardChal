const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      customer_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
      },
      customer_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
      },
      restaurant_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
      },
      restaurant_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "delivered", "cancelled"),
        allowNull: false,
      },
      driver_id: {
        type: DataTypes.UUID,
        allowNull: true, // if the driver is not assigned yet. Depends on status of order
      },
      order_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      total_amount: {
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
    },
    {
      indexes: [
        {
          fields: ["status"],
        },
        {
          fields: ["customer_latitude"],
        },
        {
          fields: ["customer_longitude"],
        },
      ],
    }
  );

  return Order;
};
