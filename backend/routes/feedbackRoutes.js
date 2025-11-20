const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { submitFeedback } = require("../controllers/feedbackController");

// Buyer gives feedback
router.post("/", protect, authorizeRoles("BUYER"), submitFeedback);

module.exports = router;
