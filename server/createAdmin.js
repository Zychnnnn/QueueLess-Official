import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import User from "./models/User.js";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

export const ensureAdminAccount = async () => {
  const {
    ADMIN_NAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_STUDENT_ID,
  } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn(
      "Admin setup skipped: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are not configured."
    );
    return;
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existingUser = await User.findOne({ email }).select(
    "name studentId email role"
  );

  if (existingUser) {
    if (existingUser.role !== "admin") {
      throw new Error(
        "Admin email already belongs to a non-admin account; no changes were made."
      );
    }

    console.log("Admin email already exists; no account was created.");
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const user = await User.create({
    name: ADMIN_NAME.trim(),
    studentId: ADMIN_STUDENT_ID || "ADMIN-001",
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin account is ready:");
  console.log({
    name: user.name,
    studentId: user.studentId,
    email: user.email,
    role: user.role,
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => ensureAdminAccount())
    .catch((error) => {
      console.error("Admin setup failed:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}
