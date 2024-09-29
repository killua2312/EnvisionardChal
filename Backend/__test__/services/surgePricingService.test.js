const {
  calculateSurgePricing,
  simulateSurgePricing,
} = require("../../services/surgePricingService");
const { SurgePricing } = require("../../models");
const { surgePricingUtils } = require("../../utils/redisModeUtils");
const {
  getAvailableDriversInProximity,
  getActiveOrdersInProximity,
} = require("../../utils/proximityUtils");
const weatherService = require("../../services/weatherService");
const socket = require("../../socket");

jest.mock("../../models");
jest.mock("../../utils/redisModeUtils");
jest.mock("../../utils/proximityUtils");
jest.mock("../../services/weatherService");
jest.mock("../../socket");

describe("surgePricingService", () => {
  const mockLatitude = 12.9716;
  const mockLongitude = 77.5946;

  beforeEach(() => {
    jest.clearAllMocks();
    socket.getIo.mockReturnValue({ emit: jest.fn() });
  });

  describe("calculateSurgePricing", () => {
    it("should calculate surge pricing correctly when demand is high", async () => {
      getActiveOrdersInProximity.mockResolvedValue({ totalInProximity: 20 });
      getAvailableDriversInProximity.mockResolvedValue({
        totalInProximity: 5,
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      });
      weatherService.getCurrentWeather.mockResolvedValue({
        condition: "Clear",
      });
      weatherService.getWeatherImpact.mockReturnValue(1.0);

      const mockSavedPricing = {
        base_fee: 5.0,
        surge_fee: 7.5,
        total_fee: 12.5,
        surge_multiplier: 2.5,
        demand_level: "Extreme",
        active_orders: 20,
        available_drivers: 5,
        weather_condition: "Clear",
        latitude: mockLatitude,
        longitude: mockLongitude,
      };
      SurgePricing.create.mockResolvedValue(mockSavedPricing);

      const result = await calculateSurgePricing(mockLatitude, mockLongitude);

      expect(result).toEqual({
        surgePricingData: expect.objectContaining(mockSavedPricing),
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      });
      expect(SurgePricing.create).toHaveBeenCalledWith(
        expect.objectContaining(mockSavedPricing)
      );
      expect(surgePricingUtils.cache).toHaveBeenCalledWith(
        mockLatitude,
        mockLongitude,
        expect.any(String)
      );
      expect(socket.getIo().emit).toHaveBeenCalledWith("surgePricingUpdate", {
        surgePricingData: expect.objectContaining(mockSavedPricing),
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      });
    });

    it("should calculate surge pricing correctly when demand is low", async () => {
      getActiveOrdersInProximity.mockResolvedValue({ totalInProximity: 5 });
      getAvailableDriversInProximity.mockResolvedValue({
        totalInProximity: 20,
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      });
      weatherService.getCurrentWeather.mockResolvedValue({
        condition: "Clear",
      });
      weatherService.getWeatherImpact.mockReturnValue(1.0);

      const mockSavedPricing = {
        base_fee: 5.0,
        surge_fee: 0,
        total_fee: 5.0,
        surge_multiplier: 1.0,
        demand_level: "Very Low",
        active_orders: 5,
        available_drivers: 20,
        weather_condition: "Clear",
        latitude: mockLatitude,
        longitude: mockLongitude,
      };
      SurgePricing.create.mockResolvedValue(mockSavedPricing);

      const result = await calculateSurgePricing(mockLatitude, mockLongitude);

      expect(result).toEqual({
        surgePricingData: expect.objectContaining(mockSavedPricing),
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      });
    });

    it("should handle weather impact on surge pricing", async () => {
      getActiveOrdersInProximity.mockResolvedValue({ totalInProximity: 10 });
      getAvailableDriversInProximity.mockResolvedValue({
        totalInProximity: 10,
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      });
      weatherService.getCurrentWeather.mockResolvedValue({ condition: "Rain" });
      weatherService.getWeatherImpact.mockReturnValue(1.3);

      const result = await calculateSurgePricing(mockLatitude, mockLongitude);

      expect(result).toEqual({
        surgePricingData: expect.objectContaining({
          base_fee: 5.0,
          surge_fee: expect.any(Number),
          total_fee: expect.any(Number),
          surge_multiplier: expect.any(Number),
          demand_level: "Normal",
          active_orders: 10,
          available_drivers: 10,
          weather_condition: "Rain",
          latitude: mockLatitude,
          longitude: mockLongitude,
        }),
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      });
    });

    it("should handle errors and throw them", async () => {
      getActiveOrdersInProximity.mockRejectedValue(new Error("Database error"));

      await expect(
        calculateSurgePricing(mockLatitude, mockLongitude)
      ).rejects.toThrow("Database error");
    });
  });

  describe("simulateSurgePricing", () => {
    it("should simulate surge pricing correctly", async () => {
      const simulateData = {
        driversInProximity: 10,
        ordersInProximity: 20,
        weatherCondition: "Rain",
      };

      weatherService.getWeatherImpact.mockReturnValue(1.3);

      const result = await simulateSurgePricing(simulateData);

      expect(result).toEqual(
        expect.objectContaining({
          base_fee: 5.0,
          surge_fee: expect.any(Number),
          total_fee: expect.any(Number),
          surge_multiplier: expect.any(Number),
          demand_level: expect.any(String),
          active_orders: 20,
          available_drivers: 10,
          weather_condition: "Rain",
        })
      );
      expect(socket.getIo().emit).toHaveBeenCalledWith(
        "simulateSurgePrice",
        expect.objectContaining({
          base_fee: 5.0,
          surge_fee: expect.any(Number),
          total_fee: expect.any(Number),
          surge_multiplier: expect.any(Number),
          demand_level: expect.any(String),
          active_orders: 20,
          available_drivers: 10,
          weather_condition: "Rain",
        })
      );
    });

    it("should cap surge multiplier at maximum value", async () => {
      const simulateData = {
        driversInProximity: 1,
        ordersInProximity: 100,
        weatherCondition: "Thunderstorm",
      };

      weatherService.getWeatherImpact.mockReturnValue(1.7);

      const result = await simulateSurgePricing(simulateData);

      expect(result.surge_multiplier).toBeLessThanOrEqual(2.5);
    });

    it("should handle minimum surge multiplier of 1", async () => {
      const simulateData = {
        driversInProximity: 100,
        ordersInProximity: 1,
        weatherCondition: "Clear",
      };

      weatherService.getWeatherImpact.mockReturnValue(1.0);

      const result = await simulateSurgePricing(simulateData);

      expect(result.surge_multiplier).toBeGreaterThanOrEqual(1);
    });
  });
});
