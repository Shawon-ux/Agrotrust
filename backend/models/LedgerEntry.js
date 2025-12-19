const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true, // e.g. SUBSIDY_APPROVED
    },

    refType: {
      type: String,
      default: "SYSTEM", // SUBSIDY | USER | ORDER
    },

    refId: {
      type: String,
    },

    payload: {
      type: Object, // data snapshot
      required: true,
    },

    previousHash: {
      type: String,
      required: true,
    },

    hash: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
