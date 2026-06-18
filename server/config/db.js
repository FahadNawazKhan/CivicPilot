import mongoose from 'mongoose';
import config from './environment.js';

let cachedConnection = null;
let cachedPromise = null;

export const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of hanging (30s)
    };

    cachedPromise = mongoose.connect(config.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('Successfully connected to MongoDB.');
      return mongooseInstance;
    }).catch((err) => {
      cachedPromise = null; // Reset promise so subsequent requests can try again
      console.error('Database connection failed:', err.message);
      throw err;
    });
  }

  cachedConnection = await cachedPromise;
  return cachedConnection;
};
