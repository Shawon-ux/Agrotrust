const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createCrop, getAllCrops } = require("../controllers/cropController");

// Farmer: manage crops
router.post("/", protect, authorizeRoles("FARMER"), createCrop);

// Buyer/Farmer: view crops
router.get("/", protect, getAllCrops);

module.exports = router;
