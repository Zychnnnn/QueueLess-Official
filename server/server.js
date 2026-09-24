import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dns from "dns";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

dotenv.config();

dns.setServers(["8.8.8.8"]);

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "QueueLess API is running",
  });
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`QueueLess API running on port ${PORT}`);
});