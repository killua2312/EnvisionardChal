const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET;

const jwtUtils = {
  generateToken: (user) => {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },
  authMiddleware: async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No Authorization header provided" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({
          error: "Authorization header must be in the format: Bearer <token>",
        });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwtUtils.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in authMiddleware:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  adminMiddleware: (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Access denied, Admin role required" });
    }
  },
};

module.exports = jwtUtils;
