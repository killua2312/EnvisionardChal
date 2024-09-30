const express = require("express");
const router = express.Router();
const surgePricingController = require("../controllers/surgePricingController");
const { authMiddleware } = require("../utils/jwtUtils");
const {
  validateInput,
  validationRules,
} = require("../utils/validationMiddleware");

router.use(authMiddleware);
router.post(
  "/",
  validationRules.getSurgePricing,
  validateInput,
  surgePricingController.getSurgePricing
);
router.post(
  "/simulate",
  validationRules.simulateSurgePricing,
  validateInput,
  surgePricingController.getSimulatedPricing
);

module.exports = router;
