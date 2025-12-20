const Subsidy = require("../models/Subsidy");
const SubsidyApplication = require("../models/SubsidyApplication");

exports.getSubsidies = async (req, res) => {
  const list = await Subsidy.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(list);
};

exports.createSubsidy = async (req, res) => {
  const subsidy = await Subsidy.create({
    ...req.body,
    issuedBy: req.body.issuedBy || "Ministry of Agriculture", // Default if not provided
  });
  res.status(201).json(subsidy);
};

exports.applySubsidy = async (req, res) => {
  const { subsidyId, note } = req.body;
  if (!subsidyId) return res.status(400).json({ message: "subsidyId required" });

  const subsidy = await Subsidy.findById(subsidyId);
  if (!subsidy) return res.status(404).json({ message: "Subsidy not found" });

  if (!subsidy.isActive) {
    return res.status(400).json({ message: "This subsidy is no longer active" });
  }

  if (subsidy.deadline && new Date() > new Date(subsidy.deadline)) {
    return res.status(400).json({ message: "Application deadline has passed" });
  }

  const app = await SubsidyApplication.create({
    subsidy: subsidyId,
    farmer: req.user._id,
    note,
  });

  res.status(201).json(app);
};

exports.mySubsidyApplications = async (req, res) => {
  const apps = await SubsidyApplication.find({ farmer: req.user._id })
    .populate("subsidy")
    .sort({ createdAt: -1 });
  res.json(apps);
};

// Admin/Gov can review
exports.updateApplicationStatus = async (req, res) => {
  const { status, adminReply } = req.body;
  const app = await SubsidyApplication.findById(req.params.id);
  if (!app) return res.status(404).json({ message: "Application not found" });

  if (status) app.status = status;
  if (adminReply !== undefined) app.adminReply = adminReply;

  await app.save();
  res.json(app);
};
