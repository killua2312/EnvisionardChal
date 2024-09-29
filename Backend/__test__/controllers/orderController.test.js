const orderController = require("../../controllers/orderController");
const orderService = require("../../services/orderService");

// Mock the orderService
jest.mock("../../services/orderService");

describe("orderController", () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create a new order successfully", async () => {
      const mockOrderData = { id: "order123", status: "active" };
      mockRequest.body = mockOrderData;
      orderService.createOrder.mockResolvedValue(mockOrderData);

      await orderController.createOrder(mockRequest, mockResponse);

      expect(orderService.createOrder).toHaveBeenCalledWith(mockOrderData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderData);
    });

    it("should handle errors when creating an order", async () => {
      mockRequest.body = {};
      orderService.createOrder.mockRejectedValue(new Error("Creation failed"));

      await orderController.createOrder(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("getAllActiveOrders", () => {
    it("should return all active orders successfully", async () => {
      const mockActiveOrders = [
        { id: "order123", status: "active" },
        { id: "order456", status: "active" },
      ];
      orderService.getAllActiveOrders.mockResolvedValue(mockActiveOrders);

      await orderController.getAllActiveOrders(mockRequest, mockResponse);

      expect(orderService.getAllActiveOrders).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockActiveOrders);
    });

    it("should handle errors when fetching active orders", async () => {
      orderService.getAllActiveOrders.mockRejectedValue(
        new Error("Fetch failed")
      );

      await orderController.getAllActiveOrders(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      const mockRequest = {
        params: { orderId: "order123" },
        body: { status: "delivered" },
      };
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const mockUpdatedOrder = {
        id: "order123",
        status: "delivered",
      };

      orderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      await orderController.updateOrderStatus(mockRequest, mockResponse);

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith("order123", {
        status: "delivered",
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedOrder);
    });

    it("should handle not found error when updating order status", async () => {
      mockRequest.params = { orderId: "nonexistent" };
      mockRequest.body = { status: "delivered" };
      orderService.updateOrderStatus.mockRejectedValue(
        new Error("Order with id nonexistent not found")
      );

      await orderController.updateOrderStatus(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Order with id nonexistent not found",
      });
    });

    it("should handle other errors when updating order status", async () => {
      mockRequest.params = { orderId: "order123" };
      mockRequest.body = { status: "delivered" };
      orderService.updateOrderStatus.mockRejectedValue(
        new Error("Update failed")
      );

      await orderController.updateOrderStatus(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
