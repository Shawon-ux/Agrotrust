const Crop = require("../models/Crop");

// These models are optional — only require if you actually have them
let Complaint, Subsidy, Education, Order;
try { Complaint = require("../models/Complaint"); } catch {}
try { Subsidy = require("../models/Subsidy"); } catch {}
try { Education = require("../models/Education"); } catch {}
try { Order = require("../models/Order"); } catch {}

exports.searchAll = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const scope = String(req.query.scope || "all").toLowerCase();

    if (!q) return res.json({ crops: [], complaints: [], subsidies: [], education: [], orders: [] });

    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const out = { crops: [], complaints: [], subsidies: [], education: [], orders: [] };

    const wants = (name) => scope === "all" || scope === name;

    if (wants("crops")) {
      out.crops = await Crop.find({
        $or: [{ cropName: rx }, { location: rx }],
      })
        .sort({ createdAt: -1 })
        .limit(25);
    }

    if (wants("complaints") && Complaint) {
      out.complaints = await Complaint.find({
        $or: [{ type: rx }, { description: rx }, { status: rx }],
      })
        .sort({ createdAt: -1 })
        .limit(25);
    }

    if (wants("subsidies") && Subsidy) {
      out.subsidies = await Subsidy.find({
        $or: [{ programName: rx }, { description: rx }, { status: rx }],
      })
        .sort({ createdAt: -1 })
        .limit(25);
    }

    if (wants("education") && Education) {
      out.education = await Education.find({
        $or: [{ title: rx }, { summary: rx }, { content: rx }, { category: rx }],
      })
        .sort({ createdAt: -1 })
        .limit(25);
    }

    if (wants("orders") && Order) {
      out.orders = await Order.find({
        $or: [{ status: rx }, { cropName: rx }],
      })
        .sort({ createdAt: -1 })
        .limit(25);
    }


    //you can search any crops from here
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message || "Sorry search failed try again" });
  }
};


