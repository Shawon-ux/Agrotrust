const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    phone: { type: String },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["FARMER", "BUYER", "ADMIN", "GOV_OFFICIAL"],
      default: "FARMER",
    },
    languagePreference: { type: String, default: "en" },
    
    // ✅ ENHANCED VERIFICATION FIELDS
    isVerified: { type: Boolean, default: false }, // Keep for backward compatibility
    
    // New comprehensive verification fields
    verificationStatus: {
      type: String,
      enum: ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"],
      default: "UNVERIFIED",
    },
    verificationDate: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationNotes: {
      type: String,
    },
    
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

// hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ Helper method to check if user is verified
userSchema.methods.isUserVerified = function () {
  return this.verificationStatus === "VERIFIED" || this.isVerified === true;
};

// ✅ Helper method to update verification status
userSchema.methods.updateVerification = async function (status, verifiedBy = null, notes = null) {
  this.verificationStatus = status;
  
  if (status === "VERIFIED") {
    this.isVerified = true;
    this.verificationDate = new Date();
    this.verifiedBy = verifiedBy;
  } else if (status === "REJECTED") {
    this.isVerified = false;
    this.verificationDate = null;
    this.verifiedBy = null;
  }
  
  if (notes) {
    this.verificationNotes = notes;
  }
  
  return this.save();
};

module.exports = mongoose.model("User", userSchema);