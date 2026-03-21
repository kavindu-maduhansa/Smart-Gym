import mongoose from "mongoose";

// Define the MembershipRequest schema
const membershipRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    packageType: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      required: true,
    },
    currentMembershipExpiry: {
      type: Date,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Export the MembershipRequest model
const MembershipRequest = mongoose.model(
  "MembershipRequest",
  membershipRequestSchema,
);
export default MembershipRequest;
