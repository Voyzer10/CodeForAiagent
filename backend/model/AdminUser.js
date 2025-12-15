const mongoose = require("mongoose");

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  token: { type: String },

  // 🛡 Security & Monitoring Fields
  loginHistory: [
    {
      ip: String,
      device: String, // e.g., User-Agent
      timestamp: { type: Date, default: Date.now },
      status: { type: String, enum: ['Success', 'Failed'] },
    }
  ],
  whitelistedIPs: [String], // If empty, allow all (except blocked)
  blockedIPs: [String],
  securitySettings: {
    restrictToWhitelist: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("AdminUser", adminUserSchema);
