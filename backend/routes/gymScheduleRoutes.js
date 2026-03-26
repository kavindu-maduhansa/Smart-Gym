import express from "express";
import {
  createGymSchedule,
  listGymSchedules,
  updateGymSchedule,
  deleteGymSchedule,
  bookGymSlot,
  listMyGymSlotBookings,
  cancelGymSlotBooking,
  moveGymSlotBooking,
  getGymBookingRules,
  getGymSlotAnalytics,
  getGymSlotRecommendations,
  getPersonalizedGymSlotRecommendations,
  joinGymSlotWaitlist,
  cancelGymSlotWaitlist,
  listMyGymSlotWaitlists,
  listMyGymNotifications,
  markMyGymNotificationRead,
  adminCloseGymSlot,
  adminOpenGymSlot,
  adminSetGymSlotCapacity,
} from "../controllers/gymScheduleController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { checkMembershipStatus } from "../middleware/membershipMiddleware.js";

const router = express.Router();

router.get("/booking-rules", getGymBookingRules);
router.get("/analytics", authenticateJWT, isAdmin, getGymSlotAnalytics);
router.get("/recommendations", authenticateJWT, getGymSlotRecommendations);
router.get(
  "/recommendations/personalized",
  authenticateJWT,
  getPersonalizedGymSlotRecommendations,
);
router.get("/", authenticateJWT, listGymSchedules);
router.get("/my-bookings", authenticateJWT, listMyGymSlotBookings);
router.get("/my-waitlists", authenticateJWT, listMyGymSlotWaitlists);
router.get("/my-notifications", authenticateJWT, listMyGymNotifications);
router.put(
  "/my-notifications/:notificationId/read",
  authenticateJWT,
  markMyGymNotificationRead,
);

router.post(
  "/:scheduleId/slots/:slotId/waitlist",
  authenticateJWT,
  checkMembershipStatus,
  joinGymSlotWaitlist,
);
router.delete(
  "/:scheduleId/slots/:slotId/waitlist",
  authenticateJWT,
  cancelGymSlotWaitlist,
);
router.post(
  "/:scheduleId/slots/:slotId/book",
  authenticateJWT,
  checkMembershipStatus,
  bookGymSlot,
);
router.put(
  "/:scheduleId/slots/:slotId/book",
  authenticateJWT,
  checkMembershipStatus,
  moveGymSlotBooking,
);
router.delete(
  "/:scheduleId/slots/:slotId/book",
  authenticateJWT,
  checkMembershipStatus,
  cancelGymSlotBooking,
);

router.post(
  "/:scheduleId/slots/:slotId/close",
  authenticateJWT,
  isAdmin,
  adminCloseGymSlot,
);
router.post(
  "/:scheduleId/slots/:slotId/open",
  authenticateJWT,
  isAdmin,
  adminOpenGymSlot,
);
router.post(
  "/:scheduleId/slots/:slotId/capacity",
  authenticateJWT,
  isAdmin,
  adminSetGymSlotCapacity,
);
router.post("/", authenticateJWT, isAdmin, createGymSchedule);
router.put("/:id", authenticateJWT, isAdmin, updateGymSchedule);
router.delete("/:id", authenticateJWT, isAdmin, deleteGymSchedule);

export default router;
