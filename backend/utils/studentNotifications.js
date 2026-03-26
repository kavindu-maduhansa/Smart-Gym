import GymNotification from "../models/GymNotification.js";

export const NOTIFICATION_CATEGORY = {
  GENERAL: "general",
  BOOKING_CONFIRMATION: "booking_confirmation",
  SESSION_REMINDER: "session_reminder",
  WAITLIST_PROMOTION: "waitlist_promotion",
  WAITLIST_JOIN: "waitlist_join",
  CANCELLATION: "cancellation",
};

/**
 * Student-facing in-app alert (gym + trainer). Email/push can plug in here later.
 */
export async function notifyStudent(
  userId,
  message,
  type = "gym",
  category = NOTIFICATION_CATEGORY.GENERAL,
) {
  await GymNotification.create({ user: userId, message, type, category });
}
