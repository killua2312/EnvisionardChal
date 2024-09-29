const driverController = require("../../controllers/driverController");
const driverService = require("../../services/driverService");

// Mock the driverService
jest.mock("../../services/driverService");

describe("driverController", () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createDriver", () => {
    it("should create a driver and return 201 status", async () => {
      const driverData = {
        name: "John Doe",
        email: "john@example.com",
        status: "available",
      };
      mockRequest.body = driverData;
      const createdDriver = { id: "driver123", ...driverData };
      driverService.createDriver.mockResolvedValue(createdDriver);

      await driverController.createDriver(mockRequest, mockResponse);

      expect(driverService.createDriver).toHaveBeenCalledWith(driverData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdDriver);
    });

    it("should handle errors and return 500 status", async () => {
      const error = new Error("Database error");
      driverService.createDriver.mockRejectedValue(error);

      await driverController.createDriver(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("getAllAvailableDrivers", () => {
    it("should return all available drivers", async () => {
      const availableDrivers = [
        { id: "driver1", name: "John Doe", status: "available" },
        { id: "driver2", name: "Jane Doe", status: "available" },
      ];
      driverService.getAllAvailableDrivers.mockResolvedValue(availableDrivers);

      await driverController.getAllAvailableDrivers(mockRequest, mockResponse);

      expect(driverService.getAllAvailableDrivers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(availableDrivers);
    });

    it("should handle errors and return 500 status", async () => {
      const error = new Error("Database error");
      driverService.getAllAvailableDrivers.mockRejectedValue(error);

      await driverController.getAllAvailableDrivers(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("updateDriverLocation", () => {
    it("should update driver location and return updated driver", async () => {
      const driverId = "driver123";
      const latitude = 40.7128;
      const longitude = -74.006;
      mockRequest.params = { driverId };
      mockRequest.body = { latitude, longitude };
      const updatedDriver = { id: driverId, latitude, longitude };
      driverService.updateDriverLocation.mockResolvedValue(updatedDriver);

      await driverController.updateDriverLocation(mockRequest, mockResponse);

      expect(driverService.updateDriverLocation).toHaveBeenCalledWith(
        driverId,
        latitude,
        longitude
      );
      expect(mockResponse.json).toHaveBeenCalledWith(driverId);
    });

    it("should handle not found error and return 404 status", async () => {
      const driverId = "nonexistent";
      mockRequest.params = { driverId };
      mockRequest.body = { latitude: 40.7128, longitude: -74.006 };
      const error = new Error("Driver not found");
      driverService.updateDriverLocation.mockRejectedValue(error);

      await driverController.updateDriverLocation(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });

    it("should handle other errors and return 500 status", async () => {
      const driverId = "driver123";
      mockRequest.params = { driverId };
      mockRequest.body = { latitude: 40.7128, longitude: -74.006 };
      const error = new Error("Database error");
      driverService.updateDriverLocation.mockRejectedValue(error);

      await driverController.updateDriverLocation(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("updateDriverStatus", () => {
    it("should update driver status and return updated driver", async () => {
      const driverId = "driver123";
      const status = "unavailable";
      mockRequest.params = { driverId };
      mockRequest.body = { status };
      const updatedDriver = { id: driverId, status };
      driverService.updateDriverStatus.mockResolvedValue(updatedDriver);

      await driverController.updateDriverStatus(mockRequest, mockResponse);

      expect(driverService.updateDriverStatus).toHaveBeenCalledWith(
        driverId,
        status
      );
      expect(mockResponse.json).toHaveBeenCalledWith(driverId);
    });

    it("should handle not found error and return 404 status", async () => {
      const driverId = "nonexistent";
      mockRequest.params = { driverId };
      mockRequest.body = { status: "unavailable" };
      const error = new Error("Driver not found");
      driverService.updateDriverStatus.mockRejectedValue(error);

      await driverController.updateDriverStatus(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });

    it("should handle other errors and return 500 status", async () => {
      const driverId = "driver123";
      mockRequest.params = { driverId };
      mockRequest.body = { status: "unavailable" };
      const error = new Error("Database error");
      driverService.updateDriverStatus.mockRejectedValue(error);

      await driverController.updateDriverStatus(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
