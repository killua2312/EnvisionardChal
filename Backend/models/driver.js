const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    "Driver",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("available", "unavailable"),
        allowNull: false,
      },
      current_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
      },
      current_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          fields: ["status"],
        },
        {
          fields: ["current_latitude"],
        },
        {
          fields: ["current_longitude"],
        },
      ],
    }
  );

  return Driver;
};
