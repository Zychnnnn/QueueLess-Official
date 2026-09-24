import express from "express";
import {
  createStaff,
  register,
  login,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post(
  "/staff",
  authMiddleware,
  roleMiddleware("admin"),
  createStaff
);

export default router;