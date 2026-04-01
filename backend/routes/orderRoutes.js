import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Require authentication for all order routes
router.use(authenticateJWT);

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/myorders", getMyOrders);
router.put("/:id/status", updateOrderStatus);

export default router;
