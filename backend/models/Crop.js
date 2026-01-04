const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cropName: { type: String, required: true },
    quantityAvailable: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    location: { type: String },
    imageUrl: { type: String }, // for image path
    // --- ADD THIS ---
    status: {
      type: String,
      enum: ["AVAILABLE", "SOLD_OUT"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true }
);

// Optional: Add a pre-save hook to auto-update status based on quantity
cropSchema.pre("save", function (next) {
  if (this.quantityAvailable > 0 && !this.status) {
    this.status = "AVAILABLE";
  } else if (this.quantityAvailable === 0) {
    this.status = "SOLD_OUT";
  }
  next();
});

module.exports = mongoose.model("Crop", cropSchema);