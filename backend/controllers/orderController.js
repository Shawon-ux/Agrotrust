// backend/controllers/orderController.js
const Crop = require("../models/Crop");
const Order = require("../models/Order");

// POST /api/orders (BUYER creates order)
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
      shippingAddress,
      contactNumber,
      notes: notes || "",
      status: "PENDING",
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "PENDING"
    });

    // Reduce crop stock
    crop.quantityAvailable = available - qty;
    crop.status = crop.quantityAvailable > 0 ? "AVAILABLE" : "SOLD_OUT";
    await crop.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Payment: Cash on Delivery.",
      order
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};

// GET /api/orders/my-orders (Get buyer's orders)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("crop", "cropName imageUrl location")
      .populate("farmer", "name phone")
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

// GET /api/orders/all (Admin and Gov only - get all orders)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "GOV_OFFICIAL") {
      return res.status(403).json({ 
        message: "Admin or Government Official only" 
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

    // Check if user has permission 
    // - Farmer can update their own orders
    // - Buyer can cancel their own pending orders
    // - Admin/Gov can update any order
    const isFarmer = order.farmer.toString() === req.user.id;
    const isBuyer = order.buyer.toString() === req.user.id;
    const isAdminOrGov = ["ADMIN", "GOV_OFFICIAL"].includes(req.user.role);
    
    if (!isFarmer && !isBuyer && !isAdminOrGov) {
      return res.status(403).json({ 
        message: "Not authorized to update this order" 
      });
    }

    // Buyer can only cancel pending orders
    if (isBuyer && !isAdminOrGov) {
      if (status !== "CANCELLED" || order.status !== "PENDING") {
        return res.status(403).json({ 
          message: "Buyer can only cancel pending orders" 
        });
      }
    }

    order.status = status;
    
    // If delivered, mark payment as completed for cash on delivery
    if (status === "DELIVERED" && order.paymentMethod === "CASH_ON_DELIVERY") {
      order.paymentStatus = "COMPLETED";
    }
    
    // If cancelled, restore crop quantity
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      const crop = await Crop.findById(order.crop);
      if (crop) {
        crop.quantityAvailable += order.quantity;
        crop.status = crop.quantityAvailable > 0 ? "AVAILABLE" : "SOLD_OUT";
        await crop.save();
      }
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

// GET /api/orders/:id (Get single order details)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate("buyer", "name email phone")
      .populate("farmer", "name email phone")
      .populate("crop", "cropName imageUrl location variety");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission to view this order
    const isBuyer = order.buyer._id.toString() === req.user.id;
    const isFarmer = order.farmer._id.toString() === req.user.id;
    const isAdminOrGov = ["ADMIN", "GOV_OFFICIAL"].includes(req.user.role);
    
    if (!isBuyer && !isFarmer && !isAdminOrGov) {
      return res.status(403).json({ 
        message: "Not authorized to view this order" 
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({ 
      message: err.message || "Server error" 
    });
  }
};