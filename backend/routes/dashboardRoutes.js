// backend/routes/dashboardRoutes.js
// Routes for dashboard statistics

import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get dashboard stats (authenticated + admin only)
router.get("/stats", authenticateJWT, isAdmin, getDashboardStats);

export default router;
