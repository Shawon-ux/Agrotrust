// Demo data for the Market Price Tracker.  Run:  node scripts/seedMarketPrices.js
require("dotenv").config();
const mongoose = require("mongoose");
const MarketPrice = require("../models/MarketPrice");

const crops = { Rice: 52, Wheat: 38, Potato: 28, Tomato: 45, Onion: 60, Maize: 30 };
const regions = ["Dhaka", "Chattogram", "Rajshahi", "Khulna"];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/agrotrust");
  const docs = [];
  for (const [cropName, base] of Object.entries(crops)) {
    for (const region of regions) {
      let price = base * (0.9 + Math.random() * 0.2);
      for (let d = 6; d >= 0; d--) {
        price = Math.max(5, price * (0.97 + Math.random() * 0.06));
        const at = new Date(Date.now() - d * 86400000);
        docs.push({ cropName, region, pricePerUnit: Math.round(price * 10) / 10, createdAt: at, updatedAt: at });
      }
    }
  }
  await MarketPrice.insertMany(docs);
  console.log(`Inserted ${docs.length} demo price entries`);
  await mongoose.disconnect();
})();
