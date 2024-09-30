const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { authMiddleware } = require("../utils/jwtUtils");
const {
  validateInput,
  validationRules,
} = require("../utils/validationMiddleware");

router.use(authMiddleware);
router.post(
  "/",
  validationRules.createDriver,
  validateInput,
  driverController.createDriver
);
router.get("/active", driverController.getAllAvailableDrivers);
router.put(
  "/:driverId/location",
  validationRules.updateDriverLocation,
  validateInput,
  driverController.updateDriverLocation
);
router.put(
  "/:driverId/status",
  validationRules.updateDriverStatus,
  validateInput,
  driverController.updateDriverStatus
);

module.exports = router;
