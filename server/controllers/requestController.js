import Request from "../models/Request.js";
import User from "../models/User.js";

export const createRequest = async (req, res) => {
  try {
    const {
      requestNumber,
      document,
      purpose,
      remarks,
      date,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!requestNumber || !document || !purpose || !date) {
      return res.status(400).json({ message: "Required request fields are missing." });
    }

    const existingRequest = await Request.findOne({ requestNumber });
    if (existingRequest) {
      return res.status(409).json({ message: "Request number already exists." });
    }

    let lineNumber = req.body.lineNumber;
    if (!lineNumber) {
      const highestLineRequest = await Request.findOne().sort({ lineNumber: -1 });
      lineNumber =
        highestLineRequest && highestLineRequest.lineNumber
          ? highestLineRequest.lineNumber + 1
          : (await Request.countDocuments()) + 1;
    }

    const defaultPriority =
      user.isPriority || user.userType === "priority" ? "Priority" : "Regular";

    const request = await Request.create({
      requestNumber,
      lineNumber,
      priority: req.body.priority || defaultPriority,
      copies: Number(req.body.copies) || 1,
      pickupDate: req.body.pickupDate || "",
      student: user.name,
      studentId: user.studentId,
      phone: req.body.phone || user.phone || "",
      document,
      purpose,
      remarks: remarks || "",
      date,
      status: "Pending",
      paymentStatus: req.body.paymentStatus || "Proceed to Registrar Staff",
    });

    return res.status(201).json({
      message: "Request created successfully.",
      request,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ message: "Server error while creating request." });
  }
};

export const getRequests = async (req, res) => {
  try {
    let requests;

    if (req.user.role === "student" || req.user.role === "guest") {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      requests = await Request.find({
        studentId: user.studentId,
      }).sort({ lineNumber: 1, createdAt: 1 });
    } else {
      requests = await Request.find().sort({
        lineNumber: 1,
        createdAt: 1,
      });
    }

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    return res.status(500).json({ message: "Server error while getting requests." });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Ready for Claiming",
      "Claimed",
      "Needs Correction",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid request status." });
    }

    if (req.user.role !== "staff" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only staff and admin can update request status.",
      });
    }

    const request = await Request.findOneAndUpdate(
      { requestNumber },
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    return res.status(200).json({
      message: "Request status updated successfully.",
      request,
    });
  } catch (error) {
    console.error("Update request status error:", error);
    return res.status(500).json({ message: "Server error while updating request status." });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const {
      status,
      remarks,
      phone,
      lineNumber,
      priority,
      pickupDate,
      document,
      purpose,
      copies,
      paymentStatus,
    } = req.body;

    if (req.user.role !== "staff" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only staff and admin can edit request receipt details.",
      });
    }

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (remarks !== undefined) updateFields.remarks = remarks;
    if (phone !== undefined) updateFields.phone = phone;
    if (lineNumber !== undefined && lineNumber !== null) {
      updateFields.lineNumber = Number(lineNumber);
    }
    if (priority !== undefined) updateFields.priority = priority;
    if (pickupDate !== undefined) updateFields.pickupDate = pickupDate;
    if (document !== undefined) updateFields.document = document;
    if (purpose !== undefined) updateFields.purpose = purpose;
    if (copies !== undefined && copies !== null) {
      updateFields.copies = Number(copies);
    }
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;

    const request = await Request.findOneAndUpdate(
      { requestNumber },
      updateFields,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    return res.status(200).json({
      message: "Request receipt updated successfully.",
      request,
    });
  } catch (error) {
    console.error("Update request error:", error);
    return res.status(500).json({ message: "Server error while updating request receipt." });
  }
};