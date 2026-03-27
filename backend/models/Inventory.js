import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ["Cardio", "Strength", "Accessories"] },
  quantity: { type: Number, required: true, min: 0 },
  condition: { type: String, enum: ["New", "Good", "Maintenance", "Damaged"], default: "Good" },
  supplier: { type: String, trim: true },
  specialDetails: { type: String, trim: true },
  purchaseDate: { type: Date },
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date
  },
  status: { type: String, enum: ["available", "out_of_stock", "under_maintenance"], default: "available" },
  image: { type: String } // store filename of uploaded image
}, { timestamps: true }); // ✅ ADDED: createdAt and updatedAt fields

export default mongoose.model("Inventory", inventorySchema);