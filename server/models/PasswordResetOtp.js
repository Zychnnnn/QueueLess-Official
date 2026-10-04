import mongoose from "mongoose";

const passwordResetOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetOtp =
  mongoose.models.PasswordResetOtp ||
  mongoose.model("PasswordResetOtp", passwordResetOtpSchema);

export default PasswordResetOtp;
