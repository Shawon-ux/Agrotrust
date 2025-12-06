const mongoose = require("mongoose");

const subsidySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, default: 0 },
    eligibility: { type: String, default: "FARMER" }, // FARMER | ALL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subsidy", subsidySchema);
