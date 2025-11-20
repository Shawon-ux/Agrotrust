const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getAnalyticsSummary } = require("../controllers/analyticsController");

// Admin only
router.get(
  "/summary",
  protect,
  authorizeRoles("ADMIN"),
  getAnalyticsSummary
);

module.exports = router;
