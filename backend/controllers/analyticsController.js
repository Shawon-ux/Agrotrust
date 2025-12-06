const User = require("../models/User");
const Crop = require("../models/Crop");
const Complaint = require("../models/Complaint");

exports.summary = async (req, res) => {
  const [users, farmers, buyers, crops, complaints] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "FARMER" }),
    User.countDocuments({ role: "BUYER" }),
    Crop.countDocuments(),
    Complaint.countDocuments(),
  ]);

  res.json({ users, farmers, buyers, crops, complaints });
};
