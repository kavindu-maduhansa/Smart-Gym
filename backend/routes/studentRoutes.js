import express from "express";
import { getAvailableSchedules, bookSession, getMyBookedSessions } from "../controllers/studentController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Students need to be logged in to see or book sessions
router.get("/available", authenticateJWT, getAvailableSchedules);
router.put("/book/:id", authenticateJWT, bookSession);
// Add this to your existing routes in studentRoutes.js
router.get("/my-bookings", authenticateJWT, getMyBookedSessions);
export default router;