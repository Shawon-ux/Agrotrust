// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getCurrentUser,
  updateProfile,
  requestPhoneChange,
  listPhoneRequests,
  reviewPhoneRequest,
} = require("../controllers/userController");

const adminOnly = (req, res, next) =>
  req.user && req.user.role === "ADMIN"
    ? next()
    : res.status(403).json({ message: "Admin access required" });

router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.post("/phone-change", protect, requestPhoneChange);
router.get("/phone-requests", protect, adminOnly, listPhoneRequests);
router.put("/phone-requests/:id", protect, adminOnly, reviewPhoneRequest);

module.exports = router;
