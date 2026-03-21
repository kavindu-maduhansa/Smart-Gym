// backend/routes/membershipRoutes.js
// Routes for membership renewal request endpoints

import express from "express";
import {
  requestRenewal,
  getAllRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/membershipController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// @route   POST /api/membership/request-renewal
// @desc    Create a membership renewal request
// @access  Private (Student)
router.post("/request-renewal", authenticateJWT, requestRenewal);

// @route   GET /api/membership/requests
// @desc    Get all membership renewal requests
// @access  Private/Admin
router.get("/requests", authenticateJWT, isAdmin, getAllRequests);

// @route   PUT /api/membership/approve/:requestId
// @desc    Approve a membership renewal request
// @access  Private/Admin
router.put("/approve/:requestId", authenticateJWT, isAdmin, approveRequest);

// @route   PUT /api/membership/reject/:requestId
// @desc    Reject a membership renewal request
// @access  Private/Admin
router.put("/reject/:requestId", authenticateJWT, isAdmin, rejectRequest);

export default router;
