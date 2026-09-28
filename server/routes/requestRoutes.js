import express from "express";

import {
  createRequest,
  getRequests,
  updateRequestStatus,
  updateRequest,
} from "../controllers/requestController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create request
router.post(
  "/",
  authMiddleware,
  roleMiddleware("student", "staff", "admin"),
  createRequest
);

// View requests
router.get(
  "/",
  authMiddleware,
  getRequests
);

// Update request status (quick update)
router.patch(
  "/:requestNumber/status",
  authMiddleware,
  roleMiddleware("staff", "admin"),
  updateRequestStatus
);

// Update complete request receipt details (staff and admin)
router.patch(
  "/:requestNumber",
  authMiddleware,
  roleMiddleware("staff", "admin"),
  updateRequest
);

export default router;