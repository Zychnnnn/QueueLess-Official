import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PasswordResetOtp from "../models/PasswordResetOtp.js";
import {
  sendOtpEmail,
  sendAdminRegistrationNotification,
  sendAccountStatusNotification,
  sendSecurityConfirmationEmail,
} from "../services/emailService.js";
import { recordAuditLog } from "./auditController.js";

export const JWT_SECRET = process.env.JWT_SECRET || "queueless-production-secret-key-2026-auth";

// Generate a time-limited security action token for the "That wasn't me" email link
export const generateSecurityActionToken = (userId) => {
  return jwt.sign(
    { userId, purpose: "security-action" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const isSchoolCredential = (email = "", studentId = "") => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanId = studentId ? studentId.trim() : "";

  const isSchoolEmail =
    cleanEmail.includes(".edu.ph") ||
    cleanEmail.endsWith("@phinmaed.com") ||
    cleanEmail.includes("phinma");

  const isOfficialStudentId = cleanId ? /^(\d{2}-\d{4}-\d{5,6}|\d{2}-\d{2}-\d{4}-\d{6})$/.test(cleanId) : false;

  return Boolean(isSchoolEmail || isOfficialStudentId);
};

export const isGuestAccount = (u) => {
  if (!u) return false;
  if (u.role === "admin" || u.role === "staff") return false;
  if (u.role === "guest") return true;
  const email = (u.email || "").toLowerCase().trim();
  if (email.endsWith("@phinmaed.com") || email.includes("phinmaed") || email.endsWith(".edu.ph")) {
    return false;
  }
  if (email.endsWith("@gmail.com")) return true;
  return Boolean(u.studentId && String(u.studentId).startsWith("GUEST"));
};

export const COMMON_COMPROMISED_PASSWORDS = new Set([
  "password1234", "password12345", "password123456", "123456789012", "1234567890123",
  "qwerty123456", "admin1234567", "admin12345678", "queueless1234",
  "queueless12345", "password@1234", "p@ssword1234", "welcome12345!",
  "administrator1", "phinmaupang123", "iloveyou12345", "changeme12345",
  "upangpassword1", "password2026!", "secret123456"
]);

export const isStrongPassword = (pwd = "") => {
  if (typeof pwd !== "string" || pwd.length < 12) return false;
  if (/\s/.test(pwd)) return false; // Reject passwords containing spaces
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) return false;
  if (COMMON_COMPROMISED_PASSWORDS.has(pwd.toLowerCase().trim())) return false;
  return true;
};

export const formatUserObject = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name || "",
    studentId: user.studentId || "",
    email: user.email || "",
    role: user.role || "student",
    picture: user.picture || "",
    phone: user.phone || "",
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : "",
    isPriority: user.isPriority,
    userType: user.userType,
    approvalStatus: user.approvalStatus || "approved",
    status: user.status || (user.contactVerified === false ? "pending_activation" : "active"),
    createdAt: user.createdAt,
    contactVerified: Boolean(user.contactVerified),
    staffIdVerified: Boolean(user.staffIdVerified),
    termsAccepted: Boolean(user.termsAccepted),
    termsAcceptedAt: user.termsAcceptedAt ? user.termsAcceptedAt.toISOString() : "",
    course: user.course || "",
    yearLevel: user.yearLevel || "",
    birthDate: user.birthDate || "",
    gender: user.gender || "",
    civilStatus: user.civilStatus || "",
    nationality: user.nationality || "",
    religion: user.religion || "",
    lastName: user.lastName || "",
    firstName: user.firstName || "",
    middleName: user.middleName || "",
    extensionName: user.extensionName || "",
    nameLastChanged: user.nameLastChanged || "",
    passwordLastChanged: user.passwordLastChanged || "",
    fatherName: user.fatherName || "",
    fatherOccupation: user.fatherOccupation || "",
    fatherMobile: user.fatherMobile || "",
    motherName: user.motherName || "",
    motherOccupation: user.motherOccupation || "",
    motherMobile: user.motherMobile || "",
    spouseName: user.spouseName || "",
    spouseOccupation: user.spouseOccupation || "",
    numberOfChildren: user.numberOfChildren || "0",
    numberOfBrothers: user.numberOfBrothers || "0",
    numberOfSisters: user.numberOfSisters || "0",
    guardianName: user.guardianName || "",
    guardianRelationship: user.guardianRelationship || "",
    guardianMobile: user.guardianMobile || "",
    currentAddress: user.currentAddress || user.address || "",
    currentCountry: user.currentCountry || "Philippines",
    currentProvince: user.currentProvince || "Pangasinan",
    currentCity: user.currentCity || "Dagupan City",
    currentPostalCode: user.currentPostalCode || "2400",
    sameAsCurrentAddress: user.sameAsCurrentAddress !== false,
    permanentAddress: user.permanentAddress || user.address || "",
    permanentCountry: user.permanentCountry || "Philippines",
    permanentProvince: user.permanentProvince || "Pangasinan",
    permanentCity: user.permanentCity || "Dagupan City",
    permanentPostalCode: user.permanentPostalCode || "2400",
    address: user.address || user.currentAddress || "",
    emergencyContact: user.emergencyContact || "",
    elemSchool: user.elemSchool || "",
    elemYearGrad: user.elemYearGrad || "",
    elemType: user.elemType || "",
    juniorHighSchool: user.juniorHighSchool || "",
    juniorHighYearGrad: user.juniorHighYearGrad || "",
    juniorHighType: user.juniorHighType || "",
    seniorHighSchool: user.seniorHighSchool || "",
    seniorHighYearGrad: user.seniorHighYearGrad || "",
    seniorHighType: user.seniorHighType || "",
  };
};

export const register = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentId = studentId ? studentId.trim() : "";

    const isEduPh = cleanEmail.includes(".edu.ph") || cleanEmail.includes("phinmaed.com");

    if (!isEduPh) {
      return res.status(400).json({
        message:
          "Account creation is strictly for students with an official school email (.edu.ph or @phinmaed.com).",
      });
    }

    if (!cleanStudentId) {
      return res.status(400).json({
        message: "Student ID is required for student registration (e.g. 00-0000-000000).",
      });
    }

    const studentIdPattern = /^(\d{2}-\d{4}-\d{5,6}|\d{2}-\d{2}-\d{4}-\d{6})$/;
    if (!studentIdPattern.test(cleanStudentId)) {
      return res.status(400).json({
        message:
          "Invalid Student ID format. Please use the format 00-0000-000000 or 00-00-0000-000000 (e.g. 02-2223-012345).",
      });
    }

    const existingId = await User.findOne({ studentId: cleanStudentId });
    if (existingId) {
      return res.status(409).json({
        message: "A student with this Student ID is already registered.",
      });
    }

    const finalStudentId = cleanStudentId;
    const isPriority = true;
    const userType = "priority";

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      studentId: finalStudentId,
      email: cleanEmail,
      password: hashedPassword,
      role: "student",
      isPriority,
      userType,
      approvalStatus: "pending",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    sendAdminRegistrationNotification({
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      userType: user.userType,
    }).catch((err) => console.error("Admin notification error:", err));

    return res.status(201).json({
      message: "Thank you for joining us! Please just wait for 24hrs to be reviewed.",
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
        isPriority: user.isPriority,
        userType: user.userType,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
};

export const registerGuest = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const guestId = "GUEST-" + Math.floor(10000 + Math.random() * 90000);
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      studentId: guestId,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: "guest",
      isPriority: false,
      userType: "normal",
      approvalStatus: "approved",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      lastLogin: new Date(),
    });

    const token = jwt.sign({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0, },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    recordAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: "guest",
      actorId: user.studentId || String(user._id),
      targetCategory: "guest",
      action: "Guest Registration",
      details: `New guest account registered for ${user.name} (${user.studentId}, ${user.email}).`,
      status: "Success",
    });

    return res.status(201).json({
      message: "Guest account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        phone: user.phone || "",
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : new Date().toISOString(),
        role: user.role,
        isPriority: false,
        userType: "normal",
      },
    });
  } catch (error) {
    console.error("registerGuest error:", error);
    return res.status(500).json({
      message: "Server error during guest registration.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, studentId, identifier: rawIdentifier, password, loginType } = req.body;
    const inputIdentifier = (email || studentId || rawIdentifier || "").trim();

    if (!inputIdentifier || !password) {
      return res.status(400).json({
        message: "Student ID or Email, and password are required.",
      });
    }

    const cleanLower = inputIdentifier.toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: cleanLower },
        { studentId: inputIdentifier },
        { studentId: inputIdentifier.toUpperCase() },
      ],
    }).select("+password");

    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        message: `Account is temporarily locked due to repeated failed login attempts. Please wait ${remainingMinutes} minute(s) before trying again, or reset your password.`,
      });
    }

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email/ID or password.",
      });
    }

    // RBAC: All user roles (admin, staff, student, guest) can sign in from the portal
    // and will be routed to their respective dashboard based on their role.

    if (user.approvalStatus === "pending" && user.role !== "admin" && user.role !== "staff") {
      return res.status(403).json({
        message:
          "Your account is pending review. Please wait up to 24 hours for administrator approval.",
      });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({
        message:
          "Your registration was not approved. Please contact the registrar office for assistance.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
      }
      await user.save();
      return res.status(401).json({
        message: "Invalid email/ID or password.",
      });
    }

    // Reset failed login attempts on successful credentials match
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // 2FA Security: Generate 6-digit OTP code before entering the system
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    await PasswordResetOtp.findOneAndUpdate(
      { email: user.email.toLowerCase().trim() },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    let emailSent = false;
    try {
      const emailResult = await sendOtpEmail(user.email, otp, "QueueLess Login Authentication Code");
      emailSent = Boolean(emailResult && emailResult.sent);
    } catch (err) {
      console.error("Login OTP email error:", err);
    }
    console.log(`[QueueLess 2FA Login OTP] Generated code for ${user.email} (${user.name}): ${otp}, delivered: ${emailSent}`);

    const atIndex = user.email.indexOf("@");
    const maskedEmail =
      atIndex > 2
        ? `${user.email.slice(0, 2)}***${user.email.slice(atIndex)}`
        : user.email;

    return res.status(200).json({
      requiresOtp: true,
      email: user.email,
      maskedEmail,
      message: emailSent
        ? `A 6-digit verification code has been sent to ${maskedEmail}. Please enter the code to access your account.`
        : `Verification code generated for ${maskedEmail}. If email is delayed, code is ready for verification.`,
      debugOtp: emailSent ? undefined : otp,
    });
  } catch (error) {
    console.error("Login error:", error);

    const isDbError =
      error.name === "MongoNetworkError" ||
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoServerSelectionError" ||
      (error.message && (error.message.includes("connect") || error.message.includes("timed out") || error.message.includes("buffering")));

    return res.status(500).json({
      message: isDbError
        ? "Database connection error. Please ensure your current IP address is whitelisted in MongoDB Atlas."
        : "Server error during login.",
    });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, termsAccepted } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanOtp = (otp || "").toString().trim();

    if (!cleanEmail || !cleanOtp) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    const otpRecord = await PasswordResetOtp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid verification code. Please check your email and try again." });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    await PasswordResetOtp.deleteOne({ _id: otpRecord._id });

    // Reset failed login attempts on successful authentication
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    if (termsAccepted) {
      user.termsAccepted = true;
      if (!user.termsAcceptedAt) {
        user.termsAcceptedAt = new Date();
      }
    }
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0, },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const isGuest = isGuestAccount(user);
    recordAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: isGuest ? "guest" : user.role,
      actorId: user.studentId || String(user._id),
      actorPicture: user.picture || "",
      targetCategory: user.role === "staff" ? "staff" : isGuest ? "guest" : (user.isPriority || user.userType === "priority") ? "priority" : "student",
      action: `${user.role === "staff" ? "Staff" : user.role === "admin" ? "Admin" : isGuest ? "Guest" : "Student"} OTP Sign In Verified`,
      details: `${isGuest ? "Guest " : ""}${user.name} successfully verified OTP authentication and entered QueueLess.`,
      status: "Success",
    });

    try {
      const securityToken = generateSecurityActionToken(user._id);
      const frontendBase = process.env.FRONTEND_URL || process.env.VITE_APP_URL || "https://queue-less-official.vercel.app";
      const logoutUrl = `${frontendBase}?security-action=logout&token=${encodeURIComponent(securityToken)}&email=${encodeURIComponent(user.email)}`;
      const resetPasswordUrl = `${frontendBase}?security-action=reset-password&token=${encodeURIComponent(securityToken)}&email=${encodeURIComponent(user.email)}`;

      sendSecurityConfirmationEmail({
        toEmail: user.email,
        userName: user.name,
        actionType: "Account Sign-In (Verified)",
        details: `Your QueueLess account was accessed via verified OTP authentication on ${new Date().toLocaleString()}. You can continue using QueueLess safely.`,
        logoutUrl,
        resetPasswordUrl,
      }).catch((err) => console.error("OTP login security email error:", err));
    } catch (err) {
      console.error("Error sending OTP login security notice:", err);
    }

    return res.status(200).json({
      message: "Authentication successful! Welcome to QueueLess.",
      token,
      user: formatUserObject(user),
    });
  } catch (error) {
    console.error("verifyLoginOtp error:", error);
    return res.status(500).json({ message: "Server error while verifying login code." });
  }
};

export const resendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await PasswordResetOtp.findOneAndUpdate(
      { email: cleanEmail },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    let resendDelivered = false;
    try {
      const emailResult = await sendOtpEmail(cleanEmail, otp, "QueueLess Login Authentication Code");
      resendDelivered = Boolean(emailResult && emailResult.sent);
    } catch (err) {
      console.error("Resend login OTP email error:", err);
    }
    console.log(`[QueueLess Resend 2FA Login] OTP for ${cleanEmail}: ${otp}, delivered: ${resendDelivered}`);

    const atIndex = cleanEmail.indexOf("@");
    const maskedEmail =
      atIndex > 2
        ? `${cleanEmail.slice(0, 2)}***${cleanEmail.slice(atIndex)}`
        : cleanEmail;

    return res.status(200).json({
      message: resendDelivered
        ? `A fresh 6-digit verification code has been sent to ${maskedEmail}.`
        : `Fresh verification code generated. If email delivery is delayed, your code is: ${otp}`,
      debugOtp: resendDelivered ? undefined : otp,
    });
  } catch (error) {
    console.error("resendLoginOtp error:", error);
    return res.status(500).json({ message: "Server error while resending verification code." });
  }
};

export const createStaffAccount = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(409).json({
        message: "A staff or user account with this email already exists.",
      });
    }

    const staffCount = await User.countDocuments({ role: "staff" });
    const finalStaffId = req.body.staffId && req.body.staffId.trim()
      ? req.body.staffId.trim()
      : `STAFF-${String(staffCount + 1).padStart(3, "0")}`;

    const idFormatRegex = /^(UP-\d{2}-\d{3}-[A-Z]|STAFF-\d{3,4})$/i;
    if (finalStaffId && !idFormatRegex.test(finalStaffId)) {
      return res.status(400).json({
        message: "Staff ID must follow the official format: UP-00-000-T (e.g. UP-23-197-T) or STAFF-001. Maximum length: 11 characters.",
      });
    }
    const existingStaffId = await User.findOne({ studentId: finalStaffId });
    if (existingStaffId) {
      return res.status(409).json({
        message: `Staff ID "${finalStaffId}" is already assigned to another account.`,
      });
    }

    // Generate secure temporary password or validate provided password
    let tempPassword = `Staff@${Math.floor(100000 + Math.random() * 900000)}`;
    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({
          message: "Provided password must be at least 12 characters long and contain uppercase, lowercase, number, and special character with no spaces.",
        });
      }
      tempPassword = req.body.password;
    }

    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      studentId: finalStaffId,
      password: hashedPassword,
      role: "staff",
      approvalStatus: "approved",
      contactVerified: false,
      status: "pending_activation",
    });

    // Generate 6-digit OTP code valid for 24 hours
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await PasswordResetOtp.deleteMany({ email: cleanEmail });
    await PasswordResetOtp.create({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendOtpEmail(cleanEmail, otp);
    } catch (err) {
      console.error("Staff creation OTP email error:", err);
    }

    recordAuditLog({
      actorName: req.user?.name || "System Admin",
      actorEmail: req.user?.email || "admin@queueless.edu.ph",
      actorRole: req.user?.role || "admin",
      actorId: req.user?.studentId || "ADMIN",
      targetCategory: "staff",
      action: `Created Staff Account: ${user.name}`,
      details: `Admin created staff account for ${user.name} (${user.studentId}, ${cleanEmail}). Temporary password and 6-digit verification OTP emailed.`,
      status: "Success",
    });

    return res.status(201).json({
      message: `Staff account created successfully! A 6-digit OTP verification code and temporary login instructions have been sent to ${cleanEmail}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
      temporaryPassword: tempPassword,
      otp,
    });
  } catch (error) {
    console.error("Create staff error:", error);
    return res.status(500).json({
      message: "Server error while creating staff account.",
    });
  }
};

export const createStudentByAdmin = async (req, res) => {
  try {
    const { name, email, studentId, course, yearLevel } = req.body;

    if (!name || !email || !studentId) {
      return res.status(400).json({
        message: "Full name, student email, and student ID are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentId = studentId.trim();

    const studentIdPattern = /^(\d{2}-\d{4}-\d{5,6}|\d{2}-\d{2}-\d{4}-\d{6})$/;
    if (!studentIdPattern.test(cleanStudentId)) {
      return res.status(400).json({
        message: "Student ID must follow official format: 00-0000-000000 or 00-00-0000-000000 (e.g. 02-2223-012345). Maximum length: 17 characters.",
      });
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const existingId = await User.findOne({ studentId: cleanStudentId });
    if (existingId) {
      return res.status(409).json({
        message: `Student ID "${cleanStudentId}" is already registered.`,
      });
    }

    const tempPassword = req.body.password && req.body.password.length >= 8
      ? req.body.password
      : `Student@${Math.floor(100000 + Math.random() * 900000)}`;

    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      studentId: cleanStudentId,
      password: hashedPassword,
      role: "student",
      userType: "priority",
      isPriority: true,
      approvalStatus: "approved",
      contactVerified: false,
      status: "pending_activation",
      course: course ? course.trim() : "BS Information Technology",
      yearLevel: yearLevel ? yearLevel.trim() : "1st Year",
    });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await PasswordResetOtp.deleteMany({ email: cleanEmail });
    await PasswordResetOtp.create({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendOtpEmail(cleanEmail, otp);
    } catch (err) {
      console.error("Student creation OTP email error:", err);
    }

    recordAuditLog({
      actorName: req.user?.name || "System Admin",
      actorEmail: req.user?.email || "admin@queueless.edu.ph",
      actorRole: req.user?.role || "admin",
      actorId: req.user?.studentId || "ADMIN",
      targetCategory: "priority",
      action: `Created Student Account: ${user.name}`,
      details: `Admin created student account for ${user.name} (ID: ${cleanStudentId}, Program: ${user.course}, Year: ${user.yearLevel}). Verification OTP emailed.`,
      status: "Success",
    });

    return res.status(201).json({
      message: `Student account created successfully! A 6-digit OTP verification code and temporary login instructions have been sent to ${cleanEmail}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        course: user.course,
        yearLevel: user.yearLevel,
        contactVerified: user.contactVerified,
        status: user.status,
      },
      temporaryPassword: tempPassword,
      otp,
    });
  } catch (error) {
    console.error("Create student by admin error:", error);
    return res.status(500).json({
      message: "Server error while creating student account.",
    });
  }
};

export const createAdminByAdmin = async (req, res) => {
  try {
    const { name, email, adminId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Full name and admin email are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const adminCount = await User.countDocuments({ role: "admin" });
    const finalAdminId = adminId && adminId.trim()
      ? adminId.trim()
      : `ADMIN-${String(adminCount + 1).padStart(3, "0")}`;

    const adminIdRegex = /^ADMIN(\s*-\s*|-)\d{3}$/i;
    if (finalAdminId && !adminIdRegex.test(finalAdminId)) {
      return res.status(400).json({
        message: "Admin ID must follow the official format: ADMIN - 000 or ADMIN-000 (e.g. ADMIN - 001). Maximum length: 11 characters.",
      });
    }
    const existingAdminId = await User.findOne({ studentId: finalAdminId });
    if (existingAdminId) {
      return res.status(409).json({
        message: `Admin ID "${finalAdminId}" is already assigned to another account.`,
      });
    }

    let tempPassword = `Admin@${Math.floor(100000 + Math.random() * 900000)}`;
    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({
          message: "Provided password must be at least 12 characters long and contain uppercase, lowercase, number, and special character with no spaces.",
        });
      }
      tempPassword = req.body.password;
    }

    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      studentId: finalAdminId,
      password: hashedPassword,
      role: "admin",
      approvalStatus: "approved",
      contactVerified: false,
      status: "pending_activation",
    });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await PasswordResetOtp.deleteMany({ email: cleanEmail });
    await PasswordResetOtp.create({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendOtpEmail(cleanEmail, otp);
    } catch (err) {
      console.error("Admin creation OTP email error:", err);
    }

    recordAuditLog({
      actorName: req.user?.name || "System Admin",
      actorEmail: req.user?.email || "admin@queueless.edu.ph",
      actorRole: req.user?.role || "admin",
      actorId: req.user?.studentId || "ADMIN",
      targetCategory: "staff",
      action: `Created Administrator Account: ${user.name}`,
      details: `Admin created administrator account for ${user.name} (${user.studentId}, ${cleanEmail}). Temporary password and 6-digit verification OTP emailed.`,
      status: "Success",
    });

    return res.status(201).json({
      message: `Administrator account created successfully! A 6-digit OTP verification code and temporary login instructions have been sent to ${cleanEmail}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        contactVerified: user.contactVerified,
        status: user.status,
      },
      temporaryPassword: tempPassword,
      otp,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({
      message: "Server error while creating administrator account.",
    });
  }
};

export const createStaff = createStaffAccount;

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users fetched successfully.",
      users: users.map(formatUserObject),
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    return res.status(500).json({
      message: "Server error while fetching users.",
    });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    user.approvalStatus = "approved";
    await user.save();

    sendAccountStatusNotification({
      toEmail: user.email,
      name: user.name,
      status: "approved",
    }).catch((err) => console.error("Status email error:", err));

    return res.status(200).json({
      message: `${user.name} has been admitted/approved.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Approve user error:", error);
    return res.status(500).json({
      message: "Server error while approving user.",
    });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    user.approvalStatus = "rejected";
    await user.save();

    await recordAuditLog({
      actorName: req.user?.name || "Administrator",
      actorEmail: req.user?.email || "",
      actorRole: req.user?.role || "admin",
      actorId: req.user?.studentId || req.user?.id || "ADMIN",
      targetCategory: "users",
      action: `Rejected Registration: ${user.name} (${user.role})`,
      details: `Account registration for ${user.name} (${user.role}, ${user.email}, ID: ${user.studentId || "N/A"}) was rejected by ${req.user?.name || "Administrator"}.`,
      status: "Warning",
      metadata: {
        rejectedUser: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          rejectedAt: new Date().toISOString(),
        },
      },
    });

    sendAccountStatusNotification({
      toEmail: user.email,
      name: user.name,
      status: "rejected",
    }).catch((err) => console.error("Status email error:", err));

    return res.status(200).json({
      message: `${user.name}'s registration has been rejected.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Reject user error:", error);
    return res.status(500).json({
      message: "Server error while rejecting user.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === id) {
      return res.status(400).json({
        message: "You cannot delete your own admin account while logged in.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    await User.findByIdAndDelete(id);

    const deleteReason = req.body?.reason || "Administrative removal";
    await recordAuditLog({
      actorName: req.user?.name || "Administrator",
      actorEmail: req.user?.email || "",
      actorRole: req.user?.role || "admin",
      actorId: req.user?.studentId || req.user?.id || "ADMIN",
      targetCategory: "users",
      action: `Deleted User Account: ${user.name} (${user.role})`,
      details: `User account for ${user.name} (${user.role}, ${user.email}, ID: ${user.studentId || "N/A"}) was deleted. Reason: ${deleteReason}`,
      status: "Warning",
      metadata: {
        deletedUser: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          deletedAt: new Date().toISOString(),
          reason: deleteReason,
        },
      },
    });

    return res.status(200).json({
      message: `${user.name} (${user.role}) has been deleted.`,
      deletedUserId: id,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      message: "Server error while deleting user.",
    });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatableFields = [
      "name", "studentId", "email", "phone", "role", "approvalStatus", "isPriority", "userType",
      "course", "yearLevel", "birthDate", "gender", "civilStatus", "nationality", "religion",
      "lastName", "firstName", "middleName", "extensionName",
      "fatherName", "fatherOccupation", "fatherMobile",
      "motherName", "motherOccupation", "motherMobile",
      "spouseName", "spouseOccupation", "numberOfChildren", "numberOfBrothers", "numberOfSisters",
      "guardianName", "guardianRelationship", "guardianMobile",
      "currentAddress", "currentCountry", "currentProvince", "currentCity", "currentPostalCode",
      "sameAsCurrentAddress", "permanentAddress", "permanentCountry", "permanentProvince",
      "permanentCity", "permanentPostalCode", "address", "emergencyContact",
      "elemSchool", "elemYearGrad", "elemType",
      "juniorHighSchool", "juniorHighYearGrad", "juniorHighType",
      "seniorHighSchool", "seniorHighYearGrad", "seniorHighType"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.firstName !== undefined || req.body.lastName !== undefined) {
      const fName = (user.firstName || "").trim();
      const mName = (user.middleName || "").trim();
      const lName = (user.lastName || "").trim();
      const ext = (user.extensionName || "").trim();
      user.name = [fName, mName, lName, ext].filter(Boolean).join(" ") || user.name;
    }

    await user.save();

    recordAuditLog({
      action: "Admin Updated Official Records",
      actorId: req.user.studentId || req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      actorEmail: req.user.email,
      targetCategory: user.role === "staff" ? "staff" : user.role === "guest" ? "guest" : "student",
      details: `Administrator updated official records and personal details for ${user.name} (${user.studentId || user.email}).`,
      status: "Success",
    });

    return res.status(200).json({
      message: "User official records updated successfully.",
      user: formatUserObject(user),
    });
  } catch (error) {
    console.error("updateUserByAdmin error:", error);
    return res.status(500).json({ message: "Server error while updating user records." });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential, access_token, loginType } = req.body;

    if (!credential && !access_token) {
      return res.status(400).json({
        message: "Google credential or access token is required.",
      });
    }

    let payload;

    if (access_token) {
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json().catch(() => ({}));
        return res.status(401).json({
          message: errData.error_description || "Invalid Google access token.",
        });
      }

      payload = await profileRes.json();
    } else {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );

      if (!googleRes.ok) {
        const errData = await googleRes.json().catch(() => ({}));
        return res.status(401).json({
          message: errData.error_description || "Invalid or expired Google token.",
        });
      }

      payload = await googleRes.json();
    }

    const { email, name, sub: googleId, picture, email_verified } = payload;

    if (!email) {
      return res.status(400).json({
        message: "Google account does not have an associated email address.",
      });
    }

    if (email_verified === "false" || email_verified === false) {
      return res.status(403).json({
        message: "Google email address is not verified.",
      });
    }

    if (credential && process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({
        message: "Google Client ID mismatch.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isPriority = isSchoolCredential(cleanEmail, "");
    const userType = isPriority ? "priority" : "normal";

    let user = await User.findOne({ email: cleanEmail });

    // RBAC: Any registered user (student, staff, admin) can authenticate with Google

    if (!user) {
      const idMatch = cleanEmail.match(/^(\d{4}-\d{5})/);
      const studentId = idMatch
        ? idMatch[1]
        : (isPriority
            ? `2026-${Math.floor(10000 + Math.random() * 90000)}`
            : `GUEST-${Math.floor(10000 + Math.random() * 90000)}`);

      user = await User.create({
        name: name || cleanEmail.split("@")[0],
        studentId,
        email: cleanEmail,
        role: "student",
        googleId,
        picture,
        isPriority,
        userType,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        lastLogin: new Date(),
      });
    } else {
      let needsSave = false;
      if (!user.termsAccepted) {
        user.termsAccepted = true;
        user.termsAcceptedAt = new Date();
        needsSave = true;
      }
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (picture && !user.picture) {
        user.picture = picture;
        needsSave = true;
      }
      if (user.isPriority === undefined || !user.userType) {
        user.isPriority = isSchoolCredential(user.email, user.studentId);
        user.userType = user.isPriority ? "priority" : "normal";
        needsSave = true;
      }
      user.lastLogin = new Date();
      needsSave = true;
      if (needsSave) {
        await user.save();
      }
    }

    // Generate a time-limited security action token for "That wasn't me"
    const securityToken = generateSecurityActionToken(user._id);
    const frontendBase = process.env.FRONTEND_URL || process.env.VITE_APP_URL || "https://queue-less-official.vercel.app";
    const logoutUrl = `${frontendBase}?security-action=logout&token=${encodeURIComponent(securityToken)}&email=${encodeURIComponent(user.email)}`;
    const resetPasswordUrl = `${frontendBase}?security-action=reset-password&token=${encodeURIComponent(securityToken)}&email=${encodeURIComponent(user.email)}`;

    sendSecurityConfirmationEmail({
      toEmail: user.email,
      userName: user.name,
      actionType: "Google Sign-In",
      details: `Your account was accessed via Google authentication on ${new Date().toLocaleString()}. You can continue using QueueLess system safely.`,
      logoutUrl,
      resetPasswordUrl,
    }).catch((err) => console.error("Google sign-in security email error:", err));

    const isGuest = isGuestAccount(user);
    recordAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: isGuest ? "guest" : user.role,
      actorId: user.studentId || String(user._id),
      actorPicture: user.picture || "",
      targetCategory: user.role === "staff" ? "staff" : isGuest ? "guest" : (user.isPriority || user.userType === "priority") ? "priority" : "student",
      action: isGuest ? "Guest Google Sign In" : "Google OAuth Sign In",
      details: `${isGuest ? "Guest " : ""}${user.name} signed in via Google account (${user.email}).`,
      status: "Success",
    });

    const token = jwt.sign({ id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0, },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Google sign-in successful.",
      token,
      user: formatUserObject(user),
    });
  } catch (error) {
    console.error("Google sign-in error:", error);

    const isDbError =
      error.name === "MongoNetworkError" ||
      error.name === "MongooseServerSelectionError" ||
      error.name === "MongoServerSelectionError" ||
      (error.message &&
        (error.message.includes("connect") ||
          error.message.includes("timed out") ||
          error.message.includes("buffering")));
    return res.status(500).json({
      message: isDbError
        ? "Database connection error. Please ensure your current IP address is whitelisted in MongoDB Atlas."
        : "Server error during Google sign-in.",
    });
  }
};

export const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email, identifier, role } = req.body;
    const input = (identifier || email || "").trim();

    if (!input) {
      return res.status(400).json({
        message: "Email address or account ID is required.",
      });
    }

    const cleanInput = input.toLowerCase();
    const query = {
      $or: [
        { email: cleanInput },
        { studentId: input },
        { studentId: input.toUpperCase() },
      ],
    };

    if (role === "admin" || role === "staff") {
      query.role = role;
    } else if (role === "student" || role === "guest") {
      query.role = { $in: ["student", "guest"] };
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(200).json({
        message:
          "If that account exists in our records, a 6-digit verification code has been dispatched. Please check your inbox.",
        email: cleanInput,
        maskedEmail: cleanInput,
        emailSent: true,
      });
    }

    const userEmail = user.email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordResetOtp.findOneAndUpdate(
      { email: userEmail },
      {
        otp,
        expiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    const sendResult = await sendOtpEmail(userEmail, otp);

    const atIndex = userEmail.indexOf("@");
    const maskedEmail =
      atIndex > 2
        ? `${userEmail.slice(0, 2)}***${userEmail.slice(atIndex)}`
        : userEmail;

    return res.status(200).json({
      message:
        "If that account exists in our records, a 6-digit verification code has been dispatched. Please check your inbox.",
      email: userEmail,
      maskedEmail,
      emailSent: sendResult?.sent ?? false,
    });
  } catch (error) {
    console.error("requestPasswordResetOtp error:", error);
    return res.status(500).json({
      message: "Server error while sending verification code.",
    });
  }
};

export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, identifier, otp } = req.body;
    const input = (email || identifier || "").trim();

    if (!input || !otp) {
      return res.status(400).json({
        message: "Email or account ID and verification code are required.",
      });
    }

    let cleanEmail = input.toLowerCase();

    if (!cleanEmail.includes("@")) {
      const user = await User.findOne({
        $or: [
          { studentId: input },
          { studentId: input.toUpperCase() },
          { email: cleanEmail },
        ],
      });
      if (user && user.email) {
        cleanEmail = user.email.toLowerCase().trim();
      }
    }

    const cleanOtp = String(otp).trim();

    const record = await PasswordResetOtp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (!record) {
      return res.status(400).json({
        message: "Invalid verification code. Please check your inbox and try again.",
      });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    record.verified = true;
    await record.save();

    return res.status(200).json({
      message: "Code verified successfully.",
      email: cleanEmail,
    });
  } catch (error) {
    console.error("verifyPasswordResetOtp error:", error);
    return res.status(500).json({
      message: "Server error while verifying code.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, identifier, otp, newPassword } = req.body;
    const input = (email || identifier || "").trim();

    if (!input || !otp || !newPassword) {
      return res.status(400).json({
        message: "Account identifier, verification code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    let cleanEmail = input.toLowerCase();

    if (!cleanEmail.includes("@")) {
      const existingUser = await User.findOne({
        $or: [
          { studentId: input },
          { studentId: input.toUpperCase() },
          { email: cleanEmail },
        ],
      });
      if (existingUser && existingUser.email) {
        cleanEmail = existingUser.email.toLowerCase().trim();
      }
    }

    const cleanOtp = String(otp).trim();

    const record = await PasswordResetOtp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (!record) {
      return res.status(400).json({
        message: "Invalid verification code. Please check your inbox and try again.",
      });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({
        message: "Session expired. Please request a new verification code.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        message: "Account not found in the database.",
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.contactVerified = true;
    user.passwordLastChanged = new Date().toISOString();
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await PasswordResetOtp.deleteOne({ _id: record._id });

    return res.status(200).json({
      message: "Password reset successfully. You can now sign in with your new password.",
      role: user.role,
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      message: "Server error while resetting password.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, picture } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatableFields = [
      "name", "studentId", "phone", "picture", "contactVerified", "staffIdVerified", "course", "yearLevel", "birthDate",
      "gender", "civilStatus", "nationality", "religion", "lastName", "firstName",
      "middleName", "extensionName", "nameLastChanged", "passwordLastChanged", "fatherName", "fatherOccupation",
      "fatherMobile", "motherName", "motherOccupation", "motherMobile", "spouseName",
      "spouseOccupation", "numberOfChildren", "numberOfBrothers", "numberOfSisters",
      "guardianName", "guardianRelationship", "guardianMobile", "currentAddress",
      "currentCountry", "currentProvince", "currentCity", "currentPostalCode",
      "sameAsCurrentAddress", "permanentAddress", "permanentCountry", "permanentProvince",
      "permanentCity", "permanentPostalCode", "address", "emergencyContact",
      "elemSchool", "elemYearGrad", "elemType",
      "juniorHighSchool", "juniorHighYearGrad", "juniorHighType",
      "seniorHighSchool", "seniorHighYearGrad", "seniorHighType",
      "termsAccepted", "termsAcceptedAt"
    ];

    // Institutional Lock: Once a Staff ID Number is verified, staff cannot edit it; only admin can override.
    if (
      user.role === "staff" &&
      user.staffIdVerified &&
      req.body.studentId &&
      req.body.studentId.trim().toLowerCase() !== (user.studentId || "").trim().toLowerCase()
    ) {
      return res.status(403).json({
        message: "Your Staff ID Number is verified and locked. Only a System Administrator can modify or override this ID.",
      });
    }

    // Student Lock: Once a Student ID Number is verified, students cannot edit it; only admin can override.
    if (
      user.role === "student" &&
      user.contactVerified &&
      user.studentId &&
      req.body.studentId &&
      req.body.studentId.trim().toLowerCase() !== user.studentId.trim().toLowerCase()
    ) {
      return res.status(403).json({
        message: "Your Student ID Number is verified and locked. Only an administrator can update your Student ID.",
      });
    }

    const oldEmail = user.email;
    let emailChanged = false;
    let newEmail = "";
    if (req.body.email && req.body.email.toLowerCase().trim() !== oldEmail) {
      newEmail = req.body.email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
      if (existingEmail) {
        return res.status(400).json({ message: "That email address is already in use by another account." });
      }

      const cleanOtp = (req.body.otp || "").toString().trim();
      if (!cleanOtp) {
        return res.status(400).json({
          message: `A 6-digit confirmation code sent to ${newEmail} is required to change your email address.`,
        });
      }

      const otpRecord = await PasswordResetOtp.findOne({
        email: newEmail,
        otp: cleanOtp,
      });

      if (!otpRecord) {
        return res.status(400).json({
          message: "Invalid confirmation code for email change. Please check your inbox and try again.",
        });
      }

      if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({
          message: "Verification code has expired. Please request a new code.",
        });
      }

      await PasswordResetOtp.deleteOne({ _id: otpRecord._id });
      user.email = newEmail;
      emailChanged = true;
    }

    const isAdmin = user.role === "admin";
    const isNameLocked = Boolean(user.nameLastChanged || (user.lastName && user.firstName));

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Enforce institutional locks: only admin can modify student ID or already-locked legal name
        if (!isAdmin && field === "studentId") {
          return; // Student cannot alter official student ID
        }
        if (!isAdmin && isNameLocked && ["name", "lastName", "firstName", "middleName", "extensionName"].includes(field)) {
          return; // Legal name is locked from modification by student/staff
        }
        user[field] = req.body[field];
      }
    });

    // If first-time name registration by student, lock the legal name
    if (!isAdmin && !isNameLocked && (req.body.lastName || req.body.firstName)) {
      user.nameLastChanged = new Date().toISOString();
    }

    if (user.termsAccepted && !user.termsAcceptedAt) {
      user.termsAcceptedAt = new Date();
    }

    await user.save();

    if (emailChanged) {
      sendSecurityConfirmationEmail({
        toEmail: user.email,
        userName: user.name,
        actionType: "Email Address Updated",
        details: `Your account email address was changed to ${user.email}. If you made this change, you can continue using QueueLess system safely.`,
      }).catch((err) => console.error("Email change security email error:", err));
    }

    const isGuest = isGuestAccount(user);
    recordAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: isGuest ? "guest" : user.role,
      actorId: user.studentId || String(user._id),
      actorPicture: user.picture || "",
      targetCategory: user.role === "staff" ? "staff" : isGuest ? "guest" : (user.isPriority || user.userType === "priority") ? "priority" : "student",
      action: user.role === "staff" ? "Staff Profile Updated" : isGuest ? "Guest Profile Updated" : "Student Profile Updated",
      details: `${isGuest ? "Guest " : ""}${user.name} updated account details${emailChanged ? ` (Email changed from ${oldEmail} to ${newEmail})` : ""}.`,
      status: "Success",
    });

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: formatUserObject(user),
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server error while updating profile." });
  }
};

export const sendSecurityOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    const { action, targetEmail, currentPassword } = req.body;
    let recipientEmail = user.email.toLowerCase().trim();

    if (action === "change_password") {
      const userWithPw = await User.findById(userId).select("+password");
      // If user has an existing password, verify the current password
      if (userWithPw && userWithPw.password) {
        if (!currentPassword) {
          return res.status(400).json({
            message: "Current password is required. Please enter your accurate old password.",
          });
        }
        const isMatch = await bcrypt.compare(currentPassword, userWithPw.password);
        if (!isMatch) {
          return res.status(401).json({
            message: "Current password is incorrect. Please enter your accurate old password.",
          });
        }
      }
      // If user has no password configured yet (Google Sign-In), allow them to set their password with OTP
    }

    if (action === "change_email") {
      if (!targetEmail || !targetEmail.includes("@")) {
        return res.status(400).json({ message: "Valid new email address is required." });
      }
      const cleanTarget = targetEmail.toLowerCase().trim();
      if (cleanTarget === user.email.toLowerCase().trim()) {
        return res.status(400).json({ message: "New email must be different from your current email." });
      }
      const existing = await User.findOne({ email: cleanTarget, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ message: "That email address is already in use by another account." });
      }
      recipientEmail = cleanTarget;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await PasswordResetOtp.findOneAndUpdate(
      { email: recipientEmail },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    const sendResult = await sendOtpEmail(recipientEmail, otp);

    const atIndex = recipientEmail.indexOf("@");
    const maskedEmail =
      atIndex > 2
        ? `${recipientEmail.slice(0, 2)}***${recipientEmail.slice(atIndex)}`
        : recipientEmail;

    return res.status(200).json({
      message: `A 6-digit confirmation code has been sent to ${maskedEmail}. Please check your inbox.`,
      targetEmail: recipientEmail,
      maskedEmail,
      emailSent: sendResult?.sent ?? false,
    });
  } catch (error) {
    console.error("sendSecurityOtp error:", error);
    return res.status(500).json({ message: "Server error while sending verification code." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, otp } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required.",
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    if (currentPassword && currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as your current password.",
      });
    }

    const cleanOtp = (otp || "").toString().trim();
    if (!cleanOtp) {
      return res.status(400).json({
        message: "A 6-digit verification code sent to your email is required to change password.",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required.",
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Current password is incorrect. Please enter your accurate old password.",
        });
      }
    }

    // Admin and Staff can change their password anytime!
    const isAdminOrStaff = user.role === "admin" || user.role === "staff";
    if (!isAdminOrStaff && user.passwordLastChanged) {
      const lastChange = new Date(user.passwordLastChanged).getTime();
      const diffMs = Date.now() - lastChange;
      const cooldownMs = 3 * 24 * 60 * 60 * 1000;
      if (diffMs < cooldownMs) {
        const remainingHours = Math.ceil((cooldownMs - diffMs) / (1000 * 60 * 60));
        const remainingDays = Math.ceil((cooldownMs - diffMs) / (1000 * 60 * 60 * 24));
        return res.status(400).json({
          message: `Password can only be changed once every 3 days. Please wait ${remainingDays > 1 ? `${remainingDays} days` : `${remainingHours} hours`} before updating your password again.`,
        });
      }
    }

    // Verify OTP code
    const otpRecord = await PasswordResetOtp.findOne({
      email: user.email.toLowerCase().trim(),
      otp: cleanOtp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    await PasswordResetOtp.deleteOne({ _id: otpRecord._id });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordLastChanged = new Date().toISOString();
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    sendSecurityConfirmationEmail({
      toEmail: user.email,
      userName: user.name,
      actionType: "Password Changed",
      details: `Your account password was successfully updated on ${new Date().toLocaleString()}. You can continue using QueueLess system safely.`,
    }).catch((err) => console.error("Password change security email error:", err));

    recordAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      actorId: user.studentId || String(user._id),
      actorPicture: user.picture || "",
      targetCategory: user.role === "staff" ? "staff" : user.role === "guest" ? "guest" : (user.isPriority || user.userType === "priority") ? "priority" : "student",
      action: "Account Password Updated",
      details: `${user.name} successfully updated account password with OTP verification.`,
      status: "Success",
    });

    return res.status(200).json({
      message: "Password changed successfully.",
      user: formatUserObject(user),
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({ message: "Server error while changing password." });
  }
};

export const sendContactOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    const emailToSend = (req.body.email || user.email || "").toLowerCase().trim();
    if (!emailToSend || !emailToSend.includes("@")) {
      return res.status(400).json({ message: "Valid email address is required." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await PasswordResetOtp.findOneAndUpdate(
      { email: emailToSend },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    const emailResult = await sendOtpEmail(emailToSend, otp);

    return res.status(200).json({
      message: `Verification code sent to ${emailToSend}.`,
      email: emailToSend,
      sent: emailResult?.sent ?? false,
    });
  } catch (error) {
    console.error("sendContactOtp error:", error);
    return res.status(500).json({ message: "Failed to send verification code." });
  }
};

export const verifyContactOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, code, otp } = req.body;
    const submittedOtp = (code || otp || "").toString().trim();

    if (!submittedOtp) {
      return res.status(400).json({ message: "Verification code is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    const cleanEmail = (email || user.email || "").toLowerCase().trim();

    const record = await PasswordResetOtp.findOne({
      email: cleanEmail,
      otp: submittedOtp,
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid verification code. Please check your inbox and try again." });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
    }

    await PasswordResetOtp.deleteOne({ _id: record._id });

    user.contactVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully.",
      user: formatUserObject(user),
    });
  } catch (error) {
    console.error("verifyContactOtp error:", error);
    return res.status(500).json({ message: "Failed to verify code." });
  }
};


export const adminEditUser = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can edit user profiles." });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }
    const allowedFields = [
      "name", "email", "phone", "course", "yearLevel",
      "nameLastChanged", "passwordLastChanged",
      "lastName", "firstName", "middleName", "extensionName",
      "birthDate", "gender", "civilStatus", "nationality", "religion",
      "elemSchool", "elemYearGrad", "elemType",
      "juniorHighSchool", "juniorHighYearGrad", "juniorHighType",
      "seniorHighSchool", "seniorHighYearGrad", "seniorHighType",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        targetUser[field] = req.body[field];
      }
    });
    await targetUser.save();
    return res.json({ message: "User updated successfully.", user: formatUserObject(targetUser) });
  } catch (error) {
    console.error("adminEditUser error:", error);
    return res.status(500).json({ message: "Server error while editing user." });
  }
};

// ─── "That Wasn't Me" — Verify Security Action Token ───
export const verifySecurityActionToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, message: "Security token is required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        valid: false,
        message: err.name === "TokenExpiredError"
          ? "This security link has expired. Please contact the Registrar's Office or log in to secure your account."
          : "Invalid or corrupted security link.",
      });
    }

    if (decoded.purpose !== "security-action") {
      return res.status(400).json({ valid: false, message: "Invalid security token purpose." });
    }

    const user = await User.findById(decoded.userId).select("name email role studentId picture");
    if (!user) {
      return res.status(404).json({ valid: false, message: "User account not found." });
    }

    return res.status(200).json({
      valid: true,
      email: user.email,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
    });
  } catch (error) {
    console.error("verifySecurityActionToken error:", error);
    return res.status(500).json({ valid: false, message: "Server error while validating security token." });
  }
};

// ─── "That Wasn't Me" — Report Unauthorized Access & Terminate Sessions / Change Password ───
export const reportUnauthorizedAccess = async (req, res) => {
  try {
    const { token, action, newPassword } = req.body;
    let userId = null;

    if (token) {
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(400).json({
          message: err.name === "TokenExpiredError"
            ? "This security link has expired. Please use the Forgot Password link or contact the Registrar."
            : "Invalid security token.",
        });
      }
      if (decoded.purpose !== "security-action") {
        return res.status(400).json({ message: "Invalid security token purpose." });
      }
      userId = decoded.userId;
    } else if (req.user?.id) {
      userId = req.user.id;
    }

    if (!userId) {
      return res.status(400).json({ message: "Security verification token or active session is required." });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    // Force-terminate ALL active sessions immediately by incrementing tokenVersion
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    let passwordChanged = false;
    if (action === "change-password" || newPassword) {
      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 12) {
        return res.status(400).json({
          message: "Password must be at least 12 characters long in accordance with institutional security policy.",
        });
      }

      // Check policy: uppercase, lowercase, number, symbol
      const hasUpper = /[A-Z]/.test(newPassword);
      const hasLower = /[a-z]/.test(newPassword);
      const hasDigit = /[0-9]/.test(newPassword);
      const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

      if (!hasUpper || !hasLower || !hasDigit || !hasSymbol) {
        return res.status(400).json({
          message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.passwordLastChanged = new Date().toISOString();
      passwordChanged = true;
    }

    await user.save();

    // Audit log
    recordAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      actorId: user.studentId || String(user._id),
      actorPicture: user.picture || "",
      targetCategory: "security",
      action: passwordChanged
        ? "Unauthorized Activity: Terminated Sessions & Password Reset"
        : "Unauthorized Activity: Terminated All Active Sessions",
      details: `${user.name} reported unauthorized access ("That wasn't me"). All active tokens revoked${passwordChanged ? " and account password changed" : ""}.`,
      status: "Critical",
    });

    // Confirmation email
    sendSecurityConfirmationEmail({
      toEmail: user.email,
      userName: user.name,
      actionType: passwordChanged ? "Account Secured — Sessions Revoked & Password Changed" : "Account Secured — All Sessions Revoked",
      details: `Your QueueLess account was secured on ${new Date().toLocaleString()}. All existing sign-in sessions were forcefully terminated${passwordChanged ? " and your password was successfully updated" : ""}. No unauthorized user can access your account.`,
    }).catch((err) => console.error("Security follow-up email error:", err));

    return res.status(200).json({
      success: true,
      message: passwordChanged
        ? "Account secured! All active sessions have been terminated and your password has been successfully updated."
        : "Account secured! All active sessions across all devices have been logged out immediately.",
      email: user.email,
      passwordChanged,
      action: passwordChanged ? "password-changed" : "sessions-revoked",
    });
  } catch (error) {
    console.error("Report unauthorized access error:", error);
    return res.status(500).json({ message: "Server error while securing account." });
  }
};
