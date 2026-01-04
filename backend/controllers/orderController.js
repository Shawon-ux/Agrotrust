// backend/controllers/orderController.js
const Crop = require("../models/Crop");
const Order = require("../models/Order");

// POST /api/orders (BUYER or ADMIN creates order)
exports.createOrder = async (req, res) => {
  try {
    const { cropId, quantity, shippingAddress, contactNumber, notes } = req.body;
    const qty = Number(quantity);

    if (!cropId || !qty || qty <= 0) {
      return res.status(400).json({ 
        message: "cropId and valid quantity are required" 
      });
    }

    if (!shippingAddress || !contactNumber) {
      return res.status(400).json({ 
        message: "Shipping address and contact number are required" 
      });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ message: "Crop not found" });

    const available = Number(crop.quantityAvailable ?? 0);
    if (available < qty) {
      return res.status(400).json({ 
        message: `Only ${available} ${crop.unit || "kg"} available` 
      });
    }

    const pricePerUnit = Number(crop.pricePerUnit ?? 0);
    const totalPrice = pricePerUnit * qty;

    // Create order with cash on delivery status
    const order = await Order.create({
      buyer: req.user.id,
      farmer: crop.farmer,
      crop: crop._id,
      cropName: crop.cropName,
      quantity: qty,
      unit: crop.unit || "kg",
      pricePerUnit,
      totalPrice,
      status: "PENDING",
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "PENDING",
      shippingAddress,
      contactNumber,
      notes
    });

    // Reduce crop stock
    crop.quantityAvailable = available - qty;
    crop.status = crop.quantityAvailable > 0 ? "AVAILABLE" : "SOLD_OUT";
    await crop.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Cash on delivery.",
      order
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};

// GET /api/orders/my-orders (Get buyer's or admin's orders)
exports.getMyOrders = async (req, res) => {
  try {
    let query = { buyer: req.user.id };
    
    // If user is admin, also include orders where they might be the farmer
    if (req.user.role === "ADMIN") {
      // Admin can see orders they placed as buyer AND orders where they're the farmer
      query = { $or: [{ buyer: req.user.id }, { farmer: req.user.id }] };
    }
    
    const orders = await Order.find(query)
      .populate("crop", "cropName imageUrl location")
      .populate("farmer", "name phone")
      .populate("buyer", "name phone email")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};

// GET /api/orders/farmer-orders (Get farmer's orders)
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate("buyer", "name phone email")
      .populate("crop", "cropName")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getFarmerOrders error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};

// GET /api/orders/all (Admin only - get all orders)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ 
        message: "Admin only" 
      });
    }

    const orders = await Order.find()
      .populate("buyer", "name email phone")
      .populate("farmer", "name email phone")
      .populate("crop", "cropName imageUrl location")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};

// PATCH /api/orders/:id/status (Update order status)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const allowedStatus = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status" 
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission (farmer can update their orders, admin can update any)
    const isFarmer = order.farmer.toString() === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    
    if (!isFarmer && !isAdmin) {
      return res.status(403).json({ 
        message: "Not authorized to update this order" 
      });
    }

    order.status = status;
    
    // If delivered, mark payment as completed for cash on delivery
    if (status === "DELIVERED" && order.paymentMethod === "CASH_ON_DELIVERY") {
      order.paymentStatus = "COMPLETED";
    }
    
    await order.save();

    res.json({ 
      success: true, 
      message: `Order ${status.toLowerCase()} successfully`,
      order 
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};

// PATCH /api/orders/:id/payment (Update payment status - Admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ 
        message: "Admin only" 
      });
    }

    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const allowedStatus = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];
    
    if (!allowedStatus.includes(paymentStatus)) {
      return res.status(400).json({ 
        message: "Invalid payment status" 
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ 
      success: true, 
      message: "Payment status updated",
      order 
    });
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};