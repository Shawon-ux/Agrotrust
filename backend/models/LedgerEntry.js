const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    referenceType: { type: String, enum: ["SUBSIDY", "ORDER", "PAYMENT"], required: true },
    referenceId: { type: String, required: true },
    transactionHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
