const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, adminMiddleware } = require("../utils/jwtUtils");

router.post("/signup", userController.validateSignup, userController.signup);
router.post("/login", userController.validateLogin, userController.login);

// Protected routes
router.use(authMiddleware);
router.get("/verify", userController.verifyToken);
router.get("/profile", userController.getProfile);
router.put(
  "/:userId",
  userController.validateUpdate,
  userController.updateUser
);

// Admin-only routes
router.delete("/:userId", adminMiddleware, userController.deleteUser);

module.exports = router;
