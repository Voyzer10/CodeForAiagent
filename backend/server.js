const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// Middleware
app.use(cors({
 origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// connect DB
connectDB().then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("📂 Collections in DB:", collections.map(c => c.name));
});

// routes

const authRoutes = require("./routes/authRoutes");
const userjobsRoute = require("./routes/userjobs");
const adminRoutes = require("./routes/adminRoutes"); 
const paymentRoutes = require("./routes/paymentRoutes");
 // ✅ add this

app.use("/api/auth", authRoutes);
app.use("/api/userjobs", userjobsRoute);
app.use("/api/admin", adminRoutes); // ✅ mount admin routes
app.use("/api/jobs", userjobsRoute);
app.use("/api/payment", paymentRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
