const Order = require("../models/Order");
const Crop = require("../models/Crop");
const Payment = require("../models/Payment");

exports.createOrder = async (req, res) => {
  try {
    const { farmerId, items } = req.body; // items: [{ cropId, quantity }]
    let totalAmount = 0;
    const cropsArray = [];

    for (const item of items) {
      const crop = await Crop.findById(item.cropId);
      if (!crop) continue;
      const price = crop.pricePerUnit * item.quantity;
      totalAmount += price;
      cropsArray.push({ crop: crop._id, quantity: item.quantity, price });
    }

    const order = await Order.create({
      buyer: req.user._id,
      farmer: farmerId,
      crops: cropsArray,
      totalAmount,
    });

    const payment = await Payment.create({
      order: order._id,
      amount: totalAmount,
    });

    res.status(201).json({ order, payment });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
