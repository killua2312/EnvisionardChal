const express = require("express");
const http = require("http");
const { sequelize } = require("./models");
const { redis } = require("./config/redis");
const cors = require("cors");
const setupWebSocket = require("./utils/webSocketHandler");
const socket = require("./socket");

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

//Middleware
app.use(express.json());

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
    console.log("Database connection has been established successfully");

    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully");

    // Test Redis connection
    await redis.ping();
    console.log("Redis connection has been established successfully.");

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);
  }
};

startServer();
