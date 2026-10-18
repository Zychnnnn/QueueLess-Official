import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dns from "dns";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import { ensureAdminAccount } from "./createAdmin.js";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

try {
  dns.setServers(["1.1.1.1", "8.8.8.8", "8.8.4.4"]);
} catch {
  // Use default system DNS if custom servers are disallowed
}

const app = express();
const allowedOrigins = new Set(
  [
    process.env.CLIENT_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter((origin) => origin)
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all local dev origins, client origin, or requests without origin (like Postman or server-to-server)
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/audit-logs", auditRoutes);

const staticPath = path.resolve(process.cwd(), ".output", "public");
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(staticPath, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      message: "QueueLess API is running",
    });
  });
}

app.use((error, req, res, next) => {
  console.error("Unhandled API error:", error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(error.status || 500).json({
    message: "The API request could not be completed.",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`QueueLess API running on port ${PORT}`);
  });

  connectDB()
    .then(() => ensureAdminAccount())
    .catch((err) => {
      console.error("Database initialization error:", err.message);
    });
};

startServer();