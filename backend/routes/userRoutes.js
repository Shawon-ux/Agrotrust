// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getCurrentUser } = require("../controllers/userController");

router.route("/me").get(protect, getCurrentUser);

module.exports = router;