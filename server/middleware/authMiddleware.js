import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "queueless-production-secret-key-2026-auth";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Authentication token required.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        message:
          jwtErr.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid authentication token signature.",
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid token payload.",
      });
    }

    // Verify user exists and synchronize live role from database
    const dbUser = await User.findById(decoded.id).select(
      "role approvalStatus email studentId name isPriority userType tokenVersion"
    );

    if (!dbUser) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    // Check tokenVersion — if the JWT was issued before a force-logout, reject it
    if (
      typeof dbUser.tokenVersion === "number" &&
      typeof decoded.tokenVersion === "number" &&
      decoded.tokenVersion !== dbUser.tokenVersion
    ) {
      return res.status(401).json({
        message: "Session revoked for security reasons. Please log in again.",
        forceLogout: true,
      });
    }

    if (dbUser.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Account access revoked. Please contact administrator.",
      });
    }

    req.user = {
      id: dbUser._id.toString(),
      role: dbUser.role,
      email: dbUser.email,
      studentId: dbUser.studentId,
      name: dbUser.name,
      isPriority: dbUser.isPriority,
      userType: dbUser.userType,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};

export default authMiddleware;