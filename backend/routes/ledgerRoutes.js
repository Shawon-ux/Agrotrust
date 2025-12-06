const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/ledgerController");

router.get("/", protect, authorizeRoles("ADMIN", "GOV_OFFICIAL"), ctrl.listLedger);
router.post("/", protect, authorizeRoles("ADMIN", "GOV_OFFICIAL"), ctrl.addLedgerEntry);

module.exports = router;
