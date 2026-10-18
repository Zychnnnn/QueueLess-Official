import express from "express";

import {
  createRequest,
  getRequests,
  getRequestByNumber,
  updateRequestStatus,
  updateRequest,
  rateRequest,
  deleteRequest,
} from "../controllers/requestController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create request
router.post(
  "/",
  authMiddleware,
  roleMiddleware("student", "staff", "admin", "guest"),
  createRequest
);

// View all authorized requests (students receive only their own)
router.get(
  "/",
  authMiddleware,
  getRequests
);

// View single request by requestNumber (enforces student ownership)
router.get(
  "/:requestNumber",
  authMiddleware,
  getRequestByNumber
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

// Delete request (staff and admin)
router.delete(
  "/:requestNumber",
  authMiddleware,
  roleMiddleware("staff", "admin"),
  deleteRequest
);

// Student rate and send thanks to staff
router.post(
  "/:requestNumber/rate",
  authMiddleware,
  rateRequest
);

export default router;