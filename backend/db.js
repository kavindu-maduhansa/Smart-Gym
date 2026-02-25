import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Load .env variables

// avoid EventEmitter listener warnings when retrying connections
mongoose.connection.setMaxListeners(50);

// the memory server is only required in development when no real DB is available
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let memoryServer; // will hold the in-memory server instance

// core connection attempt helper
async function tryConnect(uri) {
  // avoid re-connecting if already in progress or connected
  const state = mongoose.connection.readyState;
  if (state === 1) {
    console.log('Already connected, skipping connect call');
    return;
  }
  if (state === 2) {
    console.log('Connection in progress, skipping connect call');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected ✅ (${uri})`);
  } catch (err) {
    // ensure driver state resets to disconnected before rethrowing
    try {
      await mongoose.disconnect();
    } catch {} // ignore disconnection error
    throw err;
  }
}

async function startMemoryServer() {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
  }
  const uri = memoryServer.getUri();
  console.log('Using in-memory MongoDB (development fallback)');
  await tryConnect(uri);
}

let retryTimer;

const connectDB = async () => {
  console.log('connectDB called, mongoose.readyState=', mongoose.connection.readyState);

  // In development, always use in-memory MongoDB to avoid Atlas/DNS issues
  if (process.env.NODE_ENV !== 'production') {
    if (mongoose.connection.readyState !== 0) {
      console.log('Skipping connectDB (dev) because readyState != 0');
      return;
    }
    try {
      await startMemoryServer();
      return;
    } catch (err) {
      console.error('In-memory MongoDB startup failed ❌', err.message);
      // fall through to Atlas/local attempts as a last resort
    }
  }

  const atlasUri = process.env.MONGODB_URI;
  console.log('MONGODB_URI=', atlasUri ? '[present]' : '[undefined]');

  // only attempt connection when currently disconnected
  if (mongoose.connection.readyState !== 0) {
    console.log('Skipping connectDB because readyState != 0');
    return;
  }

  let succeeded = false;

  if (atlasUri) {
    try {
      await tryConnect(atlasUri);
      succeeded = true;
    } catch (error) {
      console.error('MongoDB connection error ❌', error.message);
      // on failure we already disconnected in tryConnect
      if (error.code === 'ECONNREFUSED' || error.message.includes('querySrv')) {
        console.warn('Atlas connection failed, trying local MongoDB...');
        try {
          await tryConnect('mongodb://127.0.0.1:27017/smartgym');
          succeeded = true;
        } catch (err2) {
          console.error('Local MongoDB connection also failed ❌', err2.message);
        }
      }
    }
  } else {
    console.warn('No MONGODB_URI provided, skipping Atlas/local attempts');
  }

  if (!succeeded && process.env.NODE_ENV !== 'production') {
    try {
      await startMemoryServer();
      succeeded = true;
    } catch (err) {
      console.error('In-memory MongoDB startup failed ❌', err.message);
    }
  }

  if (!succeeded) {
    // schedule a retry
    if (!retryTimer) {
      console.log('Retrying MongoDB connection in 5 seconds...');
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        connectDB();
      }, 5000);
    }
  }
};

export default connectDB;
