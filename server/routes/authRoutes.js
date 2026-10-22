import express from "express";
import {
  createStaff,
  createStudentByAdmin,
  createAdminByAdmin,
  register,
  registerGuest,
  login,
  googleLogin,
  getUsers,
  deleteUser,
  approveUser,
  rejectUser,
  updateUserByAdmin,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  updateProfile,
  changePassword,
  sendSecurityOtp,
  sendContactOtp,
  verifyContactOtp,
  verifyLoginOtp,
  resendLoginOtp,
  reportUnauthorizedAccess,
  verifySecurityActionToken,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-guest", registerGuest);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/resend-login-otp", resendLoginOtp);
router.post("/google", googleLogin);
router.post("/forgot-password", requestPasswordResetOtp);
router.post("/verify-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.post(
  "/staff",
  authMiddleware,
  roleMiddleware("admin"),
  createStaff
);
router.post(
  "/student",
  authMiddleware,
  roleMiddleware("admin"),
  createStudentByAdmin
);
router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  createAdminByAdmin
);
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin", "staff"),
  getUsers
);
router.patch(
  "/users/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveUser
);
router.patch(
  "/users/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectUser
);
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);
router.patch(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserByAdmin
);

// Security: "That wasn't me" — report unauthorized access (public, token-verified)
router.post("/verify-security-token", verifySecurityActionToken);
router.post("/report-unauthorized", reportUnauthorizedAccess);

// Profile & verification routes (any authenticated user)
router.patch("/profile", authMiddleware, updateProfile);
router.post("/change-password", authMiddleware, changePassword);
router.post("/send-security-otp", authMiddleware, sendSecurityOtp);
router.post("/send-otp", authMiddleware, sendContactOtp);
router.post("/verify-contact-otp", authMiddleware, verifyContactOtp);

export default router;