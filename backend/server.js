import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import inventoryRoutes from "./routes/inventoryRoutes.js";

// Load env variables
dotenv.config();

const app = express();

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());

// ================== STATIC FILES (IMAGES) ==================
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ================== ROUTES ==================
app.use("/api/inventory", inventoryRoutes);

// ================== TEST ROUTE ==================
app.get("/", (req, res) => {
  res.send("Smart Gym Inventory API Running 🏋️‍♂️");
});

// ================== 404 HANDLER ==================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ================== DATABASE CONNECTION ==================
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-gym";
    
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI not set. Using local MongoDB fallback.");
      console.warn("   Make sure MongoDB is running: mongod");
    }
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});