const User = require("../models/User");
const Crop = require("../models/Crop");
const Complaint = require("../models/Complaint");
const Order = require("../models/Order");
const SubsidyApplication = require("../models/SubsidyApplication");

// helper: [{_id:'X',count:n}] -> {X:n}
const toMap = (arr) => Object.fromEntries(arr.map((r) => [r._id || "UNKNOWN", r.count]));

exports.summary = async (req, res) => {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6); // last 7 days incl. today

    const [
      users, farmers, buyers, crops, complaints,
      verification, orderStatus, revenueAgg, ordersByDay,
      subsidyStatus, complaintStatus, topCrops,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "FARMER" }),
      User.countDocuments({ role: "BUYER" }),
      Crop.countDocuments(),
      Complaint.countDocuments(),
      User.aggregate([{ $group: { _id: "$verificationStatus", count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $ne: "CANCELLED" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
      ]),
      SubsidyApplication.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $group: { _id: "$cropName", count: { $sum: 1 }, quantity: { $sum: "$quantity" } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // fill all 7 days (including days with no orders)
    const dayMap = Object.fromEntries(ordersByDay.map((d) => [d._id, d]));
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7.push({ date: key, orders: dayMap[key]?.count || 0, revenue: dayMap[key]?.revenue || 0 });
    }

    res.json({
      users, farmers, buyers, crops, complaints, // original fields
      officials: users - farmers - buyers,
      verification: toMap(verification),
      orders: { total: revenueAgg[0]?.count || 0, revenue: revenueAgg[0]?.total || 0, byStatus: toMap(orderStatus) },
      last7,
      subsidyApplications: toMap(subsidyStatus),
      complaintStatus: toMap(complaintStatus),
      topCrops: topCrops.map((c) => ({ name: c._id, orders: c.count, quantity: c.quantity })),
    });
  } catch (e) {
    console.error("ANALYTICS ERROR:", e);
    res.status(500).json({ message: e.message || "Failed to load analytics" });
  }
};
