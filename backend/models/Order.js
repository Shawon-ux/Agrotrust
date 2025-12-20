// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    farmer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    crop: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Crop", 
      required: true 
    },
    cropName: {
      type: String,
      required: true
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    unit: { 
      type: String, 
      default: "kg" 
    },
    pricePerUnit: { 
      type: Number, 
      required: true 
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING" 
    },
    paymentMethod: {
      type: String,
      enum: ["CASH_ON_DELIVERY", "ONLINE_PAYMENT"],
      default: "CASH_ON_DELIVERY"
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING"
    },
    shippingAddress: {
      type: String
    },
    contactNumber: {
      type: String
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);