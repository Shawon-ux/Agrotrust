const mongoose = require("mongoose");

const subsidyApplicationSchema = new mongoose.Schema(
  {
    subsidy: { type: mongoose.Schema.Types.ObjectId, ref: "Subsidy", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    note: String,
    adminReply: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubsidyApplication", subsidyApplicationSchema);
