// backend/routes/supplementRoutes.js
// Routes for supplement-related endpoints

import express from "express";
import {
  getAllSupplements,
  getSupplementById,
  createSupplement,
  updateSupplement,
  deleteSupplement,
  getAllSupplementsAdmin,
} from "../controllers/supplementController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// @route   GET /api/supplements/admin/all
// @desc    Get all supplements including inactive (admin view)
// @access  Private/Admin
router.get("/admin/all", authenticateJWT, isAdmin, getAllSupplementsAdmin);

// @route   POST /api/supplements
// @desc    Create a new supplement (Admin only)
// @access  Private/Admin
router.post("/", authenticateJWT, isAdmin, createSupplement);

// @route   PUT /api/supplements/:id
// @desc    Update a supplement (Admin only)
// @access  Private/Admin
router.put("/:id", authenticateJWT, isAdmin, updateSupplement);

// @route   DELETE /api/supplements/:id
// @desc    Delete a supplement (Admin only)
// @access  Private/Admin
router.delete("/:id", authenticateJWT, isAdmin, deleteSupplement);

// @route   GET /api/supplements/:id
// @desc    Get supplement by ID
// @access  Public
router.get("/:id", getSupplementById);

// @route   GET /api/supplements
// @desc    Get all active supplements (public view)
// @access  Public
router.get("/", getAllSupplements);

export default router;
