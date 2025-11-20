const Crop = require("../models/Crop");

exports.searchCrops = async (req, res) => {
  try {
    const { q, location } = req.query;
    const query = {};

    if (q) {
      query.cropName = { $regex: q, $options: "i" };
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const crops = await Crop.find(query);
    res.json(crops);
  } catch (err) {
    console.error("Search crops error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
