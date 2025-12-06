const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/analyticsController");

router.get("/summary", protect, authorizeRoles("ADMIN", "GOV_OFFICIAL"), ctrl.summary);
module.exports = router;
