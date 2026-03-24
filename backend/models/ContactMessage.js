import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "seen", "replied", "in_progress", "resolved"],
      default: "new",
    },
    adminReply: {
      type: String,
      trim: true,
      default: "",
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, collection: "contact" },
);

export default mongoose.model("Contact", contactMessageSchema);
