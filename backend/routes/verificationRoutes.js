const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/verificationController");

// User submits verification request
router.post("/", protect, ctrl.submit);

// User views their own verification requests
router.get("/mine", protect, ctrl.mine);

// Admin/Gov views all verification requests
router.get("/", protect, authorizeRoles("ADMIN", "GOV_OFFICIAL"), ctrl.listAll);

// Admin/Gov updates verification status
router.patch("/:id", protect, authorizeRoles("ADMIN", "GOV_OFFICIAL"), ctrl.updateStatus);

// Get verification statistics (Admin/Gov only)
router.get("/stats", protect, authorizeRoles("ADMIN", "GOV_OFFICIAL"), ctrl.getStats);

module.exports = router;