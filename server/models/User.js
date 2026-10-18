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
      select: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
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
      enum: ["student", "staff", "admin", "guest"],
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

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    lastLogin: {
      type: Date,
    },

    // Extended personal & official details
    contactVerified: { type: Boolean, default: false },
    staffIdVerified: { type: Boolean, default: false },
    course: { type: String, default: "" },
    yearLevel: { type: String, default: "" },
    birthDate: { type: String, default: "" },
    gender: { type: String, default: "" },
    civilStatus: { type: String, default: "" },
    nationality: { type: String, default: "" },
    religion: { type: String, default: "" },
    lastName: { type: String, default: "" },
    firstName: { type: String, default: "" },
    middleName: { type: String, default: "" },
    extensionName: { type: String, default: "" },
    nameLastChanged: { type: String, default: "" },
    passwordLastChanged: { type: String, default: "" },
    // Family
    fatherName: { type: String, default: "" },
    fatherOccupation: { type: String, default: "" },
    fatherMobile: { type: String, default: "" },
    motherName: { type: String, default: "" },
    motherOccupation: { type: String, default: "" },
    motherMobile: { type: String, default: "" },
    spouseName: { type: String, default: "" },
    spouseOccupation: { type: String, default: "" },
    numberOfChildren: { type: String, default: "" },
    numberOfBrothers: { type: String, default: "" },
    numberOfSisters: { type: String, default: "" },
    guardianName: { type: String, default: "" },
    guardianRelationship: { type: String, default: "" },
    guardianMobile: { type: String, default: "" },
    // Address
    currentAddress: { type: String, default: "" },
    currentCountry: { type: String, default: "" },
    currentProvince: { type: String, default: "" },
    currentCity: { type: String, default: "" },
    currentPostalCode: { type: String, default: "" },
    sameAsCurrentAddress: { type: Boolean, default: true },
    permanentAddress: { type: String, default: "" },
    permanentCountry: { type: String, default: "" },
    permanentProvince: { type: String, default: "" },
    permanentCity: { type: String, default: "" },
    permanentPostalCode: { type: String, default: "" },
    address: { type: String, default: "" },
    emergencyContact: { type: String, default: "" },
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    // Educational Background
    elemSchool: { type: String, default: "" },
    elemYearGrad: { type: String, default: "" },
    elemType: { type: String, default: "" },
    juniorHighSchool: { type: String, default: "" },
    juniorHighYearGrad: { type: String, default: "" },
    juniorHighType: { type: String, default: "" },
    seniorHighSchool: { type: String, default: "" },
    seniorHighYearGrad: { type: String, default: "" },
    seniorHighType: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const User = mongoose.model("User", userSchema);

export default User;