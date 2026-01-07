const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    documentType: { 
      type: String, 
      required: true,
      enum: ["NATIONAL_ID", "DRIVING_LICENSE", "PASSPORT", "GOV_EMPLOYEE_ID", "OTHER"]
    },
    
    documentDetails: {
      type: String, // Additional details about the document
    },
    
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    
    // Admin fields
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    reviewDate: {
      type: Date,
    },
    
    adminNotes: {
      type: String,
    },
    
    rejectionReason: {
      type: String,
    },
    
    // Supporting documents (if needed for future)
    supportingDocs: [{
      name: String,
      url: String,
      uploadedAt: Date
    }],
    
    // Face-to-face verification details
    faceToFaceVerified: {
      type: Boolean,
      default: false,
    },
    
    faceToFaceDate: {
      type: Date,
    },
    
    faceToFaceNotes: {
      type: String,
    },
    
    faceToFaceLocation: {
      type: String,
    },
    
    faceToFaceVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    
    // For tracking verification attempts
    verificationAttempts: {
      type: Number,
      default: 1,
    },
    
    previousStatuses: [{
      status: String,
      changedAt: Date,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: String,
    }],
  },
  { timestamps: true }
);

// Pre-save hook to track status changes
verificationSchema.pre("save", function (next) {
  if (this.isModified("verificationStatus") && !this.isNew) {
    if (!this.previousStatuses) {
      this.previousStatuses = [];
    }
    
    this.previousStatuses.push({
      status: this.verificationStatus,
      changedAt: new Date(),
      changedBy: this.reviewedBy || null,
      notes: this.adminNotes || this.rejectionReason || "Status changed",
    });
  }
  
  next();
});

// Method to get readable status
verificationSchema.methods.getReadableStatus = function () {
  const statusMap = {
    PENDING: "Pending Review",
    APPROVED: "Approved ✓",
    REJECTED: "Rejected ✗",
    CANCELLED: "Cancelled",
  };
  return statusMap[this.verificationStatus] || this.verificationStatus;
};

module.exports = mongoose.model("Verification", verificationSchema);