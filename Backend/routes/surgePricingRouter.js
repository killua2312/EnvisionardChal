const express = require("express");
const router = express.Router();
const surgePricingController = require("../controllers/surgePricingController");
const { authMiddleware } = require("../utils/jwtUtils");

router.use(authMiddleware);
router.post("/", surgePricingController.getSurgePricing);
router.post("/simulate", surgePricingController.getSimulatedPricing);

module.exports = router;
