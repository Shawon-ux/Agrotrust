// backend/routes/marketPriceRoutes.js
const express = require("express");
const router = express.Router();
const MarketPrice = require("../models/MarketPrice");
const { protect } = require("../middleware/authMiddleware");

const canEdit = (req, res, next) =>
  req.user && ["ADMIN", "GOV_OFFICIAL"].includes(req.user.role)
    ? next()
    : res.status(403).json({ message: "Only admins or government officials can update prices" });

// GET /api/market-prices  -> recent price entries (newest first)
router.get("/", protect, async (req, res) => {
  try {
    const prices = await MarketPrice.find().sort({ createdAt: -1 }).limit(1000);
    res.json({ success: true, prices });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to load prices" });
  }
});

// POST /api/market-prices  { cropName, region, pricePerUnit }
router.post("/", protect, canEdit, async (req, res) => {
  try {
    const cropName = String(req.body.cropName || "").trim();
    const region = String(req.body.region || "").trim();
    const pricePerUnit = Number(req.body.pricePerUnit);
    if (!cropName || !region || !(pricePerUnit > 0)) {
      return res.status(400).json({ message: "Crop, region and a positive price are required" });
    }
    const price = await MarketPrice.create({ cropName, region, pricePerUnit });
    res.status(201).json({ success: true, price });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to save price" });
  }
});

module.exports = router;
