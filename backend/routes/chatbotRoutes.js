const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { askBot } = require("../controllers/chatbotController");

router.post("/ask", protect, askBot);

module.exports = router;
