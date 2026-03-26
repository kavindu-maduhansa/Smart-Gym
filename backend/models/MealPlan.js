import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    macros: {
      p: { type: String, required: true },
      c: { type: String, required: true },
    },
    meals: [
      {
        name: { type: String, required: true },
        detail: { type: String, required: true },
      },
    ],
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
export default MealPlan;
