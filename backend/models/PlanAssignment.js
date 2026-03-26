import mongoose from "mongoose";

const planAssignmentSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "planModel",
    },
    planModel: {
      type: String,
      required: true,
      enum: ["WorkoutPlan", "MealPlan"],
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const PlanAssignment = mongoose.model("PlanAssignment", planAssignmentSchema);
export default PlanAssignment;
