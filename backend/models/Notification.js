// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    message: {
      type: String,
      required: true
    },
    type: { 
      type: String, 
      enum: ["INFO", "WARNING", "SUCCESS", "ERROR", "CROP_REQUEST", "ORDER_UPDATE", "SUBSIDY_UPDATE"],
      default: "INFO" 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
    link: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Store additional data like crop details, farmer info, etc.
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);