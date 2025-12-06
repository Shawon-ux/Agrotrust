// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);
connectDB();

const app = express();

// middlewares
app.use(cors());
app.use(express.json()); 

// simple test route
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend is working" });
});

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/crops", require("./routes/cropRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/subsidies", require("./routes/subsidyRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/education", require("./routes/educationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
