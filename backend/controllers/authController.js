// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const EmailOTP = require("../models/EmailOTP");
const sendEmail = require("../utils/sendEmail");

// ❌ Do NOT silently fall back in production
// ✅ Fail fast if JWT_SECRET is missing
const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return process.env.JWT_SECRET;
};

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ==============================
// POST /api/auth/register
// ==============================
exports.registerUser = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ // 409 Conflict
        message: "User already exists",
      });
    }

    // 1. Create User (isVerified: false by default)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(">>> GENERATED OTP:", otp); // For debugging if email fails

    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // 3. Store OTP
    await EmailOTP.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // 4. Send Email
    try {
      await sendEmail({
        email,
        subject: "AgroTrust Email Verification",
        message: `Your verification code is ${otp}. It expires in 5 minutes.`,
        html: `<h3>Email Verification</h3><p>Your verification code is <b>${otp}</b>.</p><p>It expires in 5 minutes.</p>`,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Optional: Delete user if email fails? Or just let them retry?
      // For now, we return 500 but keep user (they can resend or we can handle cleanup)
      return res.status(500).json({ message: "User created but email failed to send" });
    }

    return res.status(201).json({
      message: "Verification code sent to email",
      email: user.email // Helpful for frontend redirection
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      message: err.message || "Registration failed",
    });
  }
};

// ==============================
// POST /api/auth/verify-email
// ==============================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // 1. Find OTP record
    // We get the latest OTP for this email
    const otpRecord = await EmailOTP.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 2. Check Expiry
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // 3. Verify Hash
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 4. Update User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    // 5. Cleanup OTP (Optional: delete or mark verified)
    // We can delete it to prevent reuse
    await EmailOTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({ message: "Email verified successfully" });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// POST /api/auth/login
// ==============================
exports.loginUser = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: err.message || "Login failed",
    });
  }
};
