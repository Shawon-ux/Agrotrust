// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const { 
  createOrder, 
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders
} = require("../controllers/orderController");

// Allow both BUYER and ADMIN to create orders
router.post("/", protect, authorizeRoles("BUYER", "ADMIN"), createOrder);

// BUYER and ADMIN can get their orders
router.get("/my-orders", protect, authorizeRoles("BUYER", "ADMIN"), getMyOrders);

// FARMER gets their orders
router.get("/farmer-orders", protect, authorizeRoles("FARMER"), getFarmerOrders);

// Admin gets all orders
router.get("/all", protect, authorizeRoles("ADMIN"), getAllOrders);

// Update order status (Farmer or Admin)
router.patch("/:id/status", protect, updateOrderStatus);

// Update payment status (Admin only)
router.patch("/:id/payment", protect, authorizeRoles("ADMIN"), updatePaymentStatus);

module.exports = router;