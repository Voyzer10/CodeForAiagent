const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");
const { logToFile, logErrorToFile } = require("./logger");

const app = express();

// ✅ CORS FIRST — must be before any routes
const allowedOrigins = [
  // "https://code-for-aiagent-39q5.vercel.app",
  "http://localhost:3000", // optional for local dev
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ✅ Connect to MongoDB
connectDB().then(async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map((c) => c.name));
  } catch (err) {
    console.error("Error listing collections:", err.message);
  }
});

// ✅ Routes
const authRoutes = require("./routes/authRoutes");
const userjobsRoute = require("./routes/userjobs");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const logRoutes = require("./routes/logRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/userjobs", userjobsRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", userjobsRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/logs", logRoutes);

// // ✅ Health check
// app.get("/", (req, res) => res.send("✅ Backend is running fine!"));

// // ✅ 404 fallback
// app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// ✅ Export for Vercel
module.exports = app;

// ✅ Local run
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}
