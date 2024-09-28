const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Redis = require("ioredis");

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    });

    // Create Redis clients for the adapter
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();

    // set up the Redis adapter
    io.adapter(createAdapter(pubClient, subClient));

    return io;
  },

  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
