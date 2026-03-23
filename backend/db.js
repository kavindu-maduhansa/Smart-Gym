import mongoose from "mongoose";

// avoid EventEmitter listener warnings when retrying connections
mongoose.connection.setMaxListeners(50);

const connectDB = async () => {
  console.log(
    "connectDB called, mongoose.readyState=",
    mongoose.connection.readyState,
  );

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      "CRITICAL: MONGODB_URI is not configured. Please set it in .env file.",
    );
  }

  // only attempt connection when currently disconnected
  if (mongoose.connection.readyState !== 0) {
    console.log("Skipping connectDB because readyState != 0");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected ✅ (${mongoUri})`);
    return true;
  } catch (error) {
    console.error("MongoDB connection error ❌", error.message);
    throw new Error(
      `Failed to connect to MongoDB: ${error.message}. Server cannot start without database connection.`,
    );
  }
};

export default connectDB;
