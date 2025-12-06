const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(list);
};

exports.markRead = async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) return res.status(404).json({ message: "Not found" });
  n.isRead = true;
  await n.save();
  res.json(n);
};

// helper you can call from other controllers
exports.createNotification = async ({ userId, title, message, type = "INFO" }) => {
  return Notification.create({ user: userId, title, message, type });
};
