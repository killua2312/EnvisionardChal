const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { authMiddleware } = require("../utils/jwtUtils");

router.use(authMiddleware);
router.post("/", driverController.createDriver);
router.get("/active", driverController.getAllAvailableDrivers);
router.put("/:driverId/location", driverController.updateDriverLocation);
router.put("/:driverId/status", driverController.updateDriverStatus);

module.exports = router;
