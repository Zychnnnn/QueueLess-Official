import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const resetStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("staff12345", 10);

    const user = await User.findOneAndUpdate(
      { email: "staff@queueless.com" },
      {
        name: "QueueLess Staff",
        studentId: "2022-20001",
        password: hashedPassword,
        role: "staff",
      },
      { returnDocument: "after" }
    ).select("name studentId email role");

    if (!user) {
      console.log("Staff account not found.");
    } else {
      console.log("Staff account updated successfully:");
      console.log(user);
      console.log("");
      console.log("Email: staff@queueless.com");
      console.log("Password: staff12345");
      console.log("Role: staff");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

resetStaff();