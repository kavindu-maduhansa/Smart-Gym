import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./db.js";

// Import user routes
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import studentRoutes from './routes/studentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import contactRoutes from "./routes/contactRoutes.js";

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
    
    // Allow localhost:5173 with or without trailing slash
    if (origin === 'http://localhost:5173' || origin === 'http://localhost:5173/') {
      return callback(null, true);
    }
    
    // Allow custom frontend URL from env
    const allowedOrigin = process.env.FRONTEND_URL;
    if (allowedOrigin && (origin === allowedOrigin || origin === allowedOrigin + '/')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// User registration and related routes
app.use("/api/users", userRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/contact", contactRoutes);

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
  console.log(`CORS enabled for: ${corsOptions.origin}`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1);
});
