import mongoose from "mongoose";

const inventoryBookingSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    purpose: {
      type: String,
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    requestedStartDate: {
      type: Date,
      required: true,
    },
    requestedEndDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "completed", "cancelled"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    approvedDate: {
      type: Date,
    },
    approvedBy: {
      type: String,
      default: "",
    },
    declinedReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InventoryBooking", inventoryBookingSchema);
