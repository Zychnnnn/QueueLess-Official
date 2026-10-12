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

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const guestId = "GUEST-" + Math.floor(10000 + Math.random() * 90000);
    const hashedPassword = await bcrypt.hash(password, 10);

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
      lastLogin: new Date(),
    });

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

    const allowedLoginTypes = ["student", "staff", "admin"];
    if (loginType && !allowedLoginTypes.includes(loginType)) {
      return res.status(400).json({
        message: "Choose a valid login type.",
      });
    }

    const cleanLower = inputIdentifier.toLowerCase();
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

    if (loginType && user.role !== loginType) {
      return res.status(403).json({
        message: "Cannot sign in.",
      });
    }

    if (!loginType || loginType === "student") {
      if (user.role !== "student") {
        return res.status(403).json({
          message: "Cannot sign in.",
        });
      }
    }

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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Student ID / email or password.",
      });
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

    let isPriority = user.isPriority;
    let userType = user.userType;
    if (isPriority === undefined || !userType) {
      isPriority = isSchoolCredential(user.email, user.studentId);
      userType = isPriority ? "priority" : "normal";
      user.isPriority = isPriority;
      user.userType = userType;
    }

    user.lastLogin = new Date();
    await user.save();

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
        phone: user.phone || "",
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : "",
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
        : "Server error during login.",
    });
  }
};

export const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(409).json({
        message: "A staff or user account with this email already exists.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Staff password must contain at least 8 characters.",
      });
    }

    const staffCount = await User.countDocuments({ role: "staff" });
    const staffId = `STAFF-${String(staffCount + 1).padStart(3, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      studentId: staffId,
      password: hashedPassword,
      role: "staff",
      approvalStatus: "approved",
    });

    return res.status(201).json({
      message: "Staff account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create staff error:", error);
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
        phone: u.phone || "",
        lastLogin: u.lastLogin ? u.lastLogin.toISOString() : "",
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
    const isPriority = isSchoolCredential(cleanEmail, "");
    const userType = isPriority ? "priority" : "normal";

    let user = await User.findOne({ email: cleanEmail });

    if (user && loginType && user.role !== loginType) {
      return res.status(403).json({
        message: "Cannot sign in.",
      });
    }

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
        lastLogin: new Date(),
      });
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
      user.lastLogin = new Date();
      needsSave = true;
      if (needsSave) {
        await user.save();
      }
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
        phone: user.phone || "",
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : new Date().toISOString(),
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
      if (role === "admin") {
        return res.status(404).json({
          message: `No administrator account found for "${input}". Please verify your Admin ID or email.`,
        });
      }
      if (role === "staff") {
        return res.status(404).json({
          message: `No registrar staff account found for "${input}". Please verify your Staff ID or email.`,
        });
      }
      return res.status(404).json({
        message: `No account found for "${input}". Please check your registered email or ID.`,
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
      message: `A 6-digit verification code has been sent to your registered email (${maskedEmail}). Please check your inbox.`,
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
        message: "Account not found in the database.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
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

    if (name !== undefined && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (picture !== undefined) user.picture = picture.trim();

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
        picture: user.picture || "",
        phone: user.phone || "",
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : "",
        isPriority: user.isPriority,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server error while updating profile." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Your account uses Google Sign-In and does not have a password. Set one from the forgot password page.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({ message: "Server error while changing password." });
  }
};
