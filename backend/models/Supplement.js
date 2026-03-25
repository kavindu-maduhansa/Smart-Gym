import mongoose from "mongoose";

// Define the Supplement schema
const supplementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Protein", "Creatine", "BCAA", "Pre-Workout", "Vitamins", "Other"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    brand: {
      type: String,
      required: true,
    },
    servingSize: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Export the Supplement model
const Supplement = mongoose.model("Supplement", supplementSchema);
export default Supplement;
