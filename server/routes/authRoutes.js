import express from "express";
import {
  createStaff,
  register,
  login,
  getUsers,
  deleteUser,
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
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getUsers
);
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

export default router;