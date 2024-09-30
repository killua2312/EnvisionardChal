const { validationResult, body, param, query } = require("express-validator");

//Middleware to check for validation errors
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// common validation rules
const commonRules = {
  latitude: body("latitude").isFloat({ min: -90, max: 90 }),
  longitude: body("longitude").isFloat({ min: -180, max: 180 }),
  status: body("status").isIn([
    "active",
    "delivered",
    "cancelled",
    "available",
    "unavailable",
  ]),
  email: body("email").isEmail().normalizeEmail(),
};

// Validation rules for each endpoint
const validationRules = {
  createDriver: [
    body("name").trim().notEmpty().escape(),
    body("email").isEmail().normalizeEmail(),
    body("phone").optional().isMobilePhone(),
    body("status").isIn(["available", "unavailable"]),
    body("current_latitude").isFloat({ min: -90, max: 90 }),
    body("current_longitude").isFloat({ min: -180, max: 180 }),
  ],
  updateDriverLocation: [commonRules.latitude, commonRules.longitude],
  updateDriverStatus: [body("status").isIn(["available", "unavailable"])],
  createOrder: [
    body("customer_latitude").isFloat({ min: -90, max: 90 }),
    body("customer_longitude").isFloat({ min: -180, max: 180 }),
    body("restaurant_latitude").isFloat({ min: -90, max: 90 }),
    body("restaurant_longitude").isFloat({ min: -180, max: 180 }),
    body("total_amount").isFloat({ min: 0 }),
  ],
  updateOrderStatus: [
    body("status").isIn(["active", "delivered", "cancelled"]),
  ],
  getSurgePricing: [commonRules.latitude, commonRules.longitude],
  simulateSurgePricing: [
    body("driversInProximity").isInt({ min: 0 }),
    body("ordersInProximity").isInt({ min: 0 }),
    body("weatherCondition").isString().notEmpty(),
  ],
};

module.exports = {
  validateInput,
  validationRules,
};
