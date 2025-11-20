// controllers/subsidyController.js
const Subsidy = require("../models/Subsidy");

// POST /api/subsidies/apply  (Farmer)
exports.applyForSubsidy = async (req, res) => {
  try {
    const { programName } = req.body;

    const subsidy = await Subsidy.create({
      farmer: req.user._id,
      programName,
    });

    res.status(201).json(subsidy);
  } catch (err) {
    console.error("Apply subsidy error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/subsidies/:id/status  (Gov official)
exports.updateSubsidyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const subsidy = await Subsidy.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!subsidy) {
      return res.status(404).json({ message: "Subsidy not found" });
    }

    res.json(subsidy);
  } catch (err) {
    console.error("Update subsidy error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
