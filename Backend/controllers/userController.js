const userService = require("../services/userService");
const { body, validationResult } = require("express-validator");
const { verifyToken } = require("../utils/jwtUtils");

const userController = {
  validateSignup: [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("role").isIn(["admin", "manager"]).withMessage("Invalid role"),
  ],

  validateLogin: [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],

  validateUpdate: [
    body("username")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email").optional().isEmail().withMessage("Invalid email address"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("role")
      .optional()
      .isIn(["admin", "manager"])
      .withMessage("Invalid role"),
  ],

  signup: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await userService.createUser(req.body);
      res
        .status(201)
        .json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      console.error("Error in signup controller:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const token = await userService.loginUser(email, password);
      res.json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error in login controller:", error);
      if (error.message === "Invalid email or password") {
        res.status(401).json({ error: "Invalid email or password" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  updateUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.params;
      const updatedUser = await userService.updateUser(userId, req.body);
      res.json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error in updateUser controller:", error);
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await userService.deleteUser(userId);
      res.json(result);
    } catch (error) {
      console.error("Error in deleteUser controller:", error);
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },

  getProfile: async (req, res) => {
    res.json({ user: req.user });
  },

  verifyToken: async (req, res) => {
    // The authMiddleware has already verified the token and attached the user to req.user
    res.json({
      message: "Token is valid",
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  },
};

module.exports = userController;
