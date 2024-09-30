const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dynamic Surge Pricing API",
      version: "1.0.0",
      description: "API for a dynamic surge pricing system for food delivery",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "../swaggerDocs.js"),
    path.resolve(__dirname, "../routes/*.js"),
    path.resolve(__dirname, "*.js"),
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
