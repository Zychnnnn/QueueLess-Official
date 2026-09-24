import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import User from "./models/User.js";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

const resetStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (
      !process.env.STAFF_EMAIL ||
      !process.env.STAFF_PASSWORD ||
      !process.env.STAFF_NAME
    ) {
      throw new Error(
        "STAFF_NAME, STAFF_EMAIL, and STAFF_PASSWORD must be set."
      );
    }

    if (process.env.STAFF_PASSWORD.length < 8) {
      throw new Error(
        "STAFF_PASSWORD must contain at least 8 characters."
      );
    }

    const hashedPassword = await bcrypt.hash(
      process.env.STAFF_PASSWORD,
      10
    );

    const user = await User.findOneAndUpdate(
      { email: process.env.STAFF_EMAIL.toLowerCase().trim() },
      {
        name: process.env.STAFF_NAME.trim(),
        studentId: process.env.STAFF_STUDENT_ID || "STAFF-001",
        password: hashedPassword,
        role: "staff",
      },
      { returnDocument: "after", runValidators: true }
    ).select("name studentId email role");

    if (!user) {
      console.log("Staff account not found.");
    } else {
      console.log("Staff account updated successfully:");
      console.log(user);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

resetStaff();