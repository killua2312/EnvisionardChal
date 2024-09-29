const { Driver } = require("../../models");
const { driverUtils } = require("../../utils/driverUtils");
const driverService = require("../../services/driverService");
const socket = require("../../socket");

// Mock the dependencies
jest.mock("../../models", () => ({
  Driver: {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock("../../utils/driverUtils", () => ({
  driverUtils: {
    updateDriver: jest.fn(),
    getAllAvailableDriverIds: jest.fn(),
    getDriver: jest.fn(),
    updateDriverStatus: jest.fn(),
    updateDriverLocation: jest.fn(),
  },
}));

jest.mock("../../socket", () => ({
  getIo: jest.fn(),
}));

describe("driverService", () => {
  const mockIo = {
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    socket.getIo.mockReturnValue(mockIo);
  });

  describe("createDriver", () => {
    it("should create a new driver and update Redis", async () => {
      const driverData = {
        name: "John Doe",
        status: "available",
        current_latitude: 40.7128,
        current_longitude: -74.006,
      };
      const createdDriver = { id: "driver123", ...driverData };
      Driver.create.mockResolvedValue(createdDriver);

      const result = await driverService.createDriver(driverData);

      expect(Driver.create).toHaveBeenCalledWith(driverData);
      expect(driverUtils.updateDriver).toHaveBeenCalledWith(
        createdDriver.id,
        createdDriver.status,
        createdDriver.current_latitude,
        createdDriver.current_longitude
      );
      expect(mockIo.emit).toHaveBeenCalledWith("driversUpdate", createdDriver);
      expect(result).toEqual(createdDriver);
    });

    it("should throw an error if driver creation fails", async () => {
      const driverData = {
        name: "John Doe",
        status: "available",
        current_latitude: 40.7128,
        current_longitude: -74.006,
      };
      const error = new Error("Driver creation failed");
      Driver.create.mockRejectedValue(error);

      await expect(driverService.createDriver(driverData)).rejects.toThrow(
        "Driver creation failed"
      );
    });
  });

  describe("getAllAvailableDrivers", () => {
    it("should return all available drivers from Redis", async () => {
      const availableDriverIds = ["driver1", "driver2"];
      const driver1 = {
        id: "driver1",
        status: "available",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const driver2 = {
        id: "driver2",
        status: "available",
        latitude: 40.7129,
        longitude: -74.0061,
      };

      driverUtils.getAllAvailableDriverIds.mockResolvedValue(
        availableDriverIds
      );
      driverUtils.getDriver.mockImplementation((id) => {
        if (id === "driver1") return Promise.resolve(driver1);
        if (id === "driver2") return Promise.resolve(driver2);
        return Promise.resolve(null);
      });

      const result = await driverService.getAllAvailableDrivers();

      expect(driverUtils.getAllAvailableDriverIds).toHaveBeenCalled();
      expect(driverUtils.getDriver).toHaveBeenCalledTimes(2);
      expect(result).toEqual([driver1, driver2]);
    });

    it("should fetch drivers from database if Redis is empty", async () => {
      const availableDrivers = [
        {
          id: "driver1",
          status: "available",
          current_latitude: 40.7128,
          current_longitude: -74.006,
        },
        {
          id: "driver2",
          status: "available",
          current_latitude: 40.7129,
          current_longitude: -74.0061,
        },
      ];

      driverUtils.getAllAvailableDriverIds.mockResolvedValue([]);
      Driver.findAll.mockResolvedValue(availableDrivers);

      const result = await driverService.getAllAvailableDrivers();

      expect(Driver.findAll).toHaveBeenCalledWith({
        where: { status: "available" },
      });
      expect(driverUtils.updateDriver).toHaveBeenCalledTimes(2);
      expect(result).toEqual(
        availableDrivers.map((driver) => ({
          id: driver.id,
          status: driver.status,
          latitude: driver.current_latitude,
          longitude: driver.current_longitude,
        }))
      );
    });
  });

  describe("updateDriverStatus", () => {
    it("should update driver status in database and Redis", async () => {
      const driverId = "driver123";
      const newStatus = "unavailable";
      const updatedDriver = { id: driverId, status: newStatus };

      Driver.update.mockResolvedValue([1]);
      Driver.findByPk.mockResolvedValue(updatedDriver);

      const result = await driverService.updateDriverStatus(
        driverId,
        newStatus
      );

      expect(Driver.update).toHaveBeenCalledWith(
        { status: newStatus },
        { where: { id: driverId } }
      );
      expect(driverUtils.updateDriverStatus).toHaveBeenCalledWith(
        driverId,
        newStatus
      );
      expect(mockIo.emit).toHaveBeenCalledWith("driversUpdate", {
        driverId,
        newStatus,
      });
      expect(result).toEqual(updatedDriver);
    });

    it("should throw an error if driver is not found", async () => {
      const driverId = "nonexistent";
      const newStatus = "unavailable";

      Driver.update.mockResolvedValue([0]);

      await expect(
        driverService.updateDriverStatus(driverId, newStatus)
      ).rejects.toThrow(`Driver with id ${driverId} not found`);
    });
  });

  describe("updateDriverLocation", () => {
    it("should update driver location in database and Redis", async () => {
      const driverId = "driver123";
      const newLatitude = 40.7128;
      const newLongitude = -74.006;
      const updatedDriver = {
        id: driverId,
        current_latitude: newLatitude,
        current_longitude: newLongitude,
      };

      Driver.update.mockResolvedValue([1]);
      Driver.findByPk.mockResolvedValue(updatedDriver);

      const result = await driverService.updateDriverLocation(
        driverId,
        newLatitude,
        newLongitude
      );

      expect(Driver.update).toHaveBeenCalledWith(
        { current_latitude: newLatitude, current_longitude: newLongitude },
        { where: { id: driverId } }
      );
      expect(driverUtils.updateDriverLocation).toHaveBeenCalledWith(
        driverId,
        newLatitude,
        newLongitude
      );
      expect(mockIo.emit).toHaveBeenCalledWith("driversUpdate", {
        driverId,
        latitude: newLatitude,
        longitude: newLongitude,
      });
      expect(result).toEqual(updatedDriver);
    });

    it("should throw an error if driver is not found", async () => {
      const driverId = "nonexistent";
      const newLatitude = 40.7128;
      const newLongitude = -74.006;

      Driver.update.mockResolvedValue([0]);

      await expect(
        driverService.updateDriverLocation(driverId, newLatitude, newLongitude)
      ).rejects.toThrow(`Driver with id ${driverId} not found`);
    });
  });
});
