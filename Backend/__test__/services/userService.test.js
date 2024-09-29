const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../../models");
const userService = require("../../services/userService");
const jwtUtils = require("../../utils/jwtUtils");

// Mock the dependencies
jest.mock("bcrypt");
jest.mock("uuid");
jest.mock("../../models");
jest.mock("../../utils/jwtUtils");

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      const mockUserData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "manager",
      };
      const mockHashedPassword = "hashedPassword123";
      const mockUUID = "mocked-uuid";
      const mockCreatedUser = {
        id: mockUUID,
        ...mockUserData,
        password: mockHashedPassword,
      };

      bcrypt.hash.mockResolvedValue(mockHashedPassword);
      uuidv4.mockReturnValue(mockUUID);
      User.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(mockUserData);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(uuidv4).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith({
        id: mockUUID,
        ...mockUserData,
        password: mockHashedPassword,
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it("should throw an error if user creation fails", async () => {
      const mockUserData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "manager",
      };

      bcrypt.hash.mockResolvedValue("hashedPassword123");
      User.create.mockRejectedValue(new Error("Database error"));

      await expect(userService.createUser(mockUserData)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user when found", async () => {
      const mockEmail = "test@example.com";
      const mockUser = { id: "user-id", email: mockEmail };

      User.findOne.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail(mockEmail);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when user is not found", async () => {
      const mockEmail = "nonexistent@example.com";

      User.findOne.mockResolvedValue(null);

      const result = await userService.getUserByEmail(mockEmail);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(result).toBeNull();
    });

    it("should throw an error if database query fails", async () => {
      const mockEmail = "test@example.com";

      User.findOne.mockRejectedValue(new Error("Database error"));

      await expect(userService.getUserByEmail(mockEmail)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const mockUserId = "user-id";
      const mockUpdateData = { username: "newusername" };
      const mockUser = {
        id: mockUserId,
        username: "oldusername",
        update: jest.fn().mockResolvedValue(true),
      };

      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.updateUser(mockUserId, mockUpdateData);

      expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
      expect(mockUser.update).toHaveBeenCalledWith(mockUpdateData);
      expect(result).toEqual(mockUser);
    });

    it("should update user password if provided", async () => {
      const mockUserId = "user-id";
      const mockUpdateData = { password: "newpassword" };
      const mockHashedPassword = "hashedNewPassword";
      const mockUser = {
        id: mockUserId,
        update: jest.fn().mockResolvedValue(true),
      };

      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue(mockHashedPassword);

      await userService.updateUser(mockUserId, mockUpdateData);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
      expect(mockUser.update).toHaveBeenCalledWith({
        password: mockHashedPassword,
      });
    });

    it("should throw an error if user is not found", async () => {
      const mockUserId = "nonexistent-id";
      const mockUpdateData = { username: "newusername" };

      User.findByPk.mockResolvedValue(null);

      await expect(
        userService.updateUser(mockUserId, mockUpdateData)
      ).rejects.toThrow("User not found");
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const mockUserId = "user-id";
      const mockUser = {
        id: mockUserId,
        destroy: jest.fn().mockResolvedValue(true),
      };

      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.deleteUser(mockUserId);

      expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: "User deleted successfully" });
    });

    it("should throw an error if user is not found", async () => {
      const mockUserId = "nonexistent-id";

      User.findByPk.mockResolvedValue(null);

      await expect(userService.deleteUser(mockUserId)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("validatePassword", () => {
    it("should return true for valid password", async () => {
      const password = "password123";
      const hashedPassword = "hashedPassword123";

      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.validatePassword(
        password,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return false for invalid password", async () => {
      const password = "wrongpassword";
      const hashedPassword = "hashedPassword123";

      bcrypt.compare.mockResolvedValue(false);

      const result = await userService.validatePassword(
        password,
        hashedPassword
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe("loginUser", () => {
    it("should login user successfully and return a token", async () => {
      const mockEmail = "test@example.com";
      const mockPassword = "password123";
      const mockUser = {
        id: "user-id",
        email: mockEmail,
        password: "hashedPassword123",
      };
      const mockToken = "mocked-jwt-token";

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue(mockToken);

      const result = await userService.loginUser(mockEmail, mockPassword);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockPassword,
        mockUser.password
      );
      expect(jwtUtils.generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockToken);
    });

    it("should throw an error if user is not found", async () => {
      const mockEmail = "nonexistent@example.com";
      const mockPassword = "password123";

      User.findOne.mockResolvedValue(null);

      await expect(
        userService.loginUser(mockEmail, mockPassword)
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw an error if password is invalid", async () => {
      const mockEmail = "test@example.com";
      const mockPassword = "wrongpassword";
      const mockUser = {
        id: "user-id",
        email: mockEmail,
        password: "hashedPassword123",
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        userService.loginUser(mockEmail, mockPassword)
      ).rejects.toThrow("Invalid email or password");
    });
  });
});
