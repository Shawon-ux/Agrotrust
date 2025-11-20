const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { searchCrops } = require("../controllers/searchController");

router.get("/crops", protect, searchCrops);

module.exports = router;
