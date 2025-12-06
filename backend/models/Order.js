const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: "Crop", required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    pricePerUnit: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
