const { Driver } = require("../models");
const { driverUtils } = require("../utils/driverUtils");
const socket = require("../socket");

const createDriver = async (driverData) => {
  try {
    // Create the driver in the database
    const newDriver = await Driver.create(driverData);

    // Update the driver information in Redis
    await driverUtils.updateDriver(
      newDriver.id,
      newDriver.status,
      newDriver.current_latitude,
      newDriver.current_longitude
    );

    // Emit socket event
    const io = socket.getIo();
    io.emit("driversUpdate", newDriver);

    return newDriver;
  } catch (error) {
    console.error("Error in createDriver:", error);
    throw error;
  }
};

const getAllAvailableDrivers = async () => {
  try {
    // Get all available driver IDs from Redis
    let availableDriverIds = await driverUtils.getAllAvailableDriverIds();

    let availableDrivers = [];

    // If Redis is empty, query the database
    if (availableDriverIds.length === 0) {
      availableDrivers = await Driver.findAll({
        where: { status: "available" },
      });

      // Update Redis with the drivers from the database
      for (const driver of availableDrivers) {
        await driverUtils.updateDriver(
          driver.id,
          driver.status,
          driver.current_latitude,
          driver.current_longitude
        );
      }

      // Return the drivers fetched from the database
      return availableDrivers.map((driver) => ({
        id: driver.id,
        status: driver.status,
        latitude: driver.current_latitude,
        longitude: driver.current_longitude,
      }));
    }

    // If we have IDs in Redis, fetch full driver details
    availableDrivers = await Promise.all(
      availableDriverIds.map(async (driverId) => {
        const driver = await driverUtils.getDriver(driverId);
        if (driver) {
          return {
            id: driver.id,
            status: driver.status,
            latitude: driver.latitude,
            longitude: driver.longitude,
          };
        }
        return null; // Driver not found in Redis
      })
    );

    // Filter out any null values
    return availableDrivers.filter(Boolean);
  } catch (error) {
    console.error("Error in getAllAvailableDrivers:", error);
    throw error;
  }
};

const updateDriverStatus = async (driverId, newStatus) => {
  try {
    // Update the driver's status in the database
    const [updatedRows] = await Driver.update(
      { status: newStatus },
      { where: { id: driverId } }
    );

    console.log("updatedRows passed");

    if (updatedRows === 0) {
      throw new Error(`Driver with id ${driverId} not found`);
    }

    // Update the driver's status in Redis
    await driverUtils.updateDriverStatus(driverId, newStatus);

    console.log("driverUtils passed");

    // Fetch the updated driver data
    const updatedDriver = await Driver.findByPk(driverId);

    // Emit socket event for real-time updates
    const io = socket.getIo();
    io.emit("driversUpdate", { driverId, newStatus });

    return updatedDriver;
  } catch (error) {
    console.error(`Error in updateDriverStatus for driver ${driverId}:`, error);
    throw error;
  }
};

const updateDriverLocation = async (driverId, newLatitude, newLongitude) => {
  try {
    // Update the driver's location in the database
    const [updatedRows] = await Driver.update(
      {
        current_latitude: newLatitude,
        current_longitude: newLongitude,
      },
      { where: { id: driverId } }
    );

    if (updatedRows === 0) {
      throw new Error(`Driver with id ${driverId} not found`);
    }

    // Update the driver's location in Redis
    await driverUtils.updateDriverLocation(driverId, newLatitude, newLongitude);

    // Fetch the updated driver data
    const updatedDriver = await Driver.findByPk(driverId);

    // Emit socket event for real-time updates
    const io = socket.getIo();
    io.emit("driversUpdate", {
      driverId,
      latitude: newLatitude,
      longitude: newLongitude,
    });

    return updatedDriver;
  } catch (error) {
    console.error(
      `Error in updateDriverLocation for driver ${driverId}:`,
      error
    );
    throw error;
  }
};

module.exports = {
  createDriver,
  getAllAvailableDrivers,
  updateDriverLocation,
  updateDriverStatus,
};
