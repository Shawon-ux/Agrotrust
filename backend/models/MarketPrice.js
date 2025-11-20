const mongoose = require("mongoose");

const marketPriceSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    region: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketPrice", marketPriceSchema);
