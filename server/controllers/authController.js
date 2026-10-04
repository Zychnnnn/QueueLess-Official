import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PasswordResetOtp from "../models/PasswordResetOtp.js";
import {
  sendOtpEmail,
  sendAdminRegistrationNotification,
  sendAccountStatusNotification,
} from "../services/emailService.js";

export const isSchoolCredential = (email = "", studentId = "") => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanId = studentId ? studentId.trim() : "";

  // Priority if email contains .edu.ph (e.g. reirei.edu.ph@gmail.com, student@up.phinma.edu.ph) or phinmaed.com
  const isSchoolEmail =
    cleanEmail.includes(".edu.ph") ||
    cleanEmail.endsWith("@phinmaed.com") ||
    cleanEmail.includes("phinma");

  const isOfficialStudentId = cleanId ? /^\d{2}-\d{4}-\d{5,6}$/.test(cleanId) : false;

  return Boolean(isSchoolEmail || isOfficialStudentId);
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

    // Student Account: Student ID is strictly required in format 00-0000-000000
    if (!cleanStudentId) {
      return res.status(400).json({
        message: "Student ID is required for student registration (e.g. 00-0000-000000).",
      });
    }

    const studentIdPattern = /^\d{2}-\d{4}-\d{5,6}$/;
    if (!studentIdPattern.test(cleanStudentId)) {
      return res.status(400).json({
        message:
          "Invalid Student ID format. Please use the format 00-0000-000000 (e.g. 02-2324-001234).",
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

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save with pending approval status
    const user = await User.create({
      name: cleanName,
      studentId: finalStudentId,
      email: cleanEmail,
      password: hashedPassword,
      role: "student",
      isPriority,
      userType,
      approvalStatus: "pending",
    });

    console.log(
      `[QueueLess Registration] New pending user: ${user.name} (${user.email}, ID: ${user.studentId}, Type: ${user.userType})`
    );

    // Notify admin asynchronously
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

export const login = async (req, res) => {
  try {
    const { email, studentId, identifier: rawIdentifier, password, loginType } = req.body;

    const inputIdentifier = (email || studentId || rawIdentifier || "").trim();

    // Check required fields
    if (!inputIdentifier || !password) {
      return res.status(400).json({
        message: "Student ID or Email, and password are required.",
      });
    }

    const allowedLoginTypes = [
      "student",
      "staff",
      "admin",
    ];

    if (
      loginType &&
      !allowedLoginTypes.includes(loginType)
    ) {
      return res.status(400).json({
        message: "Choose a valid login type.",
      });
    }

    const cleanLower = inputIdentifier.toLowerCase();

    // Find user by either email or studentId (matches format e.g. 00-0000-000000)
    const user = await User.findOne({
      $or: [
        { email: cleanLower },
        { studentId: inputIdentifier },
        { studentId: inputIdentifier.toUpperCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Student ID / email or password.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was created with Google Sign-In. Please click 'Sign in with Google' or use 'Forgot password?' to set a password.",
      });
    }

    // Role verification: Admin and staff portals require respective roles
    if (loginType && user.role !== loginType) {
      return res.status(403).json({
        message: "Cannot sign in.",
      });
    }

    // Student login portal: Admin and Staff accounts cannot sign in through the student page
    if (!loginType || loginType === "student") {
      if (user.role !== "student") {
        return res.status(403).json({
          message: "Cannot sign in.",
        });
      }
    }

    // Check review/approval status for student/normal user accounts
    if (user.approvalStatus === "pending") {
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

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Student ID / email or password.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Determine priority if not already saved
    let isPriority = user.isPriority;
    let userType = user.userType;
    if (isPriority === undefined || !userType) {
      isPriority = isSchoolCredential(user.email, user.studentId);
      userType = isPriority ? "priority" : "normal";
      user.isPriority = isPriority;
      user.userType = userType;
      await user.save();
    }

    // Return login response
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
        picture: user.picture,
        isPriority,
        userType,
      },
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
        : "Server error during login. Please try again.",
    });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, staffId: customStaffId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const staffId = customStaffId ? customStaffId.trim() : `STAFF-${Date.now().toString().slice(-5)}`;

    const user = await User.create({
      name: cleanName,
      studentId: staffId,
      email: cleanEmail,
      password: hashedPassword,
      role: "staff",
    });

    return res.status(201).json({
      message: "Staff account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Staff creation error:", error);

    return res.status(500).json({
      message: "Server error while creating staff account.",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users fetched successfully.",
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        studentId: u.studentId,
        email: u.email,
        role: u.role,
        isPriority: u.isPriority,
        userType: u.userType,
        approvalStatus: u.approvalStatus || "approved",
        createdAt: u.createdAt,
      })),
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

    console.log(`[QueueLess Admin] Admitted user: ${user.name} (${user.email})`);

    // Notify user of approval
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

    console.log(`[QueueLess Admin] Rejected user: ${user.name} (${user.email})`);

    // Notify user of rejection
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

    // Check if official school account (phinmaed.com / student ID)
    const isPriority = isSchoolCredential(cleanEmail, "");
    const userType = isPriority ? "priority" : "normal";

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    // Role verification for login portals
    if (user && loginType && user.role !== loginType) {
      return res.status(403).json({
        message: "Cannot sign in.",
      });
    }

    if (!user) {
      // Extract student ID format if present in email prefix, else generate formatted ID
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
      });

      console.log(`[MongoDB] New user registered via Google: ${user.email} (Priority: ${user.isPriority})`);
    } else {
      let needsSave = false;
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
      if (needsSave) {
        await user.save();
      }

      console.log(`[MongoDB] Existing user logged in via Google: ${user.email} (Priority: ${user.isPriority})`);
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Google sign-in successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
        picture: user.picture,
        isPriority: user.isPriority,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    return res.status(500).json({
      message: "Server error during Google sign-in.",
    });
  }
};

export const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify user exists (works for both .edu.ph and personal @gmail.com)
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address.",
      });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save or update OTP in DB
    await PasswordResetOtp.findOneAndUpdate(
      { email: cleanEmail },
      {
        otp,
        expiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    console.log(`[QueueLess Auth] Password Reset OTP for ${cleanEmail}: ${otp}`);

    // Send OTP directly to user's email inbox
    await sendOtpEmail(cleanEmail, otp);

    return res.status(200).json({
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox.`,
      email: cleanEmail,
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and verification code are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = await PasswordResetOtp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
    });

    if (!record) {
      return res.status(400).json({
        message: "Invalid verification code. Please check and try again.",
      });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Mark as verified
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
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, code, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const record = await PasswordResetOtp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      verified: true,
    });

    if (!record) {
      return res.status(400).json({
        message: "Invalid or unverified session. Please verify your OTP code first.",
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
        message: "Account not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clean up OTP record
    await PasswordResetOtp.deleteOne({ _id: record._id });

    console.log(`[QueueLess Auth] Password successfully reset for: ${cleanEmail}`);

    return res.status(200).json({
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      message: "Server error while resetting password.",
    });
  }
};



