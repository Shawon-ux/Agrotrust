const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const { orderId, farmerId, ratingValue, comment } = req.body;
    const feedback = await Feedback.create({
      order: orderId,
      farmer: farmerId,
      buyer: req.user._id,
      ratingValue,
      comment,
    });
    res.status(201).json(feedback);
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
