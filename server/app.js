import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dns from "dns";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

// Provide solid fallbacks for serverless environments where .env isn't bundled
process.env.JWT_SECRET = process.env.JWT_SECRET || "queueless-production-secret-key-2026-auth";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "1085223545333-85puvi15u5mumi3eq038tspee023fbta.apps.googleusercontent.com";
process.env.EMAIL_USER = process.env.EMAIL_USER || "reirei.edu.ph@gmail.com";
process.env.EMAIL_PASS = process.env.EMAIL_PASS || "ofbcccujpenkpqnz";

try {
  dns.setServers(["1.1.1.1", "8.8.8.8", "8.8.4.4"]);
} catch {
  // Use default system DNS if custom servers are disallowed
}

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all client origins, Vercel preview/production, and local dev
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const isLocalOrDevRequest = (req) => {
  if (process.env.NODE_ENV !== "production") return true;
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "";
  return (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.includes("127.0.0.1") ||
    ip.includes("localhost")
  );
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isLocalOrDevRequest,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    if (isLocalOrDevRequest(req)) return true;
    // Don't rate limit read-only requests or non-login administrative operations
    if (req.method === "GET") return true;
    if (req.path.startsWith("/users") || req.path.startsWith("/profile")) return true;
    return false;
  },
  message: {
    message: "Too many authentication attempts from this IP. Please wait a few minutes before trying again.",
  },
});

app.use(limiter);

// Bind routes with both /api prefix and direct paths
app.use("/api/auth", authLimiter, authRoutes);
app.use("/auth", authLimiter, authRoutes);

app.use("/api/requests", requestRoutes);
app.use("/requests", requestRoutes);

app.use("/api/audit-logs", auditRoutes);
app.use("/audit-logs", auditRoutes);

const staticPath = path.resolve(process.cwd(), ".output", "public");
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/auth") && !req.path.startsWith("/requests") && !req.path.startsWith("/audit-logs")) {
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
    message: error.message || "The API request could not be completed.",
  });
});

export default app;
