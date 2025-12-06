const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/verificationController");

router.post("/", protect, ctrl.submit);
router.get("/mine", protect, ctrl.mine);

router.get("/", protect, authorizeRoles("ADMIN"), ctrl.listAll);
router.patch("/:id", protect, authorizeRoles("ADMIN"), ctrl.updateStatus);

module.exports = router;
