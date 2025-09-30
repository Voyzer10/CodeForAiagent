const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }, // fixed admin role
}, { timestamps: true });

module.exports = mongoose.model("AdminUser", adminUserSchema);