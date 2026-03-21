import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import dotenv from "dotenv";

// Import user routes
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// User registration and related routes
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/membership", membershipRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Smart Gym Backend is running 🏋️‍♂️");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
