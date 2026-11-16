// backend/routes/messageRoutes.js — buyer <-> farmer in-app messaging (FR-26)
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Who may talk to whom: BUYER <-> FARMER; ADMIN can talk to anyone.
const allowed = (a, b) => {
  if (a.role === "ADMIN" || b.role === "ADMIN") return true;
  return (a.role === "BUYER" && b.role === "FARMER") || (a.role === "FARMER" && b.role === "BUYER");
};

// GET /api/messages/contacts?q=  -> users you may start a chat with
router.get("/contacts", async (req, res) => {
  try {
    const me = req.user;
    const roles = me.role === "ADMIN" ? ["FARMER", "BUYER", "GOV_OFFICIAL"] : me.role === "FARMER" ? ["BUYER", "ADMIN"] : me.role === "BUYER" ? ["FARMER", "ADMIN"] : ["ADMIN"];
    const q = String(req.query.q || "").trim();
    const filter = { role: { $in: roles }, _id: { $ne: me._id } };
    if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const users = await User.find(filter).select("name role verificationStatus").limit(30);
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/messages/conversations
router.get("/conversations", async (req, res) => {
  try {
    const me = req.user._id;
    const msgs = await Message.find({ $or: [{ from: me }, { to: me }] }).sort({ createdAt: -1 }).limit(500);
    const map = new Map();
    for (const m of msgs) {
      const other = String(m.from) === String(me) ? String(m.to) : String(m.from);
      if (!map.has(other)) map.set(other, { userId: other, last: m, unread: 0 });
      if (String(m.to) === String(me) && !m.readAt) map.get(other).unread++;
    }
    const users = await User.find({ _id: { $in: [...map.keys()] } }).select("name role");
    const byId = Object.fromEntries(users.map((u) => [String(u._id), u]));
    const conversations = [...map.values()]
      .filter((c) => byId[c.userId])
      .map((c) => ({ user: byId[c.userId], lastText: c.last.text, lastAt: c.last.createdAt, unread: c.unread }));
    res.json({ success: true, conversations });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/messages/unread-count
router.get("/unread-count", async (req, res) => {
  const count = await Message.countDocuments({ to: req.user._id, readAt: { $exists: false } });
  res.json({ success: true, count });
});

// GET /api/messages/with/:userId  (marks incoming as read)
router.get("/with/:userId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ message: "Invalid user" });
    const me = req.user._id;
    const other = req.params.userId;
    await Message.updateMany({ from: other, to: me, readAt: { $exists: false } }, { readAt: new Date() });
    const messages = await Message.find({ $or: [{ from: me, to: other }, { from: other, to: me }] })
      .sort({ createdAt: 1 })
      .limit(300);
    const user = await User.findById(other).select("name role");
    res.json({ success: true, user, messages });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/messages  { to, text }
router.post("/", async (req, res) => {
  try {
    const { to, text } = req.body;
    if (!mongoose.isValidObjectId(to)) return res.status(400).json({ message: "Invalid recipient" });
    if (!String(text || "").trim()) return res.status(400).json({ message: "Message cannot be empty" });
    const target = await User.findById(to).select("role");
    if (!target || !allowed(req.user, target)) {
      return res.status(403).json({ message: "You can't message this user" });
    }
    const message = await Message.create({ from: req.user._id, to, text: String(text).trim().slice(0, 2000) });
    res.status(201).json({ success: true, message });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
