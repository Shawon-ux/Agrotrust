const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let Crop;
try {
  Crop = require("../models/Crop");
} catch (e) {
  Crop = require("../models/Crops");
}

const User = require("../models/User");

const crops = [
  {
    cropName: "Rice",
    variety: "BRRI Dhan-28",
    location: "Bogura",
    pricePerUnit: 58,
    quantityAvailable: 1200,
    unit: "kg",
    status: "AVAILABLE",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rice_field_in_Bangladesh.jpg/1200px-Rice_field_in_Bangladesh.jpg",
  },
  {
    cropName: "Wheat",
    variety: "Shatabdi",
    location: "Rajshahi",
    pricePerUnit: 52,
    quantityAvailable: 800,
    unit: "kg",
    status: "AVAILABLE",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Wheat_field.jpg/1200px-Wheat_field.jpg",
  },
  {
    cropName: "Potato",
    variety: "Granola",
    location: "Munshiganj",
    pricePerUnit: 32,
    quantityAvailable: 600,
    unit: "kg",
    status: "AVAILABLE",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Patates.jpg/1200px-Patates.jpg",
  },
  {
    cropName: "Tomato",
    variety: "Hybrid",
    location: "Jashore",
    pricePerUnit: 70,
    quantityAvailable: 0,
    unit: "kg",
    status: "SOLD_OUT",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Tomatoes.jpg?width=1200",
  },
  {
    cropName: "Corn",
    variety: "Sweet Corn",
    location: "Dinajpur",
    pricePerUnit: 45,
    quantityAvailable: 500,
    unit: "kg",
    status: "AVAILABLE",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Corncobs.jpg?width=1200",
  },
  {
    cropName: "Onion",
    variety: "Local",
    location: "Pabna",
    pricePerUnit: 95,
    quantityAvailable: 350,
    unit: "kg",
    status: "AVAILABLE",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Onions.jpg?width=1200",
  },
];

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("❌ MONGO_URI missing in backend/.env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ✅ find a farmer user to attach as required field `farmer`
    let farmerUser = await User.findOne({ role: "FARMER" }).select("_id");
    if (!farmerUser) {
      // fallback: use any user
      farmerUser = await User.findOne({}).select("_id");
    }

    if (!farmerUser) {
      console.log("❌ No users found. Register a farmer/admin first, then seed again.");
      process.exit(1);
    }

    const farmerId = farmerUser._id;
    console.log("✅ Using farmer:", String(farmerId));

    const docs = crops.map((c) => ({
      ...c,
      farmer: farmerId, // ✅ required by schema
    }));

    await Crop.deleteMany({});
    await Crop.insertMany(docs);

    console.log("✅ Seeded crops:", docs.length);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

run();
