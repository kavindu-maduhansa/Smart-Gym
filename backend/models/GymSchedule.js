import mongoose from "mongoose";

const gymSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    bookedCount: { type: Number, default: 0, min: 0 },
    // If true, this slot is CLOSED even if it still has capacity.
    isClosed: { type: Boolean, default: false },
    closedAt: { type: Date, default: null },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    bookings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bookedAt: { type: Date, default: Date.now },
        reminderSentAt: { type: Date, default: null },
      },
    ],
    waitlist: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { _id: true },
);

const gymScheduleSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    dayLabel: { type: String, default: "" },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    /** When true, opening/closing times were set by admin (exam week, event, etc.) instead of default weekday rules. */
    useSpecialHours: { type: Boolean, default: false },
    slotDurationMinutes: { type: Number, required: true },
    capacityPerSlot: { type: Number, required: true },
    slots: [gymSlotSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// One generated schedule per calendar day (avoids duplicate slot grids for the same date).
gymScheduleSchema.index({ date: 1 }, { unique: true });

const GymSchedule = mongoose.model("GymSchedule", gymScheduleSchema);
export default GymSchedule;
