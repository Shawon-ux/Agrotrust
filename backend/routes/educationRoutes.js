const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { listContent } = require("../controllers/educationController");

router.get("/", protect, listContent);

module.exports = router;
