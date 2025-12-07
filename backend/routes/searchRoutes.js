const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { searchAll } = require("../controllers/searchController");

router.get("/", protect, searchAll);
module.exports = router;
