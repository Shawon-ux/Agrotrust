const Crop = require("../models/Crop");
const Order = require("../models/Order");
const Subsidy = require("../models/Subsidy");
const User = require("../models/User");

// GET /api/dashboard/farmer
exports.getFarmerDashboard = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const cropCount = await Crop.countDocuments({ farmer: farmerId });
    const ordersCount = await Order.countDocuments({ farmer: farmerId });
    const subsidies = await Subsidy.find({ farmer: farmerId });

    res.json({
      cropCount,
      ordersCount,
      subsidyCount: subsidies.length,
    });
  } catch (err) {
    console.error("Farmer dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/dashboard/government
exports.getGovernmentDashboard = async (req, res) => {
  try {
    const totalSubsidies = await Subsidy.countDocuments();
    const approved = await Subsidy.countDocuments({ status: "APPROVED" });
    const disbursed = await Subsidy.countDocuments({ status: "DISBURSED" });
    res.json({ totalSubsidies, approved, disbursed });
  } catch (err) {
    console.error("Gov dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/dashboard/admin
exports.getAdminPanelSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: "FARMER" });
    const totalBuyers = await User.countDocuments({ role: "BUYER" });
    res.json({ totalUsers, totalFarmers, totalBuyers });
  } catch (err) {
    console.error("Admin panel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
