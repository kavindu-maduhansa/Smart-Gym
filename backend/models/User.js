import mongoose from "mongoose";

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "trainer"],
      default: "student",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    noShowCount: {
      type: Number,
      default: 0,
    },
    membershipType: {
      type: String,
      default: "monthly",
    },
    membershipExpiry: {
      type: Date,
      default: function () {
        // Set expiry to 30 days from registration
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

// Export the User model
const User = mongoose.model("User", userSchema);
export default User;
