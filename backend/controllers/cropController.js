// backend/controllers/cropController.js
const Crop = require("../models/Crop");

// GET /api/crops  (public for logged-in users; you can keep it public too)
exports.getAllCrops = async (req, res) => {
  try {
    const crops = await Crop.find().sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load crops" });
  }
};

// POST /api/crops   (ADMIN can add new crop; if you want FARMER too, add in routes)
exports.createCrop = async (req, res) => {
  try {
    const {
      cropName,
      name, // allow either
      variety,
      location,
      pricePerUnit,
      pricePerKg, // allow either
      quantityAvailable,
      quantityKg, // allow either
      unit,
      status,
    } = req.body;

    const finalName = (cropName || name || "").trim();
    const finalPrice = Number(pricePerUnit ?? pricePerKg ?? 0);
    const finalQty = Number(quantityAvailable ?? quantityKg ?? 0);

    if (!finalName) return res.status(400).json({ message: "cropName is required" });
    if (!finalPrice) return res.status(400).json({ message: "pricePerUnit is required" });

    // image path from multer
    let imageUrl = "";
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    const crop = await Crop.create({
      cropName: finalName,
      variety: variety || "",
      location: location || "",
      pricePerUnit: finalPrice,
      quantityAvailable: finalQty,
      unit: unit || "kg",
      status: status || (finalQty > 0 ? "AVAILABLE" : "SOLD_OUT"),
      imageUrl,
      // if your schema requires farmer, set it:
      farmer: req.user?._id, // only if your Crop schema has farmer required
    });

    res.status(201).json(crop);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create crop" });
  }
};

// PATCH /api/crops/:id/availability  (ADMIN only)
exports.setCropAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    const crop = await Crop.findById(id);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    crop.status = available ? "AVAILABLE" : "SOLD_OUT";
    await crop.save();

    res.json({ message: "Availability updated", crop });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update availability" });
  }
};
