const Complaint = require("../models/Complaint");

// GET /api/complaints
// ADMIN => all complaints
// Others => only their own complaints
exports.getComplaints = async (req, res) => {
  try {
    const isAdmin = req.user.role === "ADMIN";
    const filter = isAdmin ? {} : { createdBy: req.user._id };

    const complaints = await Complaint.find(filter)
      .populate("createdBy", "name email role")
      .populate("againstUser", "name email role")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("getComplaints error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { againstUser, complaintType, description } = req.body;

    if (!complaintType || !description) {
      return res.status(400).json({ message: "complaintType and description are required" });
    }

    let againstUserId = undefined;
    if (againstUser) {
      // Check if input looks like an email
      if (againstUser.includes("@")) {
        const userFound = await require("../models/User").findOne({ email: againstUser });
        if (!userFound) {
          return res.status(404).json({ message: `User with email '${againstUser}' not found` });
        }
        againstUserId = userFound._id;
      } else {
        // Assume it's an ID (backward compatibility)
        againstUserId = againstUser;
      }
    }

    const complaint = await Complaint.create({
      createdBy: req.user._id,
      againstUser: againstUserId,
      complaintType,
      description,
      status: "PENDING",
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error("createComplaint error:", err);
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/complaints/:id/status  (ADMIN only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { status } = req.body;
    const allowed = ["PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("againstUser", "name email role");

    if (!updated) return res.status(404).json({ message: "Complaint not found" });

    res.json(updated);
  } catch (err) {
    console.error("updateComplaintStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};
