const winston = require("winston");
const path = require("path");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: { service: "surge-pricing-service" },
  transports: [
    // Console transport for all log levels
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
    }),
  ],
});

module.exports = logger;
