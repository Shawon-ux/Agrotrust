const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/notificationController");

router.get("/", protect, ctrl.getMyNotifications);
router.patch("/:id/read", protect, ctrl.markRead);

module.exports = router;
