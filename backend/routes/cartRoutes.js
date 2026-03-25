// backend/routes/cartRoutes.js
// Routes for cart-related endpoints

import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get("/", authenticateJWT, getCart);

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post("/add", authenticateJWT, addToCart);

// @route   PUT /api/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put("/update", authenticateJWT, updateCartItem);

// @route   DELETE /api/cart/remove/:supplementId
// @desc    Remove item from cart
// @access  Private
router.delete("/remove/:supplementId", authenticateJWT, removeFromCart);

// @route   DELETE /api/cart/clear
// @desc    Clear cart
// @access  Private
router.delete("/clear", authenticateJWT, clearCart);

export default router;
