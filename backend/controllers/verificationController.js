const Verification = require("../models/Verification");

exports.submit = async (req, res) => {
  const { documentType } = req.body;
  if (!documentType) return res.status(400).json({ message: "documentType required" });

  const v = await Verification.create({
    user: req.user._id,
    documentType,
    verificationStatus: "PENDING",
  });

  res.status(201).json(v);
};

exports.mine = async (req, res) => {
  const list = await Verification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(list);
};

exports.listAll = async (req, res) => {
  const list = await Verification.find().populate("user", "name email role").sort({ createdAt: -1 });
  res.json(list);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body; // APPROVED/REJECTED
  const v = await Verification.findById(req.params.id);
  if (!v) return res.status(404).json({ message: "Not found" });
  v.verificationStatus = status;
  await v.save();
  res.json(v);
};
