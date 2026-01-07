const Verification = require("../models/Verification");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ✅ User submits verification request
exports.submit = async (req, res) => {
  try {
    const { documentType, documentDetails } = req.body;
    
    if (!documentType) {
      return res.status(400).json({ message: "documentType is required" });
    }

    // Check if user already has a pending verification
    const existingPending = await Verification.findOne({
      user: req.user._id,
      verificationStatus: "PENDING"
    });

    if (existingPending) {
      return res.status(400).json({ 
        message: "You already have a pending verification request. Please wait for it to be reviewed." 
      });
    }

    const v = await Verification.create({
      user: req.user._id,
      documentType,
      documentDetails,
      verificationStatus: "PENDING",
      submittedAt: new Date(),
    });

    // Update user's verification status to PENDING
    await User.findByIdAndUpdate(req.user._id, {
      verificationStatus: "PENDING",
      isVerified: false,
    });

    // Create notification for admins
    const admins = await User.find({ role: "ADMIN" });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: "New Verification Request",
        message: `${req.user.name} has submitted a verification request.`,
        type: "VERIFICATION",
        link: `/verification`,
      });
    }

    res.status(201).json(v);
  } catch (err) {
    console.error("Verification submission error:", err);
    res.status(500).json({ message: err.message || "Failed to submit verification" });
  }
};

// ✅ User views their own verification requests
exports.mine = async (req, res) => {
  try {
    const list = await Verification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("Get my verifications error:", err);
    res.status(500).json({ message: err.message || "Failed to load your verification requests" });
  }
};

// ✅ Admin/Gov views all verification requests
exports.listAll = async (req, res) => {
  try {
    const list = await Verification.find()
      .populate("user", "name email role phone verificationStatus")
      .populate("reviewedBy", "name email")
      .populate("faceToFaceVerifiedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("List all verifications error:", err);
    res.status(500).json({ message: err.message || "Failed to load verification requests" });
  }
};

// ✅ Admin/Gov updates verification status
exports.updateStatus = async (req, res) => {
  try {
    const { status, rejectionReason, adminNotes, faceToFaceNotes, faceToFaceLocation } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedStatuses = ["APPROVED", "REJECTED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const verification = await Verification.findById(req.params.id).populate("user");
    
    if (!verification) {
      return res.status(404).json({ message: "Verification request not found" });
    }

    // Update verification record
    verification.verificationStatus = status;
    verification.reviewedBy = req.user._id;
    verification.reviewDate = new Date();
    
    if (rejectionReason) verification.rejectionReason = rejectionReason;
    if (adminNotes) verification.adminNotes = adminNotes;
    
    // If face-to-face verification was performed
    if (faceToFaceNotes || faceToFaceLocation) {
      verification.faceToFaceVerified = true;
      verification.faceToFaceDate = new Date();
      verification.faceToFaceVerifiedBy = req.user._id;
      if (faceToFaceNotes) verification.faceToFaceNotes = faceToFaceNotes;
      if (faceToFaceLocation) verification.faceToFaceLocation = faceToFaceLocation;
    }

    await verification.save();

    // Update user's verification status
    let userVerificationStatus = "UNVERIFIED";
    let isVerified = false;
    
    if (status === "APPROVED") {
      userVerificationStatus = "VERIFIED";
      isVerified = true;
    } else if (status === "REJECTED") {
      userVerificationStatus = "REJECTED";
      isVerified = false;
    }

    await User.findByIdAndUpdate(verification.user._id, {
      verificationStatus: userVerificationStatus,
      isVerified: isVerified,
      verificationDate: status === "APPROVED" ? new Date() : null,
      verifiedBy: status === "APPROVED" ? req.user._id : null,
      verificationNotes: status === "REJECTED" ? rejectionReason : null,
    });

    // Create notification for the user
    let notificationTitle = "";
    let notificationMessage = "";
    
    if (status === "APPROVED") {
      notificationTitle = "Verification Approved ✓";
      notificationMessage = "Your account has been verified! You now have a verified badge.";
    } else if (status === "REJECTED") {
      notificationTitle = "Verification Rejected";
      notificationMessage = `Your verification request was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ""}`;
    }

    if (notificationTitle) {
      await Notification.create({
        user: verification.user._id,
        title: notificationTitle,
        message: notificationMessage,
        type: "VERIFICATION",
        link: "/verification/me",
      });
    }

    res.json({
      message: `Verification ${status.toLowerCase()} successfully`,
      verification,
      userUpdated: true,
    });
  } catch (err) {
    console.error("Update verification status error:", err);
    res.status(500).json({ message: err.message || "Failed to update verification status" });
  }
};

// ✅ Get verification statistics (Admin/Gov only)
exports.getStats = async (req, res) => {
  try {
    const stats = await Verification.aggregate([
      {
        $group: {
          _id: "$verificationStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats[stat._id.toLowerCase()] = stat.count;
    });

    // Also get user verification stats
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$verificationStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      verificationRequests: formattedStats,
      userVerification: userStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to get verification stats" });
  }
};