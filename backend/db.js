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
    console.error("No MONGODB_URI found in environment variables.");
    return;
  }

  // only attempt connection when currently disconnected
  if (mongoose.connection.readyState !== 0) {
    console.log("Skipping connectDB because readyState != 0");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected ✅ (${mongoUri})`);
  } catch (error) {
    console.error("MongoDB connection error ❌", error.message);
  }
};

export default connectDB;
