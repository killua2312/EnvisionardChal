// explicitly tell jest to use the mock
jest.mock("express-validator");

const userController = require("../../controllers/userController");
const userService = require("../../services/userService");

jest.mock("../../services/userService");
jest.mock("../../utils/jwtUtils");

describe("userController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("validateSignup", () => {
    it("should be an array of validation middleware", () => {
      expect(Array.isArray(userController.validateSignup)).toBe(true);
      expect(userController.validateSignup.length).toBeGreaterThan(0);
    });
  });

  describe("validateLogin", () => {
    it("should be an array of validation middleware", () => {
      expect(Array.isArray(userController.validateLogin)).toBe(true);
      expect(userController.validateLogin.length).toBeGreaterThan(0);
    });
  });

  describe("validateUpdate", () => {
    it("should be an array of validation middleware", () => {
      expect(Array.isArray(userController.validateUpdate)).toBe(true);
      expect(userController.validateUpdate.length).toBeGreaterThan(0);
    });
  });

  describe("signup", () => {
    it("should create a new user successfully", async () => {
      const mockUser = { id: "user-id", username: "testuser" };
      req.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "manager",
      };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.createUser.mockResolvedValue(mockUser);

      await userController.signup(req, res);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        userId: mockUser.id,
      });
    });

    it("should return validation errors if present", async () => {
      const mockErrors = { array: () => [{ msg: "Invalid email" }] };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors.array(),
      });

      await userController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: mockErrors.array() });
    });

    it("should handle internal server errors", async () => {
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.createUser.mockRejectedValue(new Error("Database error"));

      await userController.signup(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });
  });

  describe("login", () => {
    it("should login user successfully and return a token", async () => {
      const mockToken = "mocked-jwt-token";
      req.body = { email: "test@example.com", password: "password123" };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.loginUser.mockResolvedValue(mockToken);

      await userController.login(req, res);

      expect(userService.loginUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: mockToken,
      });
    });

    it("should return validation errors if present", async () => {
      const mockErrors = { array: () => [{ msg: "Invalid email" }] };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors.array(),
      });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: mockErrors.array() });
    });

    it("should handle invalid credentials", async () => {
      req.body = { email: "test@example.com", password: "wrongpassword" };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.loginUser.mockRejectedValue(
        new Error("Invalid email or password")
      );

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const mockUpdatedUser = { id: "user-id", username: "updateduser" };
      req.params = { userId: "user-id" };
      req.body = { username: "updateduser" };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      await userController.updateUser(req, res);

      expect(userService.updateUser).toHaveBeenCalledWith("user-id", {
        username: "updateduser",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully",
        user: mockUpdatedUser,
      });
    });

    it("should return validation errors if present", async () => {
      const mockErrors = { array: () => [{ msg: "Invalid username" }] };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors.array(),
      });

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: mockErrors.array() });
    });

    it("should handle user not found error", async () => {
      req.params = { userId: "nonexistent-id" };
      const { validationResult } = require("express-validator");
      validationResult.mockReturnValue({ isEmpty: () => true });
      userService.updateUser.mockRejectedValue(new Error("User not found"));

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      req.params = { userId: "user-id" };
      userService.deleteUser.mockResolvedValue({
        message: "User deleted successfully",
      });

      await userController.deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith("user-id");
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should handle user not found error", async () => {
      req.params = { userId: "nonexistent-id" };
      userService.deleteUser.mockRejectedValue(new Error("User not found"));

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      req.user = {
        id: "user-id",
        username: "testuser",
        email: "test@example.com",
      };

      await userController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ user: req.user });
    });
  });

  describe("verifyToken", () => {
    it("should return valid token message and user data", async () => {
      req.user = {
        id: "user-id",
        username: "testuser",
        email: "test@example.com",
        role: "manager",
      };

      await userController.verifyToken(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Token is valid",
        user: {
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
          role: "manager",
        },
      });
    });
  });
});
