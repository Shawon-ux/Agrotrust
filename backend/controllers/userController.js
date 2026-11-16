// backend/controllers/userController.js
const User = require("../models/User");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("enrolledCourses", "title instructor published");
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /api/users/profile — name & address only. Phone needs admin approval.
exports.updateProfile = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (phone !== undefined && String(phone).trim() !== String(user.phone || "").trim()) {
      return res.status(403).json({
        message: "Phone number cannot be changed directly. Please send a change request to the admin.",
      });
    }
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ message: "Name cannot be empty" });
      user.name = String(name).trim();
    }
    if (address !== undefined) user.address = String(address).trim();

    await user.save();
    const out = await User.findById(user._id).select("-password");
    res.json({ success: true, user: out });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// POST /api/users/phone-change — user asks admin to change phone
exports.requestPhoneChange = async (req, res) => {
  try {
    const newPhone = String(req.body.newPhone || "").trim();
    if (!/^[+0-9][0-9\s-]{6,17}$/.test(newPhone)) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }
    const user = await User.findById(req.user._id);
    if (newPhone === user.phone) {
      return res.status(400).json({ message: "This is already your phone number" });
    }
    user.phoneChangeRequest = { newPhone, status: "PENDING", requestedAt: new Date() };
    await user.save();
    res.json({ success: true, phoneChangeRequest: user.phoneChangeRequest });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ADMIN: GET /api/users/phone-requests
exports.listPhoneRequests = async (req, res) => {
  try {
    const users = await User.find({ "phoneChangeRequest.status": "PENDING" })
      .select("name email role phone phoneChangeRequest");
    res.json({ success: true, requests: users });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ADMIN: PUT /api/users/phone-requests/:id  { action: "approve" | "reject" }
exports.reviewPhoneRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.phoneChangeRequest?.status !== "PENDING") {
      return res.status(404).json({ message: "No pending request for this user" });
    }
    if (req.body.action === "approve") {
      user.phone = user.phoneChangeRequest.newPhone;
      user.phoneChangeRequest.status = "APPROVED";
    } else if (req.body.action === "reject") {
      user.phoneChangeRequest.status = "REJECTED";
    } else {
      return res.status(400).json({ message: "action must be approve or reject" });
    }
    user.phoneChangeRequest.reviewedAt = new Date();
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
