const { SurgePricing } = require("../../models");
const { sequelize } = require("../../models");

describe("SurgePricing Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await SurgePricing.destroy({ where: {} });
  });

  it("should create a new SurgePricing record with valid data", async () => {
    const surgePricingData = {
      base_fee: 50.0,
      surge_fee: 25.0,
      total_fee: 75.0,
      surge_multiplier: 1.5,
      demand_level: "High",
      active_orders: 10,
      available_drivers: 5,
      weather_condition: "Clear",
      latitude: 12.9716,
      longitude: 77.5946,
    };

    const surgePricing = await SurgePricing.create(surgePricingData);

    expect(surgePricing.id).toBeDefined();
    expect(Number(surgePricing.base_fee)).toBe(50.0);
    expect(Number(surgePricing.surge_fee)).toBe(25.0);
    expect(Number(surgePricing.total_fee)).toBe(75.0);
    expect(Number(surgePricing.surge_multiplier)).toBeCloseTo(1.5, 1);
    expect(surgePricing.demand_level).toBe("High");
    expect(Number(surgePricing.active_orders)).toBe(10);
    expect(Number(surgePricing.available_drivers)).toBe(5);
    expect(surgePricing.weather_condition).toBe("Clear");
    expect(Number(surgePricing.latitude)).toBeCloseTo(12.9716, 8);
    expect(Number(surgePricing.longitude)).toBeCloseTo(77.5946, 8);
  });

  it("should not create a SurgePricing record with missing required fields", async () => {
    const invalidData = {
      base_fee: 50.0,
      // Missing other required fields
    };

    await expect(SurgePricing.create(invalidData)).rejects.toThrow();
  });

  it("should update an existing SurgePricing record", async () => {
    const surgePricingData = {
      base_fee: 50.0,
      surge_fee: 25.0,
      total_fee: 75.0,
      surge_multiplier: 1.5,
      demand_level: "High",
      active_orders: 10,
      available_drivers: 5,
      weather_condition: "Clear",
      latitude: 12.9716,
      longitude: 77.5946,
    };

    const surgePricing = await SurgePricing.create(surgePricingData);

    const updatedData = {
      surge_multiplier: 2.0,
      demand_level: "Very High",
      active_orders: 15,
    };

    await surgePricing.update(updatedData);

    expect(surgePricing.surge_multiplier).toBe(2.0);
    expect(surgePricing.demand_level).toBe("Very High");
    expect(surgePricing.active_orders).toBe(15);
  });

  it("should delete a SurgePricing record", async () => {
    const surgePricingData = {
      base_fee: 50.0,
      surge_fee: 25.0,
      total_fee: 75.0,
      surge_multiplier: 1.5,
      demand_level: "High",
      active_orders: 10,
      available_drivers: 5,
      weather_condition: "Clear",
      latitude: 12.9716,
      longitude: 77.5946,
    };

    const surgePricing = await SurgePricing.create(surgePricingData);
    const id = surgePricing.id;

    await surgePricing.destroy();

    const deletedSurgePricing = await SurgePricing.findByPk(id);
    expect(deletedSurgePricing).toBeNull();
  });

  it("should not allow negative values for numeric fields", async () => {
    const invalidData = {
      base_fee: -50.0,
      surge_fee: 25.0,
      total_fee: 75.0,
      surge_multiplier: 1.5,
      demand_level: "High",
      active_orders: -10,
      available_drivers: 5,
      weather_condition: "Clear",
      latitude: 12.9716,
      longitude: 77.5946,
    };

    await expect(SurgePricing.create(invalidData)).rejects.toThrow();
  });

  it("should enforce unique constraint on id field", async () => {
    const surgePricingData = {
      base_fee: 50.0,
      surge_fee: 25.0,
      total_fee: 75.0,
      surge_multiplier: 1.5,
      demand_level: "High",
      active_orders: 10,
      available_drivers: 5,
      weather_condition: "Clear",
      latitude: 12.9716,
      longitude: 77.5946,
    };

    const surgePricing1 = await SurgePricing.create(surgePricingData);
    const duplicateData = { ...surgePricingData, id: surgePricing1.id };

    await expect(SurgePricing.create(duplicateData)).rejects.toThrow();
  });

  it("should round decimal values to 2 places for fees and multiplier", async () => {
    const surgePricingData = {
      base_fee: 50.123,
      surge_fee: 25.456,
      total_fee: 75.579,
      surge_multiplier: 1.5123,
      demand_level: "High",
      active_orders: 10,
      available_drivers: 5,
      weather_condition: "Clear",
      latitude: 12.9716,
      longitude: 77.5946,
    };

    const surgePricing = await SurgePricing.create(surgePricingData);

    expect(Number(surgePricing.base_fee)).toBe(50.12);
    expect(Number(surgePricing.surge_fee)).toBe(25.46);
    expect(Number(surgePricing.total_fee)).toBe(75.58);
    expect(Number(surgePricing.surge_multiplier)).toBeCloseTo(1.51, 1);
  });
});
