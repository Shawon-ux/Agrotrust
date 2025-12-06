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


// PATCH /api/crops/:id/availability  (ADMIN only)
exports.setCropAvailability = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { available } = req.body; // boolean
    const crop = await Crop.findById(req.params.id);

    if (!crop) return res.status(404).json({ message: "Crop not found" });

    if (available === true) {
      // Set to AVAILABLE (if quantity is 0, give minimum 1 so UI won't show sold out)
      if ((crop.quantityAvailable ?? 0) <= 0) crop.quantityAvailable = 1;
      crop.status = "AVAILABLE";
    } else {
      crop.quantityAvailable = 0;
      crop.status = "SOLD_OUT";
    }

    await crop.save();
    res.json({ message: "Updated", crop });
  } catch (err) {
    console.error("setCropAvailability error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
