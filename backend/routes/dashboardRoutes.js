const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  getFarmerDashboard,
  getGovernmentDashboard,
  getAdminPanelSummary,
} = require("../controllers/dashboardController");

// Farmer dashboard
router.get(
  "/farmer",
  protect,
  authorizeRoles("FARMER"),
  getFarmerDashboard
);

// Government dashboard
router.get(
  "/government",
  protect,
  authorizeRoles("GOV_OFFICIAL"),
  getGovernmentDashboard
);

// Admin panel
router.get(
  "/admin",
  protect,
  authorizeRoles("ADMIN"),
  getAdminPanelSummary
);

module.exports = router;
