import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB initial connection failed:", error.message);
    console.log("Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established.");
});

export default connectDB;