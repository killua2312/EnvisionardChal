const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");

const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 'window'
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(options.statusCode).send(options.message);
    },
  };

  const limiterOptions = { ...defaultOptions, ...options };

  return rateLimit(limiterOptions);
};

module.exports = createRateLimiter;
