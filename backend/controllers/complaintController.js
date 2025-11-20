const Complaint = require("../models/Complaint");

exports.createComplaint = async (req, res) => {
  try {
    const { againstUser, complaintType, description } = req.body;
    const complaint = await Complaint.create({
      reporter: req.user._id,
      againstUser,
      complaintType,
      description,
    });
    res.status(201).json(complaint);
  } catch (err) {
    console.error("Create complaint error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
