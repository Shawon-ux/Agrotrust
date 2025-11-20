const User = require("../models/User");
const Order = require("../models/Order");
const Subsidy = require("../models/Subsidy");

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSubsidies = await Subsidy.countDocuments();
    res.json({ totalUsers, totalOrders, totalSubsidies });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
