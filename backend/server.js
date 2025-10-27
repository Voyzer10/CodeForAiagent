const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { logToFile, logErrorToFile } = require("./logger");

const app = express();

// Allow larger payloads (for big job data)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ✅ CORS setup
app.use(
  cors({
    origin: "https://code-for-aiagent-39q5.vercel.app", // no trailing slash!
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // Handle preflight requests

// ✅ Connect MongoDB
connectDB().then(async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map((c) => c.name));
  } catch (err) {
    console.error("Error listing collections:", err.message);
  }
});

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const userjobsRoute = require("./routes/userjobs");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const logRoutes = require("./routes/logRoutes");

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/userjobs", userjobsRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", userjobsRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/logs", logRoutes); // fixed duplicated path

// ✅ Health check or fallback route
app.get("/", (req, res) => {
  res.send("✅ Backend is running fine!");
});

// ✅ Safe wildcard fallback (Express 5+ compatible)
app.get(/.*/, (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// ✅ Redirect console logs
console.log = function (...args) {
  const message = args.join(" ");
  logToFile(message);
  process.stdout.write(message + "\n");
};

console.error = function (...args) {
  const message = args.join(" ");
  logErrorToFile(message);
  process.stderr.write(message + "\n");
};

// ✅ Start server (only locally, Vercel handles deployment)
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

// ✅ Export for Vercel
module.exports = app;
