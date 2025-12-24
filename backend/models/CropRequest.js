// backend/models/CropRequest.js
const mongoose = require("mongoose");

const cropRequestSchema = new mongoose.Schema(
  {
    farmer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    cropName: { 
      type: String, 
      required: true 
    },
    variety: { 
      type: String, 
      default: "" 
    },
    location: { 
      type: String, 
      default: "" 
    },
    pricePerUnit: { 
      type: Number, 
      required: true 
    },
    quantityAvailable: { 
      type: Number, 
      required: true 
    },
    unit: { 
      type: String, 
      default: "kg" 
    },
    description: {
      type: String,
      default: ""
    },
    imageUrl: { 
      type: String 
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    adminNotes: {
      type: String
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CropRequest", cropRequestSchema);