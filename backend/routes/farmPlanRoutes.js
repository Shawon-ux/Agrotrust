// backend/routes/farmPlanRoutes.js — land details & crop lifecycle (FR-5, FR-10)
const express = require("express");
const router = express.Router();
const FarmPlan = require("../models/FarmPlan");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
const farmerOnly = (req, res, next) =>
  req.user.role === "FARMER" ? next() : res.status(403).json({ message: "Farmers only" });

router.get("/", farmerOnly, async (req, res) => {
  const plans = await FarmPlan.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, plans });
});

router.post("/", farmerOnly, async (req, res) => {
  try {
    const b = req.body;
    if (!String(b.cropName || "").trim() || !(Number(b.landArea) > 0)) {
      return res.status(400).json({ message: "Crop name and land area are required" });
    }
    const plan = await FarmPlan.create({
      farmer: req.user._id,
      cropName: b.cropName,
      landArea: Number(b.landArea),
      landUnit: b.landUnit || "acre",
      landLocation: b.landLocation,
      expectedYieldKg: b.expectedYieldKg ? Number(b.expectedYieldKg) : undefined,
      sowingDate: b.sowingDate || undefined,
      expectedHarvestDate: b.expectedHarvestDate || undefined,
      history: [{ stage: "PLANNED", note: "Plan created" }],
    });
    res.status(201).json({ success: true, plan });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// PATCH /api/farm-plans/:id/stage { stage, note, actualYieldKg }
router.patch("/:id/stage", farmerOnly, async (req, res) => {
  try {
    const { stage, note, actualYieldKg } = req.body;
    if (!FarmPlan.STAGES.includes(stage)) return res.status(400).json({ message: "Invalid stage" });
    const plan = await FarmPlan.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    plan.stage = stage;
    if (stage === "HARVESTED" && actualYieldKg) plan.actualYieldKg = Number(actualYieldKg);
    plan.history.push({ stage, note: note || "" });
    await plan.save();
    res.json({ success: true, plan });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete("/:id", farmerOnly, async (req, res) => {
  await FarmPlan.deleteOne({ _id: req.params.id, farmer: req.user._id });
  res.json({ success: true });
});

module.exports = router;
