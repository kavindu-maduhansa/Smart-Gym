
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import connectDB from "./db.js";

// Load env variables
dotenv.config();

// Import routes (only those that exist)
import inventoryRoutes from "./routes/inventoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import supplementRoutes from "./routes/supplementRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import studentRoutes from './routes/studentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import contactRoutes from "./routes/contactRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import gymScheduleRoutes from "./routes/gymScheduleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "MONGODB_URI"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(
    `CRITICAL: Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  console.error("Please configure these variables in your .env file.");
  process.exit(1);
}

// Connect to MongoDB with error handling
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// Middleware
// Configure CORS with allowed origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Remove trailing slash for consistent comparison
    const normalizedOrigin = origin.replace(/\/$/, '');

    // Whitelist of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Uploaded inventory (and other) images — required for <img src="/uploads/..."> from the frontend
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// User registration and related routes
app.use("/api/users", userRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplements", supplementRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/gym-schedules", gymScheduleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/orders", orderRoutes);

// Smart Gym chatbot + booking integration endpoints:
// POST /chat, GET /get-slots, POST /book-slot, POST /cancel-slot
app.use("/", chatRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Smart Gym Backend is running 🏋️‍♂️");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean);
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
  if (error && error.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use.\n` +
        "Run: npm start or npm run dev (both run scripts/free-port.mjs first), or stop the other process.\n" +
        "Windows: netstat -ano | findstr :5000  then  taskkill /PID <pid> /F\n",
    );
  }
  process.exit(1);
});
