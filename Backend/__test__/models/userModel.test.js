const { User } = require("../../models");
const { sequelize } = require("../../models");
const { v4: uuidv4 } = require("uuid");

describe("User Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should create a new user", async () => {
    const user = await User.create({
      id: uuidv4(),
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "manager",
    });

    expect(user.id).toBeDefined();
    expect(user.username).toBe("testuser");
    expect(user.email).toBe("test@example.com");
    expect(user.role).toBe("manager");
    expect(user.password).toBe("password123");
  });

  it("should not create a user with invalid email", async () => {
    await expect(
      User.create({
        id: uuidv4(),
        username: "testuser",
        email: "invalid-email",
        password: "password123",
        role: "manager",
      })
    ).rejects.toThrow();
  });

  it("should not create a user with duplicate email", async () => {
    await User.create({
      id: uuidv4(),
      username: "user1",
      email: "duplicate@example.com",
      password: "password123",
      role: "manager",
    });

    await expect(
      User.create({
        id: uuidv4(),
        username: "user2",
        email: "duplicate@example.com",
        password: "password456",
        role: "admin",
      })
    ).rejects.toThrow();
  });

  it("should not create a user with username less than 3 characters", async () => {
    await expect(
      User.create({
        id: uuidv4(),
        username: "ab",
        email: "short@example.com",
        password: "password123",
        role: "manager",
      })
    ).rejects.toThrow();
  });

  it("should not create a user with password less than 8 characters", async () => {
    await expect(
      User.create({
        id: uuidv4(),
        username: "testuser",
        email: "weak@example.com",
        password: "weak",
        role: "manager",
      })
    ).rejects.toThrow();
  });

  it("should not create a user with invalid role", async () => {
    await expect(
      User.create({
        id: uuidv4(),
        username: "testuser",
        email: "invalid-role@example.com",
        password: "password123",
        role: "invalid-role",
      })
    ).rejects.toThrow();
  });

  it("should update user information", async () => {
    const user = await User.create({
      id: uuidv4(),
      username: "updateuser",
      email: "update@example.com",
      password: "password123",
      role: "manager",
    });

    user.username = "updateduser";
    await user.save();

    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser.username).toBe("updateduser");
  });

  it("should delete a user", async () => {
    const user = await User.create({
      id: uuidv4(),
      username: "deleteuser",
      email: "delete@example.com",
      password: "password123",
      role: "manager",
    });

    await user.destroy();

    const deletedUser = await User.findByPk(user.id);
    expect(deletedUser).toBeNull();
  });

  it("should correctly identify an admin user", async () => {
    const adminUser = await User.create({
      id: uuidv4(),
      username: "adminuser",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    expect(adminUser.role).toBe("admin");

    const managerUser = await User.create({
      id: uuidv4(),
      username: "manageruser",
      email: "manager@example.com",
      password: "password123",
      role: "manager",
    });

    expect(managerUser.role).toBe("manager");
  });
});
