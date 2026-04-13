import { format, formatDistanceToNow } from "date-fns";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const GYM_SCHEDULES_API = `${API_BASE}/api/gym-schedules`;

export function gymNotificationsChanged() {
  window.dispatchEvent(new Event("gymNotificationsChanged"));
}

export function formatNotifTime(createdAt) {
  if (!createdAt) return "";
  try {
    const d = new Date(createdAt);
    if (!Number.isFinite(d.getTime())) return "";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

export function formatNotifAbsolute(createdAt) {
  if (!createdAt) return "";
  try {
    const d = new Date(createdAt);
    if (!Number.isFinite(d.getTime())) return "";
    return format(d, "MMM d, yyyy · h:mm a");
  } catch {
    return "";
  }
}

export function kindLabel(kind) {
  switch (String(kind || "")) {
    case "REMINDER_BEFORE_SESSION":
      return "Reminder";
    case "BOOKING_CONFIRMED":
      return "Booking";
    case "WAITLIST_PROMOTED":
      return "Waitlist";
    case "BOOKING_CANCELLED":
      return "Cancelled";
    default:
      return kind ? String(kind).replace(/_/g, " ") : "Gym notice";
  }
}
