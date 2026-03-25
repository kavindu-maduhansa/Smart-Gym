import mongoose from "mongoose";

// Stores each chat turn for context + admin analytics.
const chatTurnSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, enum: ["admin", "student", "trainer"], required: true },

    goalAtTime: { type: String, default: "" },
    userMessage: { type: String, required: true },
    assistantReply: { type: String, required: true },

    // For "most asked questions"
    normalizedQuestion: { type: String, default: "" },

    // For tool actions executed in chat
    toolIntent: { type: String, default: "" },
    toolSlotId: { type: String, default: "" },
  },
  { timestamps: true }
);

chatTurnSchema.index({ sessionId: 1, createdAt: -1 });
chatTurnSchema.index({ normalizedQuestion: 1, createdAt: -1 });

const ChatTurn = mongoose.model("ChatTurn", chatTurnSchema);
export default ChatTurn;

