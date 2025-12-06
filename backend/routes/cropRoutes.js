const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  createCrop,
  getAllCrops,
  setCropAvailability,
} = require("../controllers/cropController");

// Farmer: create crop listing
router.post("/", protect, authorizeRoles("FARMER"), createCrop);

// Public (or logged-in) view crops
router.get("/", getAllCrops);

// Admin: change availability
router.patch(
  "/:id/availability",
  protect,
  authorizeRoles("ADMIN"),
  setCropAvailability
);

module.exports = router;
