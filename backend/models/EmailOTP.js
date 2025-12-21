const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const emailOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // Automatically delete after expiry
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Method to verify OTP
emailOTPSchema.methods.verifyOTP = async function (enteredOTP) {
    return await bcrypt.compare(enteredOTP, this.otpHash);
};

module.exports = mongoose.model("EmailOTP", emailOTPSchema);
