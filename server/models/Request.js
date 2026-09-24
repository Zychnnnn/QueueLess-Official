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
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;