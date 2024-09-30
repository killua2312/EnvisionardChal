const { SurgePricing } = require("../models");
const { surgePricingUtils } = require("../utils/redisModeUtils");
const {
  getAvailableDriversInProximity,
  getActiveOrdersInProximity,
} = require("../utils/proximityUtils");
const weatherService = require("./weatherService");
const socket = require("../socket");
const logger = require("../config/logger");

// constants for pricing calculation
const BASE_DELIVERY_FEE = 5.0; // Base delivery fee in rupees
const MAX_SURGE_MULTIPLIER = 2.5; // Maximum surge multiplier
const RADIUS_KMS = 5; // Radius to get the drivers and orders near the customer

// Calculate surge Factor based on the drivers and orders available in the given km radius
const calculateSurgeFactor = (driversInProximity, ordersInProximity) => {
  let surgeFactor;
  let demandLevel;

  // If there are no drivers, return maximum surge
  if (driversInProximity === 0) {
    surgeFactor = MAX_SURGE_MULTIPLIER;
    demandLevel = "Extreme";
  }

  // Calculate the ratio of orders to drivers
  const ratio = ordersInProximity / driversInProximity;

  // Define surge levels based on the ratio
  // The higher the ratio, the higher the surge factor and demand level
  if (ratio <= 0.5) {
    surgeFactor = 1.0;
    demandLevel = "Very Low";
  } // More than enough drivers
  if (ratio <= 0.75 && ratio > 0.5) {
    surgeFactor = 1.2;
    demandLevel = "Low";
  } // Slight shortage
  if (ratio <= 1.0 && ratio > 0.75) {
    surgeFactor = 1.4;
    demandLevel = "Normal";
  } // Balanced
  if (ratio <= 1.5 && ratio > 1.0) {
    surgeFactor = 1.7;
    demandLevel = "High";
  } // Moderate shortage
  if (ratio <= 2.0 && ratio > 1.5) {
    surgeFactor = 2.0;
    demandLevel = "Very High";
  } // Significant shortage
  if (ratio > 2.0) {
    surgeFactor = MAX_SURGE_MULTIPLIER;
    demandLevel = "Extreme";
  } // Severe shortage

  return [surgeFactor, demandLevel];
};

// Calculate surge pricing based on surge Factor and weather condition
const calculateSurgePricing = async (latitude, longitude) => {
  try {
    logger.info(
      `Calculating surge pricing for lat: ${latitude}, lon: ${longitude}`
    );

    // Step 1: Get the number of active orders within given radius (RADIUS_KMS)
    const { totalInProximity: ordersInProximity } =
      await getActiveOrdersInProximity(latitude, longitude, RADIUS_KMS);
    logger.debug(`Orders in proximity: ${ordersInProximity}`);

    // Step 2: Get the number of available drivers within giver radius (RADIUS_KMS)
    const { totalInProximity: driversInProximity, proximityDrivers } =
      await getAvailableDriversInProximity(latitude, longitude, RADIUS_KMS);
    logger.debug(`Drivers in proximity: ${driversInProximity}`);

    // Step 3: Calculate surge factor based on the ratio of orders to drivers
    const [surgeFactor, demandLevel] = calculateSurgeFactor(
      driversInProximity,
      ordersInProximity
    );

    // Step 4: Get current weather condition and its impact
    const weatherData = await weatherService.getCurrentWeather(
      latitude,
      longitude
    );
    const weatherCondition = weatherData.condition;
    const weatherFactor = weatherService.getWeatherImpact(weatherCondition);

    // Step 5: Calculate final surge multiplier
    // Multiply surge factor by weather factor
    let surgeMultiplier = surgeFactor * weatherFactor;
    // Ensure surge multiplier doesn't exceed the maximum allowed values
    surgeMultiplier = Math.min(surgeMultiplier, MAX_SURGE_MULTIPLIER);
    // Ensure surge multiplier is never below 1
    surgeMultiplier = Math.max(surgeMultiplier, 1); // Ensure it's never below 1

    // Step 6: Calculate surge fee and total fee
    const surgeFee = BASE_DELIVERY_FEE * (surgeMultiplier - 1);
    const totalFee = BASE_DELIVERY_FEE + surgeFee;

    // Step 7: Prepare surge pricing data
    const surgePricingData = {
      base_fee: BASE_DELIVERY_FEE,
      surge_fee: surgeFee,
      total_fee: totalFee,
      surge_multiplier: surgeMultiplier,
      demand_level: demandLevel,
      active_orders: ordersInProximity,
      available_drivers: driversInProximity,
      weather_condition: weatherCondition,
      latitude: latitude,
      longitude: longitude,
    };

    // Step 8: Save to the surge pricing data to the database
    const savedSurgePricing = await SurgePricing.create(surgePricingData);

    // Step 9: Cache the result for future quick access
    await surgePricingUtils.cache(
      latitude,
      longitude,
      JSON.stringify(savedSurgePricing)
    );

    // Step 10: Emit the calculated surge pricing via WebSocket
    const io = socket.getIo();
    io.emit("surgePricingUpdate", {
      surgePricingData: savedSurgePricing,
      proximityDrivers,
    });

    logger.info(
      `Surge Pricing calculated: ${JSON.stringify(surgePricingData)}`
    );
    // Return teh calculated surge pricing data and nearby drivers
    return { surgePricingData, proximityDrivers };
  } catch (error) {
    logger.error(`Error in calculateSurgePricing: ${error.message}`, { error });
    throw error;
  }
};

// Simulate Surge Pricing
const simulateSurgePricing = async (simulateData) => {
  const { driversInProximity, ordersInProximity, weatherCondition } =
    simulateData;

  const [surgeFactor, demandLevel] = calculateSurgeFactor(
    driversInProximity,
    ordersInProximity
  );

  const weatherFactor = weatherService.getWeatherImpact(weatherCondition);

  // Calculate final surge multipliler
  let surgeMultiplier = surgeFactor * weatherFactor;
  surgeMultiplier = Math.min(surgeMultiplier, MAX_SURGE_MULTIPLIER);
  surgeMultiplier = Math.max(surgeMultiplier, 1);

  // Calculate surge fee
  const surgeFee = BASE_DELIVERY_FEE * (surgeMultiplier - 1);
  const totalFee = BASE_DELIVERY_FEE + surgeFee;

  // Prepare surge pricing data
  const surgePricingData = {
    base_fee: BASE_DELIVERY_FEE,
    surge_fee: surgeFee,
    total_fee: totalFee,
    surge_multiplier: surgeMultiplier,
    demand_level: demandLevel,
    active_orders: ordersInProximity,
    available_drivers: driversInProximity,
    weather_condition: weatherCondition,
  };

  // Emit the simulted surge pricing
  const io = socket.getIo();
  io.emit("simulateSurgePrice", surgePricingData);

  return surgePricingData;
};

module.exports = {
  calculateSurgePricing,
  simulateSurgePricing,
};
