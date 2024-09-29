const { Order } = require("../../models");
const { sequelize } = require("../../models");

describe("Order Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await Order.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should create a new order successfully", async () => {
    const orderData = {
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      restaurant_latitude: 40.7112,
      restaurant_longitude: -74.0055,
      status: "active",
      total_amount: 25.5,
    };

    const order = await Order.create(orderData);
    expect(order.id).toBeDefined();
    expect(Number(order.customer_latitude)).toBeCloseTo(40.7128, 8);
    expect(Number(order.customer_longitude)).toBeCloseTo(-74.006, 8);
    expect(Number(order.restaurant_latitude)).toBeCloseTo(40.7112, 8);
    expect(Number(order.restaurant_longitude)).toBeCloseTo(-74.0055, 8);
    expect(order.status).toBe("active");
    expect(Number(order.total_amount)).toBeCloseTo(25.5, 2);
    expect(order.driver_id).toBeNull();
    expect(order.order_time).toBeDefined();
  });

  it("should not create an order with invalid status", async () => {
    const orderData = {
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      restaurant_latitude: 40.7112,
      restaurant_longitude: -74.0055,
      status: "invalid_status",
      total_amount: 25.5,
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it("should not create an order with missing required fields", async () => {
    const orderData = {
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      // missing restaurant_latitude and restaurant_longitude
      status: "active",
      total_amount: 25.5,
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it("should not update an order with invalid status", async () => {
    const order = await Order.create({
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      restaurant_latitude: 40.7112,
      restaurant_longitude: -74.0055,
      status: "active",
      total_amount: 25.5,
    });

    await expect(order.update({ status: "invalid_status" })).rejects.toThrow();
  });

  it("should delete an existing order", async () => {
    const order = await Order.create({
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      restaurant_latitude: 40.7112,
      restaurant_longitude: -74.0055,
      status: "active",
      total_amount: 25.5,
    });

    await order.destroy();
    const deletedOrder = await Order.findByPk(order.id);
    expect(deletedOrder).toBeNull();
  });

  it("should find an order by its primary key", async () => {
    const createdOrder = await Order.create({
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      restaurant_latitude: 40.7112,
      restaurant_longitude: -74.0055,
      status: "active",
      total_amount: 25.5,
    });

    const foundOrder = await Order.findByPk(createdOrder.id);
    expect(foundOrder).toBeDefined();
    expect(foundOrder.id).toBe(createdOrder.id);
  });

  it("should find all active orders", async () => {
    await Order.create({
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      restaurant_latitude: 40.7112,
      restaurant_longitude: -74.0055,
      status: "active",
      total_amount: 25.5,
    });

    await Order.create({
      customer_latitude: 40.7129,
      customer_longitude: -74.0061,
      restaurant_latitude: 40.7113,
      restaurant_longitude: -74.0056,
      status: "active",
      total_amount: 30.0,
    });

    await Order.create({
      customer_latitude: 40.713,
      customer_longitude: -74.0062,
      restaurant_latitude: 40.7114,
      restaurant_longitude: -74.0057,
      status: "delivered",
      total_amount: 35.5,
    });

    const activeOrders = await Order.findAll({ where: { status: "active" } });
    expect(activeOrders.length).toBe(2);
    expect(activeOrders[0].status).toBe("active");
    expect(activeOrders[1].status).toBe("active");
  });

  it("should correctly use the default value for order_time", async () => {
    const order = await Order.create({
      customer_latitude: 40.7128,
      customer_longitude: -74.006,
      restaurant_latitude: 40.7112,
      restaurant_longitude: -74.0055,
      status: "active",
      total_amount: 25.5,
    });

    expect(order.order_time).toBeDefined();
    expect(order.order_time instanceof Date).toBeTruthy();
    expect(Math.abs(new Date() - order.order_time)).toBeLessThan(1000); // within 1 second
  });

  it("should correctly handle decimal values for latitude and longitude", async () => {
    const order = await Order.create({
      customer_latitude: 40.7128123,
      customer_longitude: -74.0060456,
      restaurant_latitude: 40.7112789,
      restaurant_longitude: -74.0055321,
      status: "active",
      total_amount: 25.5,
    });

    expect(Number(order.customer_latitude)).toBeCloseTo(40.7128123, 8);
    expect(Number(order.customer_longitude)).toBeCloseTo(-74.0060456, 8);
    expect(Number(order.restaurant_latitude)).toBeCloseTo(40.7112789, 8);
    expect(Number(order.restaurant_longitude)).toBeCloseTo(-74.0055321, 8);
  });

  it("should not allow total_amount to be negative", async () => {
    await expect(
      Order.create({
        customer_latitude: 40.7128,
        customer_longitude: -74.006,
        restaurant_latitude: 40.7112,
        restaurant_longitude: -74.0055,
        status: "active",
        total_amount: -25.5,
      })
    ).rejects.toThrow("Validation error: Total amount must be non-negative");
  });
});
