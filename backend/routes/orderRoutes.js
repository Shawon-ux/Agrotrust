const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const { createOrder } = require("../controllers/orderController");

// BUYER creates order
router.post("/", protect, authorizeRoles("BUYER"), createOrder);

module.exports = router;
