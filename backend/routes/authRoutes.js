// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Optional: test GET route so browser doesn't show "Cannot GET"
router.get("/register", (req, res) => {
  res.json({ message: "Use POST /api/auth/register to create a user" });
});

module.exports = router;
