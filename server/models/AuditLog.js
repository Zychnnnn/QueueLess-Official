import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    actorEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    actorRole: {
      type: String,
      enum: ["admin", "staff", "student", "guest", "system"],
      required: true,
    },
    actorId: {
      type: String,
      default: "",
      trim: true,
    },
    actorPicture: {
      type: String,
      default: "",
    },
    targetCategory: {
      type: String,
      enum: ["staff", "priority", "student", "guest", "system"],
      required: true,
      default: "student",
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },
    requestNumber: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed", "Info"],
      default: "Success",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
