const Crop = require("../models/Crop"); // adjust filename if yours is Crop.js

exports.search = async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ crops: [] });

  const regex = new RegExp(q, "i");
  const crops = await Crop.find({
    $or: [{ cropName: regex }, { name: regex }, { location: regex }, { variety: regex }],
  }).limit(30);

  res.json({ crops });
};
