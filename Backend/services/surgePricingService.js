const { SurgePricing } = require("../models");
const { surgePricingUtils } = require("../utils/redisModeUtils");
const {
  getAvailableDriversInProximity,
  getActiveOrdersInProximity,
} = require("../utils/proximityUtils");
const weatherService = require("./weatherService");
const socket = require("../socket");

const BASE_DELIVERY_FEE = 5.0; // Base delivery fee in rupees
const MAX_SURGE_MULTIPLIER = 2.5; // Maximum surge multiplier

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
    console.log(latitude, longitude);
    const { totalInProximity: ordersInProximity } =
      await getActiveOrdersInProximity(latitude, longitude, 5);
    console.log(ordersInProximity);

    const { totalInProximity: driversInProximity, proximityDrivers } =
      await getAvailableDriversInProximity(latitude, longitude, 5);

    console.log(driversInProximity);

    // Get surge factor
    const [surgeFactor, demandLevel] = calculateSurgeFactor(
      driversInProximity,
      ordersInProximity
    );

    // Get current weather condition and its impact
    const weatherData = await weatherService.getCurrentWeather(
      latitude,
      longitude
    );
    const weatherCondition = weatherData.condition;
    const weatherFactor = weatherService.getWeatherImpact(weatherCondition);

    // Calculate final surge multiplier
    let surgeMultiplier = surgeFactor * weatherFactor;
    surgeMultiplier = Math.min(surgeMultiplier, MAX_SURGE_MULTIPLIER);
    surgeMultiplier = Math.max(surgeMultiplier, 1); // Ensure it's never below 1

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
      latitude: latitude,
      longitude: longitude,
    };

    // Save to the database
    const savedSurgePricing = await SurgePricing.create(surgePricingData);

    // Cache the result
    await surgePricingUtils.cache(
      latitude,
      longitude,
      JSON.stringify(savedSurgePricing)
    );

    // Emit the calculated surge pricing
    const io = socket.getIo();
    io.emit("surgePricingUpdate", {
      surgePricingData: savedSurgePricing,
      proximityDrivers,
    });

    return { surgePricingData, proximityDrivers };
  } catch (error) {
    console.error("Error in calculateSurgePricing:", error);
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
    latitude,
    longitude,
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
