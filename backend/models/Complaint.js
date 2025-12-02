const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    againstUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    complaintType: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
