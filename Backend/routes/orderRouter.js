const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../utils/jwtUtils");

router.use(authMiddleware);
router.get("/", orderController.createOrder);
router.get("/active", orderController.getAllActiveOrders);
router.put("/:orderId", orderController.updateOrderStatus);

module.exports = router;
