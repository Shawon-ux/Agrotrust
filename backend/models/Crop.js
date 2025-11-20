const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cropName: { type: String, required: true },
    quantityAvailable: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    location: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
