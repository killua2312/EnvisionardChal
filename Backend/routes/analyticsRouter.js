const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { authMiddleware, adminMiddleware } = require("../utils/jwtUtils");

// Apply authentication middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/surge-frequency", analyticsController.getSurgePricingFrequency);
router.get(
  "/average-multiplier",
  analyticsController.getAverageSurgeMultiplier
);
router.get(
  "/average-multiplier-by-area",
  analyticsController.getAverageSurgeMultiplierByArea
);

module.exports = router;
