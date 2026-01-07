// backend/routes/authRoutes.js

const { protect } = require("../middleware/authMiddleware");
const { getCurrentUser } = require("../controllers/userController");
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
} = require("../controllers/authController");

// Register
router.post("/register", registerUser);

// Verify Email
router.post("/verify-email", verifyEmail);

// Login
router.post("/login", loginUser);

// Optional: test GET route so browser doesn't show "Cannot GET"
router.get("/register", (req, res) => {
  res.json({ message: "Use POST /api/auth/register to create a user" });
});
router.route("/me").get(protect, getCurrentUser);

module.exports = router;
