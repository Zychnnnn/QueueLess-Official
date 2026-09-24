import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import User from "./models/User.js";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set."
    );
  }

  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const existingUser = await User.findOne({ email }).select(
    "name studentId email role"
  );

  if (existingUser) {
    console.log("Admin email already exists; no account was created.");
    console.log(existingUser);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const user = await User.create({
    name: ADMIN_NAME.trim(),
    studentId: process.env.ADMIN_STUDENT_ID || "ADMIN-001",
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
  await mongoose.disconnect();
};

createAdmin().catch(async (error) => {
  console.error("Admin setup failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
