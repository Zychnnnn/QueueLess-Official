import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, studentId, email, password } = req.body;

    // Check required fields
    if (!name || !studentId || !email || !password) {
      return res.status(400).json({
        message: "Name, Student ID, email, and password are required.",
      });
    }

    // Clean input values
    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanEmail = email.toLowerCase().trim();

    // Check Student ID format
    if (!/^\d{4}-\d{5}$/.test(cleanStudentId)) {
      return res.status(400).json({
        message: "Use the Student ID format 2022-10045.",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    // Check if email or Student ID already exists
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { studentId: cleanStudentId },
      ],
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(409).json({
          message: "Email is already registered.",
        });
      }

      if (existingUser.studentId === cleanStudentId) {
        return res.status(409).json({
          message: "Student ID is already registered.",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: cleanName,
      studentId: cleanStudentId,
      email: cleanEmail,
      password: hashedPassword,
      role: "student",
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        studentId: user.studentId,
        email: user.email,
        role: user.role,
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
    const { email, password, loginType } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
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

    // Clean email
    const cleanEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (loginType && user.role !== loginType) {
      return res.status(403).json({
        message: `This account is not registered as a ${loginType} account. Use the correct login option.`,
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
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

