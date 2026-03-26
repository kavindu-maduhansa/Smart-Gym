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
  getMyGymSlotPreferences,
  updateMyGymSlotPreferences,
  joinGymSlotWaitlist,
  cancelGymSlotWaitlist,
  listMyGymSlotWaitlists,
  listMyGymNotifications,
  markMyGymNotificationRead,
  adminCloseGymSlot,
  adminOpenGymSlot,
  adminPatchGymSlotCapacity,
} from "../controllers/gymScheduleController.js";
import { authenticateJWT } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/booking-rules", getGymBookingRules);
router.get("/analytics", authenticateJWT, isAdmin, getGymSlotAnalytics);
router.get("/recommendations", authenticateJWT, getGymSlotRecommendations);
router.get("/my-slot-preferences", authenticateJWT, getMyGymSlotPreferences);
router.put("/my-slot-preferences", authenticateJWT, updateMyGymSlotPreferences);
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
  bookGymSlot,
);
router.put(
  "/:scheduleId/slots/:slotId/book",
  authenticateJWT,
  moveGymSlotBooking,
);
router.delete(
  "/:scheduleId/slots/:slotId/book",
  authenticateJWT,
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
router.patch(
  "/:scheduleId/slots/:slotId/capacity",
  authenticateJWT,
  isAdmin,
  adminPatchGymSlotCapacity,
);
router.post("/", authenticateJWT, isAdmin, createGymSchedule);
router.put("/:id", authenticateJWT, isAdmin, updateGymSchedule);
router.delete("/:id", authenticateJWT, isAdmin, deleteGymSchedule);

export default router;
