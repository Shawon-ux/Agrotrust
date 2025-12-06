const crypto = require("crypto");
const LedgerEntry = require("../models/LedgerEntry");

exports.listLedger = async (req, res) => {
  const list = await LedgerEntry.find().sort({ createdAt: -1 }).limit(200);
  res.json(list);
};

exports.addLedgerEntry = async (req, res) => {
  const { action, refType, refId, payload } = req.body;
  if (!action) return res.status(400).json({ message: "action required" });

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload || {}))
    .digest("hex");

  const entry = await LedgerEntry.create({
    actor: req.user._id,
    action,
    refType: refType || "SYSTEM",
    refId: refId || "",
    dataHash: hash,
  });

  res.status(201).json(entry);
};
