const { driverUtils } = require("./driverUtils");
const { orderUtils } = require("./orderUtils");

const getAvailableDriversInProximity = async (
  latitude,
  longitude,
  radiusKm = 5
) => {
  try {
    const result = await driverUtils.getNearbyDrivers(
      latitude,
      longitude,
      radiusKm
    );

    console.log(result);

    return {
      totalActive: result.totalActive,
      totalInProximity: result.inProximity,
      proximityDrivers: result.proximityDrivers.map((driver) => ({
        id: driver.id,
        status: driver.status,
        latitude: driver.latitude,
        longitude: driver.longitude,
        distance: driver.distance,
      })),
    };
  } catch (error) {
    console.error("Error in getAvailableDriversInProximity:", error);
    throw error;
  }
};

const getActiveOrdersInProximity = async (
  latitude,
  longitude,
  radiusKm = 5
) => {
  try {
    const result = await orderUtils.getNearbyOrders(
      latitude,
      longitude,
      radiusKm
    );

    console.log(result);

    return {
      totalActive: result.totalActive,
      totalInProximity: result.inProximity,
    };
  } catch (error) {
    console.error("Error in getActiveOrdersInProximity:", error);
    throw error;
  }
};

module.exports = {
  getAvailableDriversInProximity,
  getActiveOrdersInProximity,
};
