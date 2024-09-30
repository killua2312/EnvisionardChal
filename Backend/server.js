const express = require("express");
const http = require("http");
const { sequelize } = require("./models");
const { redis } = require("./config/redis");
const cors = require("cors");
const setupWebSocket = require("./utils/webSocketHandler");
const socket = require("./socket");
const logger = require("./config/logger");
const createRateLimiter = require("./utils/rateLimiter");
const { swaggerUi, specs } = require("./config/swagger");

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT) || 3000;

// Initialize Socket.IO with Redis adapter
const io = socket.init(server);

// CORS config
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Apply rate limiter to all requests
const apiLimter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(apiLimter);

//Middleware
app.use(express.json());

// Swagger UI middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes (to be implemeted)
app.use("/api/auth", require("./routes/userRouter"));
app.use("/api/drivers", require("./routes/driverRouter"));
app.use("/api/orders", require("./routes/orderRouter"));
app.use("/api/surge-pricing", require("./routes/surgePricingRouter"));
app.use("/api/analytics", require("./routes/analyticsRouter"));

// Set up WebSocket
setupWebSocket(io);

// Sync database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully");

    // Sync all models with database
    await sequelize.sync({ alter: true });
    logger.info("All models were synchronized successfully");

    // Test Redis connection
    await redis.ping();
    logger.info("Redis connection has been established successfully.");

    // Start the server
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Unable to start the server: ${error.message}`, { error });
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
});
