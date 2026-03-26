import mongoose from "mongoose";

const gymNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, default: "gym" },
    // Optional metadata for smart notifications (used to prevent duplicates).
    kind: { type: String, default: "" }, // e.g., BOOKING_CONFIRMED, REMINDER, WAITLIST_PROMOTED
    ref: { type: String, default: "" }, // unique reference per kind (e.g., scheduleId:slotId)
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Deduplicate per user + kind + ref when provided.
gymNotificationSchema.index(
  { user: 1, kind: 1, ref: 1 },
  { unique: true, partialFilterExpression: { kind: { $ne: "" }, ref: { $ne: "" } } },
);

const GymNotification = mongoose.model(
  "GymNotification",
  gymNotificationSchema,
);

export default GymNotification;

