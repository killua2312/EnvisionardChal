const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../utils/jwtUtils");
const {
  validateInput,
  validationRules,
} = require("../utils/validationMiddleware");

router.use(authMiddleware);
router.post(
  "/",
  validationRules.createOrder,
  validateInput,
  orderController.createOrder
);
router.get("/active", orderController.getAllActiveOrders);
router.put(
  "/:orderId",
  validationRules.updateOrderStatus,
  validateInput,
  orderController.updateOrderStatus
);

module.exports = router;
