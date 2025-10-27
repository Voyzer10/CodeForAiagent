const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { logToFile, logErrorToFile } = require("./logger");

const app = express();
// Allow larger payloads (e.g., big job arrays)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
;
app.use(cookieParser());

// Middleware
app.use(cors({
  origin: "https://code-for-aiagent-39q5.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors()); // handle prefligh

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
const logRoutes = require("./routes/logRoutes");
 // ✅ add this

app.use("/api/auth", authRoutes);
app.use("/api/userjobs", userjobsRoute);
app.use("/api/admin", adminRoutes); // ✅ mount admin routes
app.use("/api/jobs", userjobsRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", logRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Redirect console.log
console.log = function (...args) {
  const message = args.join(" ");
  logToFile(message);
  process.stdout.write(message + "\n");
};

// Redirect console.error
console.error = function (...args) {
  const message = args.join(" ");
  logErrorToFile(message);
  process.stderr.write(message + "\n");
};

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
