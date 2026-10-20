import mongoose from "mongoose";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { sendRequestUpdateNotification } from "../services/emailService.js";
import { recordAuditLog } from "./auditController.js";

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

    // Limit to 2 document requests per rolling 24 hours per user
    if (user.role === "student" || user.role === "guest") {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentRequests = await Request.find({
        $or: [
          ...(user.studentId ? [{ studentId: user.studentId }] : []),
          ...(user.email ? [{ email: user.email }] : []),
        ],
        createdAt: { $gte: twentyFourHoursAgo },
      }).sort({ createdAt: 1 });

      if (recentRequests.length >= 2) {
        const oldestReq = recentRequests[0];
        const oldestTime = oldestReq.createdAt ? new Date(oldestReq.createdAt).getTime() : Date.now();
        const resetAt = new Date(oldestTime + 24 * 60 * 60 * 1000);
        const diffMs = Math.max(0, resetAt.getTime() - Date.now());
        const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
        const minsLeft = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const timeMsg = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft} minutes`;

        return res.status(400).json({
          message: `Daily request limit reached (2/2). Quota resets in ${timeMsg} (24-hour cycle). Please wait before submitting new document requests. Thank you for using and trusting QueueLess Registrar!`,
        });
      }
    }

    let lineNumber = req.body.lineNumber;
    if (!lineNumber) {
      const activeCount = await Request.countDocuments({ status: { $ne: "Claimed" } });
      lineNumber = activeCount + 1;
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
      email: user.email || "",
      phone: req.body.phone || user.phone || "",
      document,
      purpose,
      remarks: remarks || "",
      date,
      status: "Pending",
      paymentStatus: req.body.paymentStatus || "Proceed to Registrar Staff",
      picture: user.picture || "",
      course: user.course || "",
      yearLevel: user.yearLevel || "",
      userDetails: {
        picture: user.picture || "",
        course: user.course || "",
        yearLevel: user.yearLevel || "",
        gender: user.gender || "",
        birthDate: user.birthDate || "",
        civilStatus: user.civilStatus || "",
        nationality: user.nationality || "",
        religion: user.religion || "",
        lastName: user.lastName || "",
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        extensionName: user.extensionName || "",
        fatherName: user.fatherName || "",
        fatherOccupation: user.fatherOccupation || "",
        fatherMobile: user.fatherMobile || "",
        motherName: user.motherName || "",
        motherOccupation: user.motherOccupation || "",
        motherMobile: user.motherMobile || "",
        spouseName: user.spouseName || "",
        spouseOccupation: user.spouseOccupation || "",
        numberOfChildren: user.numberOfChildren || "0",
        numberOfBrothers: user.numberOfBrothers || "0",
        numberOfSisters: user.numberOfSisters || "0",
        guardianName: user.guardianName || "",
        guardianRelationship: user.guardianRelationship || "",
        guardianMobile: user.guardianMobile || "",
        currentAddress: user.currentAddress || user.address || "",
        permanentAddress: user.permanentAddress || user.address || "",
        address: user.address || user.currentAddress || "",
        emergencyContact: user.emergencyContact || "",
        elemSchool: user.elemSchool || "",
        elemYearGrad: user.elemYearGrad || "",
        elemType: user.elemType || "",
        juniorHighSchool: user.juniorHighSchool || "",
        juniorHighYearGrad: user.juniorHighYearGrad || "",
        juniorHighType: user.juniorHighType || "",
        seniorHighSchool: user.seniorHighSchool || "",
        seniorHighYearGrad: user.seniorHighYearGrad || "",
        seniorHighType: user.seniorHighType || "",
      },
    });

    const isGuest =
      user.role === "guest" ||
      (user.email && user.email.toLowerCase().endsWith("@gmail.com")) ||
      (user.studentId && String(user.studentId).startsWith("GUEST"));

    recordAuditLog({
      actorName: user.name,
      actorEmail: user.email,
      actorRole: isGuest ? "guest" : user.role,
      actorId: user.studentId || String(user._id),
      targetCategory: isGuest ? "guest" : (user.isPriority || user.userType === "priority" ? "priority" : "student"),
      action: isGuest ? `Guest Submitted Request #${requestNumber}` : `Submitted Document Request #${requestNumber}`,
      details: `${isGuest ? "Guest " : ""}${user.name} submitted request for ${document} (${req.body.copies || 1} copies). Purpose: ${purpose}. Priority: ${request.priority}.`,
      requestNumber,
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
      const rawRequests = await Request.find().sort({
        lineNumber: 1,
        createdAt: 1,
      }).lean();

      // Collect identifiers to enrich requests with up-to-date user details for staff
      const studentIds = rawRequests.map((r) => r.studentId).filter(Boolean);
      const emails = rawRequests.map((r) => r.email).filter(Boolean);
      const matchedUsers = await User.find({
        $or: [
          { studentId: { $in: studentIds } },
          { email: { $in: emails } },
        ],
      }).lean();

      const userMap = {};
      matchedUsers.forEach((u) => {
        if (u.studentId) userMap[u.studentId] = u;
        if (u.email) userMap[u.email] = u;
      });

      requests = rawRequests.map((r) => {
        const u = (r.studentId && userMap[r.studentId]) || (r.email && userMap[r.email]);
        if (u) {
          r.userDetails = {
            ...(r.userDetails || {}),
            picture: u.picture || r.userDetails?.picture || "",
            course: u.course || r.userDetails?.course || "",
            yearLevel: u.yearLevel || r.userDetails?.yearLevel || "",
            gender: u.gender || r.userDetails?.gender || "",
            birthDate: u.birthDate || r.userDetails?.birthDate || "",
            civilStatus: u.civilStatus || r.userDetails?.civilStatus || "",
            nationality: u.nationality || r.userDetails?.nationality || "",
            religion: u.religion || r.userDetails?.religion || "",
            lastName: u.lastName || r.userDetails?.lastName || "",
            firstName: u.firstName || r.userDetails?.firstName || "",
            middleName: u.middleName || r.userDetails?.middleName || "",
            extensionName: u.extensionName || r.userDetails?.extensionName || "",
            fatherName: u.fatherName || r.userDetails?.fatherName || "",
            fatherOccupation: u.fatherOccupation || r.userDetails?.fatherOccupation || "",
            fatherMobile: u.fatherMobile || r.userDetails?.fatherMobile || "",
            motherName: u.motherName || r.userDetails?.motherName || "",
            motherOccupation: u.motherOccupation || r.userDetails?.motherOccupation || "",
            motherMobile: u.motherMobile || r.userDetails?.motherMobile || "",
            spouseName: u.spouseName || r.userDetails?.spouseName || "",
            spouseOccupation: u.spouseOccupation || r.userDetails?.spouseOccupation || "",
            numberOfChildren: u.numberOfChildren || r.userDetails?.numberOfChildren || "0",
            numberOfBrothers: u.numberOfBrothers || r.userDetails?.numberOfBrothers || "0",
            numberOfSisters: u.numberOfSisters || r.userDetails?.numberOfSisters || "0",
            guardianName: u.guardianName || r.userDetails?.guardianName || "",
            guardianRelationship: u.guardianRelationship || r.userDetails?.guardianRelationship || "",
            guardianMobile: u.guardianMobile || r.userDetails?.guardianMobile || "",
            currentAddress: u.currentAddress || u.address || r.userDetails?.currentAddress || "",
            permanentAddress: u.permanentAddress || u.address || r.userDetails?.permanentAddress || "",
            address: u.address || u.currentAddress || r.userDetails?.address || "",
            emergencyContact: u.emergencyContact || r.userDetails?.emergencyContact || "",
            elemSchool: u.elemSchool || r.userDetails?.elemSchool || "",
            elemYearGrad: u.elemYearGrad || r.userDetails?.elemYearGrad || "",
            elemType: u.elemType || r.userDetails?.elemType || "",
            juniorHighSchool: u.juniorHighSchool || r.userDetails?.juniorHighSchool || "",
            juniorHighYearGrad: u.juniorHighYearGrad || r.userDetails?.juniorHighYearGrad || "",
            juniorHighType: u.juniorHighType || r.userDetails?.juniorHighType || "",
            seniorHighSchool: u.seniorHighSchool || r.userDetails?.seniorHighSchool || "",
            seniorHighYearGrad: u.seniorHighYearGrad || r.userDetails?.seniorHighYearGrad || "",
            seniorHighType: u.seniorHighType || r.userDetails?.seniorHighType || "",
          };
        }
        return r;
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

    const updatePayload = { status };
    if (req.body.assignedStaffId !== undefined) {
      updatePayload.assignedStaffId = req.body.assignedStaffId;
    }
    if (req.body.assignedStaffName !== undefined) {
      updatePayload.assignedStaffName = req.body.assignedStaffName;
    }

    const request = await Request.findOneAndUpdate(
      { requestNumber },
      updatePayload,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Notify student via email asynchronously
    notifyStudentOfUpdate(request);

    let staffUser = null;
    if (req.user?.id) {
      staffUser = await User.findById(req.user.id).lean();
    }

    recordAuditLog({
      actorName: staffUser?.name || req.body.assignedStaffName || req.user.name || "Registrar Staff",
      actorEmail: staffUser?.email || req.user.email || "",
      actorRole: staffUser?.role || req.user.role || "staff",
      actorId: staffUser?.studentId || staffUser?._id || req.body.assignedStaffId || String(req.user.id),
      actorPicture: staffUser?.picture || "",
      targetCategory: "staff",
      action: `Updated Ticket #${requestNumber} to ${status}`,
      details: `Status set to "${status}" for student ${request.student} (${request.document}). Remarks: ${request.remarks || "Updated by registrar staff."}`,
      requestNumber,
      status: status === "Needs Correction" ? "Warning" : "Success",
    });

    return res.status(200).json({
      message: "Request status updated successfully.",
      request,
    });
  } catch (error) {
    console.error("Update request status error:", error);
    return res.status(500).json({ message: "Server error while updating request status." });
  }
};

const notifyStudentOfUpdate = async (request) => {
  try {
    let studentEmail = request.email;
    if (!studentEmail && request.studentId) {
      const user = await User.findOne({ studentId: request.studentId });
      if (user && user.email) studentEmail = user.email;
    }
    if (!studentEmail && request.student) {
      const user = await User.findOne({ name: request.student });
      if (user && user.email) studentEmail = user.email;
    }

    if (studentEmail) {
      await sendRequestUpdateNotification({
        toEmail: studentEmail,
        studentName: request.student,
        requestNumber: request.requestNumber,
        document: request.document,
        status: request.status,
        pickupDate: request.pickupDate,
        paymentStatus: request.paymentStatus,
        remarks: request.remarks,
        lineNumber: request.lineNumber,
        copies: request.copies,
      });
    } else {
      console.warn(`[Request Controller] No email found for request ${request.requestNumber}`);
    }
  } catch (err) {
    console.error(`[Request Controller] Failed to notify student for ${request.requestNumber}:`, err?.message);
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
    if (req.body.assignedStaffId !== undefined) updateFields.assignedStaffId = req.body.assignedStaffId;
    if (req.body.assignedStaffName !== undefined) updateFields.assignedStaffName = req.body.assignedStaffName;

    const query = {
      $or: [
        { requestNumber },
        { requestNumber: new RegExp(`^${requestNumber}$`, "i") },
        ...(mongoose.Types.ObjectId.isValid(requestNumber) ? [{ _id: requestNumber }] : [])
      ]
    };

    const request = await Request.findOneAndUpdate(
      query,
      updateFields,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Notify student via email asynchronously
    notifyStudentOfUpdate(request);

    let staffUser = null;
    if (req.user?.id) {
      staffUser = await User.findById(req.user.id).lean();
    }

    recordAuditLog({
      actorName: staffUser?.name || req.body.assignedStaffName || req.user.name || "Registrar Staff",
      actorEmail: staffUser?.email || req.user.email || "",
      actorRole: staffUser?.role || req.user.role || "staff",
      actorId: staffUser?.studentId || staffUser?._id || req.body.assignedStaffId || String(req.user.id),
      actorPicture: staffUser?.picture || "",
      targetCategory: "staff",
      action: `Modified Ticket #${request.requestNumber || requestNumber}`,
      details: `Updated request for student ${request.student} (${request.document}). Status: ${request.status}. Remarks: ${request.remarks || "No remarks"}.`,
      requestNumber: request.requestNumber || requestNumber,
      status: "Success",
    });

    // Re-sequence remaining active queue lines so line numbers flow continuously without gaps
    if (request.status === "Claimed") {
      try {
        const remainingActive = await Request.find({
          status: { $ne: "Claimed" },
          _id: { $ne: request._id },
        }).sort({ lineNumber: 1, createdAt: 1 });

        for (let i = 0; i < remainingActive.length; i++) {
          const newLine = i + 1;
          if (remainingActive[i].lineNumber !== newLine) {
            remainingActive[i].lineNumber = newLine;
            await remainingActive[i].save();
          }
        }
      } catch (renumberErr) {
        console.error("Queue renumbering error on claim:", renumberErr);
      }
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

export const getRequestByNumber = async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const query = {
      $or: [
        { requestNumber },
        { requestNumber: new RegExp(`^${requestNumber}$`, "i") },
        ...(mongoose.Types.ObjectId.isValid(requestNumber) ? [{ _id: requestNumber }] : [])
      ]
    };
    const request = await Request.findOne(query);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Enforce student ownership: students can only access their own request
    if (req.user.role === "student" || req.user.role === "guest") {
      const isOwner =
        (req.user.studentId && request.studentId === req.user.studentId) ||
        (req.user.email && request.email === req.user.email);
      if (!isOwner) {
        return res.status(403).json({
          message: "Access denied. You do not have permission to access another student's document request.",
        });
      }
    }

    return res.status(200).json({ request });
  } catch (error) {
    console.error("getRequestByNumber error:", error);
    return res.status(500).json({ message: "Server error while fetching request." });
  }
};

export const rateRequest = async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const { rating, feedback } = req.body;

    const request = await Request.findOne({ requestNumber });
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Enforce student ownership: student can only rate their own request
    if (req.user.role === "student" || req.user.role === "guest") {
      const isOwner =
        (req.user.studentId && request.studentId === req.user.studentId) ||
        (req.user.email && request.email === req.user.email);
      if (!isOwner) {
        return res.status(403).json({
          message: "Access denied. You can only submit ratings for your own document requests.",
        });
      }
    }

    request.rating = Number(rating) || 5;
    request.feedback = (feedback || "").trim();
    request.feedbackAt = new Date();
    // Mark request as Claimed/Done when rated
    if (request.status !== "Claimed") {
      request.status = "Claimed";
    }
    await request.save();

    recordAuditLog({
      actorName: req.user.name || "Student",
      actorEmail: req.user.email || "",
      actorRole: req.user.role || "student",
      actorId: req.user.studentId || String(req.user.id),
      targetCategory: "student",
      action: `Rated Request #${requestNumber} (${request.rating} Stars)`,
      details: `Student rated staff "${request.assignedStaffName || "Registrar"}" with ${request.rating}/5 stars. Feedback/Thanks: "${request.feedback || "Thank you!"}"`,
      requestNumber,
      status: "Success",
    });

    return res.status(200).json({
      message: "Thank you! Your rating and feedback have been submitted.",
      request,
    });
  } catch (error) {
    console.error("Rate request error:", error);
    return res.status(500).json({ message: "Server error while submitting rating." });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const query = {
      $or: [
        { requestNumber },
        { requestNumber: new RegExp(`^${requestNumber}$`, "i") },
        ...(mongoose.Types.ObjectId.isValid(requestNumber) ? [{ _id: requestNumber }] : [])
      ]
    };
    const request = await Request.findOne(query);
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    await Request.deleteOne({ _id: request._id });

    recordAuditLog({
      actorName: req.user.name || "Registrar Staff",
      actorEmail: req.user.email || "",
      actorRole: req.user.role || "staff",
      actorId: req.user.studentId || String(req.user.id),
      targetCategory: "requests",
      action: `Deleted Request #${request.requestNumber || requestNumber}`,
      details: `Request for "${request.document}" (Student: ${request.student}, ID: ${request.studentId}) was permanently removed from active queue by ${req.user.name}.`,
      requestNumber: request.requestNumber || requestNumber,
      status: "Warning",
    });

    // Re-sequence remaining active queue lines so line numbers flow continuously without gaps
    try {
      const remainingActive = await Request.find({
        status: { $ne: "Claimed" }
      }).sort({ lineNumber: 1, createdAt: 1 });

      for (let i = 0; i < remainingActive.length; i++) {
        const newLine = i + 1;
        if (remainingActive[i].lineNumber !== newLine) {
          remainingActive[i].lineNumber = newLine;
          await remainingActive[i].save();
        }
      }
    } catch (renumberErr) {
      console.error("Queue renumbering after delete error:", renumberErr);
    }

    return res.status(200).json({
      message: `Request #${requestNumber} deleted successfully.`,
      requestNumber,
    });
  } catch (error) {
    console.error("deleteRequest error:", error);
    return res.status(500).json({ message: "Server error while deleting request." });
  }
};