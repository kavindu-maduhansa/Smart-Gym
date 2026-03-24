import mongoose from "mongoose";
import dns from "node:dns";

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
    const isSrvDnsRefused =
      typeof error?.message === "string" &&
      error.message.includes("querySrv ECONNREFUSED");

    if (isSrvDnsRefused) {
      try {
        // Some local DNS resolvers block SRV queries; retry with public resolvers.
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(mongoUri);
        console.log(`MongoDB connected ✅ (${mongoUri})`);
        return true;
      } catch (retryError) {
        console.error(
          "MongoDB connection error ❌",
          `${retryError.message} (after DNS fallback)`,
        );
        throw new Error(
          `Failed to connect to MongoDB: ${retryError.message}. Server cannot start without database connection.`,
        );
      }
    }

    console.error("MongoDB connection error ❌", error.message);
    throw new Error(
      `Failed to connect to MongoDB: ${error.message}. Server cannot start without database connection.`,
    );
  }
};

export default connectDB;
