import AuditLog from "../models/AuditLog.js";
import Request from "../models/Request.js";
import User from "../models/User.js";

// Sets to persistently track deleted log IDs and actor keys across sessions
const deletedLogIds = new Set();
const deletedActorKeys = new Set();

/**
 * Helper to record an audit log entry from any controller
 */
export const recordAuditLog = async ({
  actorName,
  actorEmail,
  actorRole,
  actorId,
  actorPicture,
  targetCategory,
  action,
  details,
  requestNumber,
  status = "Success",
  metadata = {},
}) => {
  try {
    let picture = actorPicture || "";
    if (!picture && actorEmail) {
      const u = await User.findOne({ email: actorEmail.toLowerCase() }, "picture").lean();
      if (u?.picture) picture = u.picture;
    }
    await AuditLog.create({
      actorName: actorName || "System",
      actorEmail: actorEmail || "",
      actorRole: actorRole || "system",
      actorId: actorId || "",
      actorPicture: picture,
      targetCategory: targetCategory || (actorRole === "staff" ? "staff" : "student"),
      action,
      details: details || "",
      requestNumber: requestNumber || "",
      status,
      metadata,
    });
  } catch (err) {
    console.error("Error recording audit log:", err);
  }
};

/**
 * GET /api/audit-logs
 * Retrieves audit logs, combining stored audit entries with historical records from Users and Requests
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { category, search, limit = 200 } = req.query;

    let query = {};
    if (category && category !== "all") {
      if (category === "priority") {
        query.targetCategory = "priority";
      } else if (category === "staff") {
        query.targetCategory = "staff";
      } else if (category === "guest") {
        query.targetCategory = "guest";
      } else if (category === "student") {
        query.targetCategory = { $in: ["student", "priority"] };
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { actorName: searchRegex },
        { actorEmail: searchRegex },
        { action: searchRegex },
        { details: searchRegex },
        { requestNumber: searchRegex },
        { actorId: searchRegex },
      ];
    }

    // Build user picture map to enrich all logs
    const allUsers = await User.find({}, "name email studentId picture").lean();
    const picByEmail = {};
    const picById = {};
    const picByName = {};
    for (const u of allUsers) {
      if (u.picture) {
        if (u.email) picByEmail[u.email.toLowerCase()] = u.picture;
        if (u.studentId) picById[u.studentId] = u.picture;
        if (u.name) picByName[u.name.toLowerCase()] = u.picture;
      }
    }

    // Fetch existing recorded audit logs
    const directLogs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    // Attach picture to direct logs if missing
    for (const log of directLogs) {
      if (!log.actorPicture) {
        log.actorPicture =
          (log.actorEmail && picByEmail[log.actorEmail.toLowerCase()]) ||
          (log.actorId && picById[log.actorId]) ||
          (log.actorName && picByName[log.actorName.toLowerCase()]) ||
          "";
      }
    }

    // Only return genuine recorded audit logs from database
    let combinedLogs = [...directLogs];

    // Filter out any deleted logs
    combinedLogs = combinedLogs.filter(
      (l) =>
        !deletedLogIds.has(String(l._id)) &&
        !deletedActorKeys.has((l.actorEmail || "").toLowerCase()) &&
        !deletedActorKeys.has((l.actorId || "").toLowerCase()) &&
        !deletedActorKeys.has((l.actorName || "").toLowerCase())
    );

    // Sort by date descending
    combinedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply category filter to combined logs if requested
    if (category && category !== "all") {
      if (category === "priority") {
        combinedLogs = combinedLogs.filter((l) => l.targetCategory === "priority");
      } else if (category === "staff") {
        combinedLogs = combinedLogs.filter((l) => l.targetCategory === "staff" || l.actorRole === "staff");
      } else if (category === "guest") {
        combinedLogs = combinedLogs.filter((l) => l.targetCategory === "guest" || l.actorRole === "guest");
      } else if (category === "student") {
        combinedLogs = combinedLogs.filter((l) => l.targetCategory === "student" || l.targetCategory === "priority");
      }
    }

    // Apply search filter to combined logs if requested
    if (search) {
      const q = search.trim().toLowerCase();
      combinedLogs = combinedLogs.filter(
        (l) =>
          l.actorName?.toLowerCase().includes(q) ||
          l.actorEmail?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.details?.toLowerCase().includes(q) ||
          l.requestNumber?.toLowerCase().includes(q) ||
          l.actorId?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: combinedLogs.length,
      logs: combinedLogs.slice(0, Number(limit)),
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({
      message: "Server error while fetching audit logs.",
    });
  }
};

/**
 * POST /api/audit-logs
 * Logs a new action directly
 */
export const createAuditLog = async (req, res) => {
  try {
    const { action, details, targetCategory, requestNumber, status } = req.body;

    if (!action) {
      return res.status(400).json({ message: "Action title is required." });
    }

    const log = await AuditLog.create({
      actorName: req.user?.name || req.body.actorName || "Staff Member",
      actorEmail: req.user?.email || req.body.actorEmail || "",
      actorRole: req.user?.role || req.body.actorRole || "staff",
      actorId: req.user?.studentId || req.body.actorId || "",
      actorPicture: req.user?.picture || req.body.actorPicture || "",
      targetCategory: targetCategory || (req.user?.role === "staff" ? "staff" : "student"),
      action,
      details: details || "",
      requestNumber: requestNumber || "",
      status: status || "Success",
    });

    return res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Create audit log error:", error);
    return res.status(500).json({ message: "Server error creating audit log." });
  }
};

/**
 * DELETE /api/audit-logs/:id
 * Deletes a specific audit log by ID
 */
export const deleteAuditLog = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      deletedLogIds.add(String(id));
      if (req.query.actorEmail) deletedActorKeys.add(req.query.actorEmail.toLowerCase());
      if (req.query.actorId) deletedActorKeys.add(req.query.actorId.toLowerCase());
    }
    if (id && !id.startsWith("synth-")) {
      await AuditLog.findByIdAndDelete(id);
    }
    return res.status(200).json({ success: true, message: "Audit log deleted successfully." });
  } catch (error) {
    console.error("Delete audit log error:", error);
    return res.status(500).json({ message: "Server error deleting audit log." });
  }
};

/**
 * DELETE /api/audit-logs/actor/:identifier
 * Deletes all audit activities for a specific actor
 */
export const deleteActorLogs = async (req, res) => {
  try {
    const { identifier } = req.params;
    if (identifier) {
      const lower = identifier.toLowerCase();
      deletedActorKeys.add(lower);
      await AuditLog.deleteMany({
        $or: [
          { actorEmail: new RegExp(`^${identifier}$`, "i") },
          { actorId: new RegExp(`^${identifier}$`, "i") },
          { actorName: new RegExp(`^${identifier}$`, "i") },
        ],
      });
    }
    return res.status(200).json({ success: true, message: "All activities for user removed." });
  } catch (error) {
    console.error("Delete actor audit logs error:", error);
    return res.status(500).json({ message: "Server error deleting user activity logs." });
  }
};

/**
 * DELETE /api/audit-logs/all/clear
 * Clears all audit logs for a clean accurate start
 */
export const clearAllAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    deletedLogIds.clear();
    deletedActorKeys.clear();
    return res.status(200).json({ success: true, message: "All audit logs cleared successfully." });
  } catch (error) {
    console.error("Clear all audit logs error:", error);
    return res.status(500).json({ message: "Server error clearing audit logs." });
  }
};

