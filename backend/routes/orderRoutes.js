// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const { 
  createOrder, 
  getMyOrders,
  getFarmerOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderById
} = require("../controllers/orderController");

// BUYER creates order (Cash on delivery)
router.post("/", protect, authorizeRoles("BUYER"), createOrder);

// BUYER gets their orders
router.get("/my-orders", protect, authorizeRoles("BUYER"), getMyOrders);

// FARMER gets their orders
router.get("/farmer-orders", protect, authorizeRoles("FARMER"), getFarmerOrders);

// ADMIN & GOV get all orders
router.get("/all", protect, authorizeRoles("ADMIN", "GOV_OFFICIAL"), getAllOrders);

// Get single order (for all authorized users)
router.get("/:id", protect, getOrderById);

// Update order status (Farmer, Buyer, Admin, Gov)
router.patch("/:id/status", protect, updateOrderStatus);

// Update payment status (Admin only)
router.patch("/:id/payment", protect, authorizeRoles("ADMIN"), updatePaymentStatus);

module.exports = router;