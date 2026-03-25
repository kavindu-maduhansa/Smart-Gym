import mongoose from "mongoose";

// Stores long-lived conversation context (memory) + gamification.
const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, enum: ["admin", "student", "trainer"], required: true },
    goal: { type: String, default: "" },

    // --- Chat Memory (lightweight, gym-focused) ---
    level: { type: String, enum: ["", "beginner", "intermediate", "advanced"], default: "" },
    daysPerWeek: { type: Number, default: null },
    injuries: { type: String, default: "" }, // free-text summary
    equipment: { type: [String], default: [] }, // e.g. ["home", "dumbbell", "barbell", "machines"]
    preferences: { type: String, default: "" }, // e.g. "morning workouts", "vegetarian"

    // --- Gamification ---
    points: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: null },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
export default ChatSession;

