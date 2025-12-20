const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/subsidyController");

router.get("/", protect, ctrl.getSubsidies);
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN", "GOV_OFFICIAL"),
  ctrl.createSubsidy
);
router.post("/apply", protect, authorizeRoles("FARMER"), ctrl.applySubsidy);
router.get("/mine", protect, authorizeRoles("FARMER"), ctrl.mySubsidyApplications);

router.patch(
  "/applications/:id",
  protect,
  authorizeRoles("ADMIN", "GOV_OFFICIAL"),
  ctrl.updateApplicationStatus
);

module.exports = router;
