const surgePricingController = require("../../controllers/surgePricingController");
const surgePricingService = require("../../services/surgePricingService");

// Mock the surgePricingService
jest.mock("../../services/surgePricingService");

describe("surgePricingController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getSurgePricing", () => {
    it("should return surge pricing data for valid input", async () => {
      req.body = { latitude: 12.9716, longitude: 77.5946 };
      const mockSurgePricingData = {
        surgePricingData: {
          base_fee: 50,
          surge_fee: 25,
          total_fee: 75,
          surge_multiplier: 1.5,
        },
        proximityDrivers: [{ id: "driver1" }, { id: "driver2" }],
      };
      surgePricingService.calculateSurgePricing.mockResolvedValue(
        mockSurgePricingData
      );

      await surgePricingController.getSurgePricing(req, res);

      expect(surgePricingService.calculateSurgePricing).toHaveBeenCalledWith(
        12.9716,
        77.5946
      );
      expect(res.json).toHaveBeenCalledWith(mockSurgePricingData);
    });

    it("should return 400 error for missing latitude", async () => {
      req.body = { longitude: 77.5946 };

      await surgePricingController.getSurgePricing(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Latitude and longitude are required",
      });
    });

    it("should return 400 error for missing longitude", async () => {
      req.body = { latitude: 12.9716 };

      await surgePricingController.getSurgePricing(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Latitude and longitude are required",
      });
    });

    it("should return 400 error for invalid latitude", async () => {
      req.body = { latitude: "invalid", longitude: 77.5946 };

      await surgePricingController.getSurgePricing(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid latitude or longitude",
      });
    });

    it("should return 400 error for invalid longitude", async () => {
      req.body = { latitude: 12.9716, longitude: "invalid" };

      await surgePricingController.getSurgePricing(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid latitude or longitude",
      });
    });

    it("should return 500 error when service throws an error", async () => {
      req.body = { latitude: 12.9716, longitude: 77.5946 };
      surgePricingService.calculateSurgePricing.mockRejectedValue(
        new Error("Service error")
      );

      await surgePricingController.getSurgePricing(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("getSimulatedPricing", () => {
    it("should return 202 status for valid simulation request", async () => {
      req.body = {
        driversInProximity: 10,
        ordersInProximity: 20,
        weatherCondition: "Rainy",
      };
      const mockSimulatedData = {
        base_fee: 50,
        surge_fee: 25,
        total_fee: 75,
        surge_multiplier: 1.5,
      };
      surgePricingService.simulateSurgePricing.mockResolvedValue(
        mockSimulatedData
      );

      await surgePricingController.getSimulatedPricing(req, res);

      expect(surgePricingService.simulateSurgePricing).toHaveBeenCalledWith(
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        message: "Simulated surge pricing calculation initiated",
      });
    });

    it("should return 500 error when simulation service throws an error", async () => {
      req.body = {
        driversInProximity: 10,
        ordersInProximity: 20,
        weatherCondition: "Rainy",
      };
      surgePricingService.simulateSurgePricing.mockRejectedValue(
        new Error("Simulation error")
      );

      await surgePricingController.getSimulatedPricing(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });
});
