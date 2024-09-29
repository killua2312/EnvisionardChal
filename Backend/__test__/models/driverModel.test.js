const { Driver, sequelize } = require("../../models");

describe("Driver Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Driver.destroy({ where: {}, truncate: true });
  });

  it("should create a driver successfully", async () => {
    const driverData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      status: "available",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    };

    const driver = await Driver.create(driverData);

    expect(driver.id).toBeDefined();
    expect(driver.name).toBe(driverData.name);
    expect(driver.email).toBe(driverData.email);
    expect(driver.phone).toBe(driverData.phone);
    expect(driver.status).toBe(driverData.status);
    expect(parseFloat(driver.current_latitude)).toBe(
      driverData.current_latitude
    );
    expect(parseFloat(driver.current_longitude)).toBe(
      driverData.current_longitude
    );
  });

  it("should not create a driver without required fields", async () => {
    const incompleteDriverData = {
      name: "Jane Doe",
      // Missing email, status, current_latitude, current_longitude
    };

    await expect(Driver.create(incompleteDriverData)).rejects.toThrow();
  });

  it("should not create a driver with invalid email", async () => {
    const invalidEmailDriver = {
      name: "Invalid Email",
      email: "notanemail",
      status: "available",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    };

    await expect(Driver.create(invalidEmailDriver)).rejects.toThrow();
  });

  it("should not create a driver with invalid status", async () => {
    const invalidStatusDriver = {
      name: "Invalid Status",
      email: "invalid@example.com",
      status: "invalid_status",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    };

    await expect(Driver.create(invalidStatusDriver)).rejects.toThrow();
  });

  it("should update driver information", async () => {
    const driver = await Driver.create({
      name: "Update Test",
      email: "update@example.com",
      status: "available",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    });

    const updatedData = {
      name: "Updated Name",
      status: "unavailable",
      current_latitude: 41.8781,
      current_longitude: -87.6298,
    };

    await driver.update(updatedData);

    const updatedDriver = await Driver.findByPk(driver.id);

    expect(updatedDriver.name).toBe(updatedData.name);
    expect(updatedDriver.status).toBe(updatedData.status);
    expect(parseFloat(updatedDriver.current_latitude)).toBe(
      updatedData.current_latitude
    );
    expect(parseFloat(updatedDriver.current_longitude)).toBe(
      updatedData.current_longitude
    );
  });

  it("should delete a driver", async () => {
    const driver = await Driver.create({
      name: "Delete Test",
      email: "delete@example.com",
      status: "available",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    });

    await driver.destroy();

    const deletedDriver = await Driver.findByPk(driver.id);
    expect(deletedDriver).toBeNull();
  });

  it("should find a driver by email", async () => {
    const driverData = {
      name: "Find Test",
      email: "find@example.com",
      status: "available",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    };

    await Driver.create(driverData);

    const foundDriver = await Driver.findOne({
      where: { email: driverData.email },
    });

    expect(foundDriver).not.toBeNull();
    expect(foundDriver.name).toBe(driverData.name);
  });

  it("should find all available drivers", async () => {
    await Driver.bulkCreate([
      {
        name: "Available 1",
        email: "available1@example.com",
        status: "available",
        current_latitude: 40.7128,
        current_longitude: -74.006,
      },
      {
        name: "Available 2",
        email: "available2@example.com",
        status: "available",
        current_latitude: 41.8781,
        current_longitude: -87.6298,
      },
      {
        name: "Unavailable",
        email: "unavailable@example.com",
        status: "unavailable",
        current_latitude: 34.0522,
        current_longitude: -118.2437,
      },
    ]);

    const availableDrivers = await Driver.findAll({
      where: { status: "available" },
    });

    expect(availableDrivers.length).toBe(2);
    expect(availableDrivers[0].status).toBe("available");
    expect(availableDrivers[1].status).toBe("available");
  });

  it("should handle phone number as optional", async () => {
    const driverWithoutPhone = {
      name: "No Phone",
      email: "nophone@example.com",
      status: "available",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    };

    const driver = await Driver.create(driverWithoutPhone);

    expect(driver.id).toBeDefined();
    expect(driver.phone).toBeNull();
  });

  it("should enforce unique email constraint", async () => {
    const driverData = {
      name: "Unique Email",
      email: "unique@example.com",
      status: "available",
      current_latitude: 40.7128,
      current_longitude: -74.006,
    };

    await Driver.create(driverData);

    await expect(Driver.create(driverData)).rejects.toThrow();
  });
});
