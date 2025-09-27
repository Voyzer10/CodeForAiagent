const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const mongoose = require("mongoose");  // ✅ add this line



const app = express();
app.use(express.json());
// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// connect DB
connectDB().then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("📂 Collections in DB:", collections.map(c => c.name));
});


// routes
const jobsRoute = require("./routes/jobs");
const authRoutes = require("./routes/authRoutes");
const userjobsRoute = require("./routes/userjobs");
app.use("/api/jobs", jobsRoute);
app.use('/api/auth', authRoutes);
app.use('/api/userjobs', userjobsRoute);

// start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
