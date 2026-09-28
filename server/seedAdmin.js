import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

async function seed() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);

  const hashedPassword = await bcrypt.hash("Admin_Queueless_2026!", 10);

  const res = await mongoose.connection.db.collection("users").updateOne(
    { email: "admin@up.phinma.edu.ph" },
    {
      $set: {
        name: "System Administrator",
        studentId: "ADMIN-001",
        email: "admin@up.phinma.edu.ph",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("Admin account successfully provisioned:", res);
  await mongoose.disconnect();
}

seed().catch(console.error);
