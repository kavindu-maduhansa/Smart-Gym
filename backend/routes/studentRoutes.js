import express from "express";
import { getAvailableSchedules, bookSession, getMyBookedSessions, cancelBooking } from "../controllers/studentController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Students need to be logged in to see or book sessions
router.get("/available", authenticateJWT, getAvailableSchedules);
router.put("/book/:id", authenticateJWT, bookSession);
router.get("/my-bookings", authenticateJWT, getMyBookedSessions);
router.delete("/cancel/:id", authenticateJWT, cancelBooking);
export default router;