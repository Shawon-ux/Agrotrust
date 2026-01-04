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
  requestCropAddition,
  getCropRequests,
  approveCropRequest,
  getMyCrops,
  getMyCropRequests
} = require("../controllers/cropController");

// View crops (public)
router.get("/", protect, getAllCrops);

// FARMER can request to add crop (new route)
router.post(
  "/request",
  protect,
  authorizeRoles("FARMER"),
  upload.single("image"),
  requestCropAddition
);

// Farmer's crops
router.get(
  "/my-crops",
  protect,
  authorizeRoles("FARMER"),
  getMyCrops
);

// Farmer's crop requests
router.get(
  "/my-requests",
  protect,
  authorizeRoles("FARMER"),
  getMyCropRequests
);

// Admin view crop requests
router.get(
  "/requests",
  protect,
  authorizeRoles("ADMIN"),
  getCropRequests
);

// Admin approve/reject crop request
router.patch(
  "/requests/:id",
  protect,
  authorizeRoles("ADMIN"),
  approveCropRequest
);

// ADMIN add crop directly (with optional image upload field name: "image")
router.post(
  "/",
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