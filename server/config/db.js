import mongoose from "mongoose";

const DEFAULT_MONGO_URI =
  "mongodb+srv://queueless_user:QueuelessPassword4152@cluster0.keiwidf.mongodb.net/queueless?retryWrites=true&w=majority&appName=Cluster0";

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 15000,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("MongoDB connection failed:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
  if (cached) cached.conn = null;
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established.");
});

export default connectDB;