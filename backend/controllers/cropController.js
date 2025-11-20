const Crop = require("../models/Crop");

// POST /api/crops
exports.createCrop = async (req, res) => {
  try {
    const { cropName, quantityAvailable, pricePerUnit, location } = req.body;
    const crop = await Crop.create({
      farmer: req.user._id,
      cropName,
      quantityAvailable,
      pricePerUnit,
      location,
    });
    res.status(201).json(crop);
  } catch (err) {
    console.error("Create crop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/crops (for BuyerPortal browsing)
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find().populate("farmer", "name location");
    res.json(crops);
  } catch (err) {
    console.error("Get crops error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
