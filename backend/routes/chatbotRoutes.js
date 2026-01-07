// backend/routes/chatbotRoutes.js
const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/chatbotController");

router.post("/ask", protect, ctrl.ask);
router.post("/analyze-image", protect, ctrl.analyzeImage);

module.exports = router;