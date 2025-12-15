const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
require("dotenv").config();

const connectDB = require("./config/db");
require("./logger");

const authRoutes = require("./routes/authRoutes");
const userjobsRoute = require("./routes/userjobs");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const logRoutes = require("./routes/logRoutes");
const creditsRoutes = require("./routes/creditsRoutes");
const n8nCallbackRoutes = require("./routes/n8nCallback");
const appliedJobsRoutes = require("./routes/appliedJobsRoutes");

const app = express();

/* =====================================================
   🛠 FIX: Trust Proxy (Cloudflare / Hostinger / NGINX)
   ===================================================== */
app.set("trust proxy", 1); 
// Required because your server receives X-Forwarded-For
// and express-rate-limit MUST know the actual client IP.

/* =====================================================
   🔐 Security Middleware
   ===================================================== */

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // each IP can hit 100 times
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later."
});

app.use(limiter);
app.use(compression());

/* =====================================================
   🌍 CORS (must be BEFORE routes)
   ===================================================== */
const allowedOrigins = [
  "https://techm.work.gd",
  "http://localhost:3000", // dev mode
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

/* =====================================================
   🧩 Parsers
   ===================================================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

/* =====================================================
   🗄 Connect MongoDB
   ===================================================== */
connectDB().then(async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map(c => c.name));
  } catch (err) {
    console.error("Error listing collections:", err.message);
  }
});

/* =====================================================
   🚦 ROUTES
   ===================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/userjobs", userjobsRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", userjobsRoute);        // duplicate but OK for backward compatibility
app.use("/api/payment", paymentRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/n8n-callback", n8nCallbackRoutes);
app.use("/api/applied-jobs", appliedJobsRoutes);

// Your Gmail Draft route is inside authRoutes
console.log("✅ All API routes registered");

/* =====================================================
   ❤️ Health Check
   ===================================================== */
app.get(["/", "/api"], (req, res) => {
  res.send("✅ Backend is running fine!");
});

/* =====================================================
   ❌ 404 Handler
   ===================================================== */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =====================================================
   💥 Global Error Handler
   ===================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

/* =====================================================
   🚀 Local Development Server
   ===================================================== */
module.exports = app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}
