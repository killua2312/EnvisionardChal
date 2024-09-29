const { Order } = require("../../models");
const { orderUtils } = require("../../utils/orderUtils");
const socket = require("../../socket");
const orderService = require("../../services/orderService");

// Mock the dependencies
jest.mock("../../models", () => ({
  Order: {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock("../../utils/orderUtils", () => ({
  orderUtils: {
    updateOrder: jest.fn(),
    getAllActiveOrderIds: jest.fn(),
    getOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  },
}));

jest.mock("../../socket", () => ({
  getIo: jest.fn(() => ({
    emit: jest.fn(),
  })),
}));

describe("orderService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create a new order successfully", async () => {
      const mockOrder = {
        id: "order123",
        status: "active",
        customer_latitude: 40.7128,
        customer_longitude: -74.006,
      };
      Order.create.mockResolvedValue(mockOrder);

      const result = await orderService.createOrder(mockOrder);

      expect(Order.create).toHaveBeenCalledWith(mockOrder);
      expect(orderUtils.updateOrder).toHaveBeenCalledWith(
        "order123",
        "active",
        40.7128,
        -74.006
      );
      expect(result).toEqual(mockOrder);
    });

    it("should handle errors when creating an order", async () => {
      Order.create.mockRejectedValue(new Error("Database error"));

      await expect(orderService.createOrder({})).rejects.toThrow(
        "Error in createOrder: Database error"
      );
    });
  });

  describe("getAllActiveOrders", () => {
    it("should return all active orders", async () => {
      const mockActiveOrderIds = ["order1", "order2"];
      const mockOrders = [
        {
          id: "order1",
          status: "active",
          customer_latitude: 40.7128,
          customer_longitude: -74.006,
        },
        {
          id: "order2",
          status: "active",
          customer_latitude: 40.7129,
          customer_longitude: -74.0061,
        },
      ];

      orderUtils.getAllActiveOrderIds.mockResolvedValue(mockActiveOrderIds);
      orderUtils.getOrder.mockImplementation((id) => {
        const order = mockOrders.find((order) => order.id === id);
        return Promise.resolve({
          ...order,
          latitude: order.customer_latitude,
          longitude: order.customer_longitude,
        });
      });

      const result = await orderService.getAllActiveOrders();

      expect(result).toEqual([
        {
          id: "order1",
          status: "active",
          latitude: 40.7128,
          longitude: -74.006,
        },
        {
          id: "order2",
          status: "active",
          latitude: 40.7129,
          longitude: -74.0061,
        },
      ]);
    });

    it("should handle empty active orders", async () => {
      orderUtils.getAllActiveOrderIds.mockResolvedValue([]);
      Order.findAll.mockResolvedValue([]);

      const result = await orderService.getAllActiveOrders();

      expect(result).toEqual([]);
    });

    it("should handle errors when fetching active orders", async () => {
      orderUtils.getAllActiveOrderIds.mockRejectedValue(
        new Error("Redis error")
      );

      await expect(orderService.getAllActiveOrders()).rejects.toThrow(
        "Error in getAllActiveOrders"
      );
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      const mockOrder = {
        id: "order123",
        status: "active",
        customer_latitude: 40.7128,
        customer_longitude: -74.006,
      };
      Order.update.mockResolvedValue([1]);
      Order.findByPk.mockResolvedValue(mockOrder);

      await orderService.updateOrderStatus("order123", { status: "delivered" });

      expect(Order.update).toHaveBeenCalledWith(
        { status: "delivered" },
        { where: { id: "order123" } }
      );
      expect(orderUtils.updateOrderStatus).toHaveBeenCalledWith(
        "order123",
        "delivered"
      );
    });

    it("should throw an error if order is not found", async () => {
      Order.update.mockResolvedValue([0]);

      await expect(
        orderService.updateOrderStatus("nonexistent", { status: "delivered" })
      ).rejects.toThrow("Order with id nonexistent not found");
    });

    it("should handle errors when updating order status", async () => {
      Order.update.mockRejectedValue(new Error("Database error"));

      await expect(
        orderService.updateOrderStatus("order123", { status: "delivered" })
      ).rejects.toThrow(
        "Error in updateOrderStatus for order order123: Database error"
      );
    });
  });

  describe("normalizeOrderFormat", () => {
    it("should normalize order format correctly", () => {
      const input = {
        id: "order123",
        status: "active",
        latitude: "40.7128",
        longitude: "-74.0060",
      };

      const result = orderService.normalizeOrderFormat(input);

      expect(result).toEqual({
        id: "order123",
        status: "active",
        latitude: 40.7128,
        longitude: -74.006,
      });
    });
  });
});
