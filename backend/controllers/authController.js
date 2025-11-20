// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getSecret = () => {
  // fallback if JWT_SECRET missing
  return process.env.JWT_SECRET || "dev_secret_key_change_me";
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error("Register error (backend):", err);

    // SEND FULL DETAILS TO FRONTEND SO YOU CAN SEE WHAT'S WRONG
    return res.status(500).json({
      message:
        "REGISTER DEBUG: " + (err?.message || "Unknown error"),
      stack: err?.stack || null,
    });
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error("Login error (backend):", err);

    return res.status(500).json({
      message:
        "LOGIN DEBUG: " + (err?.message || "Unknown error"),
      stack: err?.stack || null,
    });
  }
};
