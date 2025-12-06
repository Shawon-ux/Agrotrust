const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "CROP_CREATED"
    refType: { type: String, default: "SYSTEM" }, // CROP | ORDER | COMPLAINT | ...
    refId: { type: String },
    dataHash: { type: String, required: true }, // store hash
  },
  { timestamps: true }
);

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
