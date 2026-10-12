import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    student: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    document: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
    lineNumber: {
      type: Number,
      default: 1,
    },
    priority: {
      type: String,
      enum: ["Regular", "Priority", "Urgent"],
      default: "Regular",
    },
    copies: {
      type: Number,
      default: 1,
    },
    pickupDate: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Ready for Claiming",
        "Claimed",
        "Needs Correction",
      ],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      default: "Proceed to Registrar Staff",
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;