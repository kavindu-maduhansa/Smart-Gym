import mongoose from "mongoose";

const gymNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, default: "gym" },
    category: {
      type: String,
      enum: [
        "general",
        "booking_confirmation",
        "session_reminder",
        "waitlist_promotion",
        "waitlist_join",
        "cancellation",
      ],
      default: "general",
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const GymNotification = mongoose.model(
  "GymNotification",
  gymNotificationSchema,
);

export default GymNotification;

