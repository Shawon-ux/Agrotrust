// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();

const app = express();

// ✅ CORS (frontend)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// ✅ body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ test route
app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend is working" });
});

// ✅ routes
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
app.use("/api/ledger", require("./routes/ledgerRoutes"));
app.use("/api/verification", require("./routes/verificationRoutes"));

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});


app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
