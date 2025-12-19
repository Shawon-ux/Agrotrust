// backend/routes/cropRoutes.js
const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  createCrop,
  getAllCrops,
  setCropAvailability,
} = require("../controllers/cropController");

// View crops
router.get("/", protect, getAllCrops);

// Admin add crop (with optional image upload field name: "image")
// This is the existing route for POST /api/crops
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  upload.single("image"),
  createCrop
);

// NEW ROUTE: Admin add crop via POST /api/crops/admin
// This matches what your frontend is calling
router.post(
  "/admin", // <-- This is the key change
  protect,
  authorizeRoles("ADMIN"),
  upload.single("image"),
  createCrop
);

// Admin toggle availability
router.patch(
  "/:id/availability",
  protect,
  authorizeRoles("ADMIN"),
  setCropAvailability
);

module.exports = router;