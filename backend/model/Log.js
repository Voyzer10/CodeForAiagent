// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: { type: String, default: "info" }, // info | error
  message: String,
  stack: String,
  route: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
