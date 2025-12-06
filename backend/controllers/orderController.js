let Crop;
try {
  Crop = require("../models/Crop");
} catch (e) {
  Crop = require("../models/Crops");
}

const Order = require("../models/Order");

// POST /api/orders  (BUYER)
exports.createOrder = async (req, res) => {
  try {
    const { cropId, quantity } = req.body;
    const qty = Number(quantity);

    if (!cropId || !qty || qty <= 0) {
      return res.status(400).json({ message: "cropId and valid quantity are required" });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const available = Number(crop.quantityAvailable ?? 0);
    if (available < qty) {
      return res.status(400).json({ message: `Only ${available} available` });
    }

    const pricePerUnit = Number(crop.pricePerUnit ?? 0);
    const totalPrice = pricePerUnit * qty;

    const order = await Order.create({
      buyer: req.user.id,
      crop: crop._id,
      quantity: qty,
      unit: crop.unit || "kg",
      pricePerUnit,
      totalPrice
    });

    // reduce crop stock
    crop.quantityAvailable = available - qty;
    crop.status = crop.quantityAvailable > 0 ? "AVAILABLE" : "SOLD_OUT";
    await crop.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
