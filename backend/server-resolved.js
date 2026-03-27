import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

// Load env variables
dotenv.config();

// Import all routes
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

const app = express();

// ================== MIDDLEWARE ==================
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

// ================== STATIC FILES (IMAGES) ==================
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ================== ROUTES ==================
// User and system routes
app.use("/api/users", userRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/supplements", supplementRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/gym-schedules", gymScheduleRoutes);

// Inventory routes
app.use("/api/inventory", inventoryRoutes);

// Smart Gym chatbot + booking integration endpoints:
// POST /chat, GET /get-slots, POST /book-slot, POST /cancel-slot
app.use("/", chatRoutes);

// ================== TEST ROUTE ==================
app.get("/", (req, res) => {
  res.send("Smart Gym API Running 🏋️‍♂️");
});

// ================== 404 HANDLER ==================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ================== GLOBAL ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
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

const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connection established successfully.");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean);
      console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
