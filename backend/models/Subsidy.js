const mongoose = require("mongoose");

const subsidySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    // Government specific fields
    issuedBy: { type: String, required: true, default: "Government" },
    category: {
      type: String,
      enum: ["FERTILIZER", "SEEDS", "MACHINERY", "CASH", "INSURANCE", "OTHER"],
      default: "OTHER"
    },
    deadline: { type: Date },
    totalBudget: { type: Number }, // Optional cap for the subsidy program
    requirements: [{ type: String }], // List of required docs/conditions

    amount: { type: Number, default: 0 },
    eligibility: { type: String, default: "FARMER" }, // FARMER | ALL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subsidy", subsidySchema);
