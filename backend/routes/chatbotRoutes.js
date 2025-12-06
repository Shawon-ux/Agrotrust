const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/chatbotController");

router.post("/ask", protect, ctrl.ask);

module.exports = router;
