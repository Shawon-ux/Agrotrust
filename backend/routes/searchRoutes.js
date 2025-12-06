const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/searchController");

router.get("/", protect, ctrl.search);
module.exports = router;
