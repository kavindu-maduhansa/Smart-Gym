import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingsByStatus,
  getUserBookings,
  approveBooking,
  declineBooking,
  cancelBooking,
  getBookingById,
} from "../controllers/inventoryBookingController.js";

const router = express.Router();

// Admin routes - specific paths first
router.get("/", getAllBookings);
router.get("/status/:status", getBookingsByStatus);
router.put("/approve/:bookingId", approveBooking);
router.put("/decline/:bookingId", declineBooking);

// User routes
router.post("/book", createBooking);
router.get("/user/:userId", getUserBookings);
router.delete("/cancel/:bookingId", cancelBooking);
router.get("/:bookingId", getBookingById);

export default router;
