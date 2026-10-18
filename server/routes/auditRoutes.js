import express from "express";
import { getAuditLogs, createAuditLog, deleteAuditLog, deleteActorLogs, clearAllAuditLogs } from "../controllers/auditController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("admin"), getAuditLogs);
router.post("/", authMiddleware, createAuditLog);
router.delete("/all/clear", authMiddleware, roleMiddleware("admin"), clearAllAuditLogs);
router.delete("/actor/:identifier", authMiddleware, roleMiddleware("admin"), deleteActorLogs);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteAuditLog);

export default router;
