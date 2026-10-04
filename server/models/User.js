import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    studentId: {
      type: String,
      required: false,
      sparse: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
    },

    googleId: {
      type: String,
      sparse: true,
    },

    picture: {
      type: String,
    },

    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      default: "student",
    },

    isPriority: {
      type: Boolean,
      default: false,
    },

    userType: {
      type: String,
      enum: ["priority", "normal"],
      default: "normal",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;