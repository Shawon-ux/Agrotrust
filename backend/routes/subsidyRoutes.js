// routes/subsidyRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  applyForSubsidy,
  updateSubsidyStatus,
} = require("../controllers/subsidyController");

// Farmer applies for subsidy
router.post("/apply", protect, authorizeRoles("FARMER"), applyForSubsidy);

// Government official updates subsidy status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("GOV_OFFICIAL"),
  updateSubsidyStatus
);

module.exports = router;
