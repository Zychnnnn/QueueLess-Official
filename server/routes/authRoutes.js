import express from "express";
import {
  createStaff,
  register,
  registerGuest,
  login,
  googleLogin,
  getUsers,
  deleteUser,
  approveUser,
  rejectUser,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-guest", registerGuest);
router.post("/login", login);
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
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
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

// Profile routes (any authenticated user)
router.patch("/profile", authMiddleware, updateProfile);
router.post("/change-password", authMiddleware, changePassword);

export default router;