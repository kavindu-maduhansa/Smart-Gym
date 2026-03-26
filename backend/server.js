import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

dotenv.config(); // Load environment variables FIRST

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/inventory", inventoryRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Smart Gym Backend is running 🏋️‍♂️");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});